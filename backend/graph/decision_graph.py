"""
decision_graph.py — LangGraph orchestration for DecisionOS.
Uses LangGraph if available, falls back to a linear Python pipeline if not.
"""

from typing import Dict, Any

# Try importing LangGraph — gracefully degrade if not installed
try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False

from core.telemetry import generate_telemetry
from core.alerts import generate_alerts, suppress_alerts
from core.root_cause import find_root_cause
from core.simulator import simulate_options
from core.decision_engine import recommend_action
from core.ollama_ai import generate_operator_explanation, check_ollama


# ── Shared node functions (used by both LangGraph and fallback) ─────────────

def telemetry_node(state: Dict[str, Any]) -> Dict[str, Any]:
    state["telemetry"] = generate_telemetry()
    return state

def alert_node(state: Dict[str, Any]) -> Dict[str, Any]:
    state["alerts"] = generate_alerts(state.get("telemetry", {}))
    return state

def suppression_node(state: Dict[str, Any]) -> Dict[str, Any]:
    result = suppress_alerts(state.get("alerts", []), state.get("telemetry", {}))
    state["suppressed_alerts"] = result.get("suppressed", [])
    state["primary_alert"] = result.get("primary")
    return state

def root_cause_node(state: Dict[str, Any]) -> Dict[str, Any]:
    state["root_cause"] = find_root_cause(
        state.get("telemetry", {}),
        state.get("alerts", [])
    )
    return state

def what_if_node(state: Dict[str, Any]) -> Dict[str, Any]:
    sim_result = simulate_options(state.get("telemetry", {}))
    state["simulations"] = sim_result.get("options", [])
    return state

def risk_score_node(state: Dict[str, Any]) -> Dict[str, Any]:
    # Risk scores are already embedded in simulation options
    state["risk_scores"] = {
        s["action"]: {"risk": s["risk"], "confidence": s["confidence"]}
        for s in state.get("simulations", [])
    }
    return state

def ollama_explain_node(state: Dict[str, Any]) -> Dict[str, Any]:
    telemetry = state.get("telemetry", {})
    root_cause = state.get("root_cause", {})
    recommendation = state.get("recommendation", {})
    simulations = state.get("simulations", [])

    state["ai_explanation"] = generate_operator_explanation(
        telemetry, root_cause, recommendation, simulations
    )
    return state

def decision_node(state: Dict[str, Any]) -> Dict[str, Any]:
    state["recommendation"] = recommend_action(
        state.get("telemetry", {}),
        state.get("root_cause", {}),
        state.get("simulations", []),
        state.get("ai_explanation", ""),
    )
    return state


# ── LangGraph workflow (if available) ───────────────────────────────────────

def _build_graph():
    if not LANGGRAPH_AVAILABLE:
        return None
    try:
        graph = StateGraph(dict)
        graph.add_node("telemetry", telemetry_node)
        graph.add_node("alerts", alert_node)
        graph.add_node("suppression", suppression_node)
        graph.add_node("root_cause", root_cause_node)
        graph.add_node("what_if", what_if_node)
        graph.add_node("risk_score", risk_score_node)
        graph.add_node("ollama_explain", ollama_explain_node)
        graph.add_node("decision", decision_node)

        graph.set_entry_point("telemetry")
        graph.add_edge("telemetry", "alerts")
        graph.add_edge("alerts", "suppression")
        graph.add_edge("suppression", "root_cause")
        graph.add_edge("root_cause", "what_if")
        graph.add_edge("what_if", "risk_score")
        graph.add_edge("risk_score", "ollama_explain")
        graph.add_edge("ollama_explain", "decision")
        graph.add_edge("decision", END)

        return graph.compile()
    except Exception:
        return None


_compiled_graph = None


def run_decision_graph(telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """Run the full decision workflow, using LangGraph if available."""
    global _compiled_graph

    if LANGGRAPH_AVAILABLE:
        if _compiled_graph is None:
            _compiled_graph = _build_graph()
        if _compiled_graph is not None:
            try:
                initial_state = {"telemetry": telemetry}
                result = _compiled_graph.invoke(initial_state)
                return result
            except Exception:
                pass  # fall through to fallback

    return run_fallback_decision_flow(telemetry)


def run_fallback_decision_flow(telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """Linear Python fallback pipeline — same logic, no LangGraph."""
    state: Dict[str, Any] = {"telemetry": telemetry}
    state = alert_node(state)
    state = suppression_node(state)
    state = root_cause_node(state)
    state = what_if_node(state)
    state = risk_score_node(state)
    # Build partial recommendation first (without AI) so ollama_explain can use it
    state["recommendation"] = recommend_action(
        state["telemetry"], state["root_cause"], state["simulations"], ""
    )
    state = ollama_explain_node(state)
    # Now rebuild recommendation with AI explanation
    state["recommendation"] = recommend_action(
        state["telemetry"], state["root_cause"], state["simulations"], state.get("ai_explanation", "")
    )
    return state
