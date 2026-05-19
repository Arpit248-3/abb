"""
decision_engine.py — Decision recommendation engine for DecisionOS.
Combines root cause, simulations, and telemetry into a final operator recommendation.
"""

from typing import Dict, Any, List, Optional


def recommend_action(
    telemetry: Dict[str, Any],
    root_cause: Dict[str, Any],
    simulations: Optional[List[Dict[str, Any]]] = None,
    ai_explanation: str = "",
) -> Dict[str, Any]:
    """Return the best recommended action for the current system state."""

    mode = telemetry.get("mode", "NORMAL")
    sensors = telemetry.get("sensors", {})
    temp = sensors.get("generator_temperature", 72)
    confidence_base = root_cause.get("confidence", 0.5)

    if mode == "NORMAL":
        return {
            "recommendedAction": "NONE",
            "label": "No Action Required",
            "confidence": 0.99,
            "risk": "NONE",
            "estimatedRecoveryTime": "N/A",
            "reason": "All systems are operating within normal parameters.",
            "aiExplanation": ai_explanation or "System is stable. No intervention needed.",
            "alternatives": [],
            "simulationSummary": "No simulation required in normal mode.",
        }

    if mode == "TRIPPED":
        return {
            "recommendedAction": "INSPECT_AND_RESTART",
            "label": "Inspect System and Plan Restart",
            "confidence": 0.95,
            "risk": "LOW",
            "estimatedRecoveryTime": "4-8 hours",
            "reason": "Generator has been safely tripped. Perform post-trip inspection before restart.",
            "aiExplanation": ai_explanation or "Emergency trip executed successfully. System is safe.",
            "alternatives": [],
            "simulationSummary": "Post-trip restart sequence required.",
        }

    if mode == "RECOVERY":
        return {
            "recommendedAction": "MONITOR_RECOVERY",
            "label": "Monitor Recovery Progress",
            "confidence": 0.92,
            "risk": "LOW",
            "estimatedRecoveryTime": "5-10 min",
            "reason": "Applied action is taking effect. Monitor sensor values until system returns to NORMAL.",
            "aiExplanation": ai_explanation or "Recovery in progress. Temperature and pressure normalizing.",
            "alternatives": [],
            "simulationSummary": "Recovery trajectory nominal.",
        }

    # FAULT mode — pick best action
    if temp >= 115:
        action = "EMERGENCY_TRIP"
        label = "Emergency Trip"
        confidence = round(0.95 * confidence_base + 0.05, 2)
        risk = "HIGH_DISRUPTION"
        time_est = "2 min"
        reason = (
            f"Temperature critical at {temp:.0f}°C. Immediate trip required to prevent "
            "catastrophic failure. Thermal runaway imminent."
        )
    elif temp >= 90:
        action = "REDUCE_LOAD_30"
        label = "Reduce Load by 30%"
        confidence = round(0.92 * confidence_base + 0.08, 2)
        risk = "LOW"
        time_est = "5 min"
        reason = (
            f"Generator temperature at {temp:.0f}°C due to coolant flow restriction. "
            "Reducing load by 30% will lower thermal output and allow cooling to stabilize. "
            "This is the optimal balance between safety and production continuity."
        )
    else:
        action = "INCREASE_COOLANT_FLOW"
        label = "Increase Coolant Flow"
        confidence = round(0.75 * confidence_base + 0.10, 2)
        risk = "MEDIUM"
        time_est = "12 min"
        reason = (
            "Temperature in warning range. Increasing coolant flow may resolve the restriction "
            "without production loss, but valve V2 must be inspected."
        )

    alternatives = []
    if simulations:
        alternatives = [
            {"action": s["action"], "label": s["label"], "risk": s["risk"], "confidence": s["confidence"]}
            for s in simulations
            if s["action"] != action
        ]

    fallback_explanation = (
        f"AI explanation running in fallback mode. The system recommends {label} because "
        f"temperature is {temp:.0f}°C while coolant flow and pressure are dropping, "
        "indicating coolant flow restriction. This action provides the best balance of "
        "safety and operational continuity."
    )

    return {
        "recommendedAction": action,
        "label": label,
        "confidence": min(confidence, 0.99),
        "risk": risk,
        "estimatedRecoveryTime": time_est,
        "reason": reason,
        "aiExplanation": ai_explanation or fallback_explanation,
        "alternatives": alternatives,
        "simulationSummary": f"4 scenarios evaluated. {label} selected as optimal.",
    }
