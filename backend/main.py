"""
main.py — DecisionOS FastAPI backend entry point.
Wires all engines, REST endpoints, and WebSocket telemetry stream.
"""

import asyncio
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from core.telemetry import (
    generate_telemetry, trigger_fault, reset_system,
    apply_action as apply_sim_action, simulation_state
)
from core.alerts import generate_alerts, suppress_alerts
from core.root_cause import find_root_cause
from core.simulator import simulate_options, simulate_action
from core.decision_engine import recommend_action
from core.downstream import get_downstream_impact
from core.replay_store import add_replay_point, get_replay, clear_replay
from core.ollama_ai import check_ollama, generate_operator_explanation, get_cached_explanation
from core.schemas import ApplyActionRequest, SimulateRequest
from graph.decision_graph import run_fallback_decision_flow, LANGGRAPH_AVAILABLE

# ── Shared in-memory cache (avoids re-computing on every WS tick) ─────────
_cache: Dict[str, Any] = {}
_ollama_online = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: check Ollama, launch background telemetry broadcaster."""
    global _ollama_online
    _ollama_online = check_ollama()
    asyncio.create_task(_telemetry_loop())
    yield


app = FastAPI(title="DecisionOS Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Active WebSocket connections ────────────────────────────────────────────
_connections: list = []


async def _telemetry_loop():
    """Background task: generate telemetry every second and broadcast to WS clients."""
    while True:
        try:
            telemetry = generate_telemetry()
            alerts_raw = generate_alerts(telemetry)
            suppressed = suppress_alerts(alerts_raw, telemetry)
            root_cause = find_root_cause(telemetry, alerts_raw)
            downstream = get_downstream_impact(telemetry, root_cause)

            # Use cached AI explanation — don't call Ollama every tick
            ai_explanation = get_cached_explanation()
            decision = recommend_action(telemetry, root_cause, [], ai_explanation)

            replay_point = {
                "timestamp": telemetry["timestamp"],
                "mode": telemetry["mode"],
                "system_status": telemetry["system_status"],
                "sensors": telemetry["sensors"],
                "primaryAlert": suppressed.get("primary"),
                "recommendedAction": decision.get("recommendedAction"),
            }
            add_replay_point(replay_point)

            payload = {
                "telemetry": telemetry,
                "alerts": suppressed.get("all", []),
                "primaryAlert": suppressed.get("primary"),
                "suppressedAlerts": suppressed.get("suppressed", []),
                "rootCause": root_cause,
                "decision": decision,
                "downstream": downstream,
                "replayPoint": replay_point,
            }
            _cache["latest"] = payload

            # Broadcast to all connected WebSocket clients
            dead = []
            for ws in _connections:
                try:
                    await ws.send_json(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                _connections.remove(ws)

        except Exception as e:
            pass  # never crash the loop

        await asyncio.sleep(1)


def _get_full_state() -> Dict[str, Any]:
    """Return the latest cached state, or compute fresh if cache is empty."""
    if "latest" in _cache:
        return _cache["latest"]
    telemetry = generate_telemetry()
    alerts_raw = generate_alerts(telemetry)
    suppressed = suppress_alerts(alerts_raw, telemetry)
    root_cause = find_root_cause(telemetry, alerts_raw)
    downstream = get_downstream_impact(telemetry, root_cause)
    decision = recommend_action(telemetry, root_cause, [], "")
    return {
        "telemetry": telemetry,
        "alerts": suppressed.get("all", []),
        "primaryAlert": suppressed.get("primary"),
        "suppressedAlerts": suppressed.get("suppressed", []),
        "rootCause": root_cause,
        "decision": decision,
        "downstream": downstream,
        "replayPoint": None,
    }


# ── REST Endpoints ──────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    global _ollama_online
    _ollama_online = check_ollama()
    return {
        "status": "running",
        "ollama": _ollama_online,
        "langgraph": LANGGRAPH_AVAILABLE,
        "mode": simulation_state.get("mode", "NORMAL"),
    }


@app.get("/api/telemetry/current")
def get_current_telemetry():
    return generate_telemetry()


@app.get("/api/state")
def get_full_state():
    """Single endpoint to hydrate the entire frontend at once."""
    state = _get_full_state()
    sims = simulate_options(state["telemetry"])
    state["simulations"] = sims.get("options", [])
    state["replay"] = get_replay()
    return state


@app.post("/api/fault/trigger")
def trigger_fault_endpoint():
    trigger_fault()
    _cache.clear()
    telemetry = generate_telemetry()
    alerts_raw = generate_alerts(telemetry)
    suppressed = suppress_alerts(alerts_raw, telemetry)
    root_cause = find_root_cause(telemetry, alerts_raw)
    sims = simulate_options(telemetry)
    ai_exp = generate_operator_explanation(telemetry, root_cause, {}, sims.get("options", []))
    decision = recommend_action(telemetry, root_cause, sims.get("options", []), ai_exp)
    downstream = get_downstream_impact(telemetry, root_cause)
    return {
        "status": "fault_triggered",
        "telemetry": telemetry,
        "alerts": suppressed.get("all", []),
        "primaryAlert": suppressed.get("primary"),
        "rootCause": root_cause,
        "decision": decision,
        "simulations": sims.get("options", []),
        "downstream": downstream,
    }


@app.post("/api/system/reset")
def reset_system_endpoint():
    reset_system()
    clear_replay()
    _cache.clear()
    return {"status": "reset", "mode": "NORMAL"}


@app.get("/api/alerts")
def get_alerts():
    state = _get_full_state()
    return {
        "alerts": state.get("alerts", []),
        "primaryAlert": state.get("primaryAlert"),
        "suppressedAlerts": state.get("suppressedAlerts", []),
    }


@app.get("/api/root-cause")
def get_root_cause():
    state = _get_full_state()
    return state.get("rootCause", {})


@app.get("/api/decisions")
def get_decisions():
    state = _get_full_state()
    telemetry = state.get("telemetry", {})
    root_cause = state.get("rootCause", {})
    sims = simulate_options(telemetry)
    ai_exp = generate_operator_explanation(telemetry, root_cause, {}, sims.get("options", []))
    decision = recommend_action(telemetry, root_cause, sims.get("options", []), ai_exp)
    return decision


@app.post("/api/simulate")
def run_simulation(req: SimulateRequest):
    state = _get_full_state()
    telemetry = state.get("telemetry", {})
    if req.action:
        return {"option": simulate_action(telemetry, req.action)}
    return simulate_options(telemetry)


@app.post("/api/apply-action")
def apply_action_endpoint(req: ApplyActionRequest):
    apply_sim_action(req.action)
    _cache.clear()
    telemetry = generate_telemetry()
    alerts_raw = generate_alerts(telemetry)
    suppressed = suppress_alerts(alerts_raw, telemetry)
    root_cause = find_root_cause(telemetry, alerts_raw)
    ai_exp = generate_operator_explanation(telemetry, root_cause, {}, [])
    decision = recommend_action(telemetry, root_cause, [], ai_exp)
    downstream = get_downstream_impact(telemetry, root_cause)
    return {
        "status": "action_applied",
        "action": req.action,
        "mode": simulation_state.get("mode"),
        "telemetry": telemetry,
        "rootCause": root_cause,
        "decision": decision,
        "downstream": downstream,
        "alerts": suppressed.get("all", []),
    }


@app.get("/api/downstream")
def get_downstream():
    state = _get_full_state()
    telemetry = state.get("telemetry", {})
    root_cause = state.get("rootCause", {})
    return get_downstream_impact(telemetry, root_cause)


@app.get("/api/replay")
def get_replay_endpoint():
    return get_replay()


@app.post("/api/demo/auto")
def demo_auto():
    """Quick-start the demo: trigger fault and return full state."""
    trigger_fault()
    _cache.clear()
    return trigger_fault_endpoint()


@app.post("/api/demo/start")
def demo_start():
    reset_system()
    clear_replay()
    _cache.clear()
    return {"status": "demo_ready", "mode": "NORMAL", "message": "System reset. Trigger fault when ready."}


# ── WebSocket Endpoint ──────────────────────────────────────────────────────

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    _connections.append(websocket)
    try:
        # Send current state immediately on connect
        if "latest" in _cache:
            await websocket.send_json(_cache["latest"])
        while True:
            # Keep connection alive — data is pushed by _telemetry_loop
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        if websocket in _connections:
            _connections.remove(websocket)
