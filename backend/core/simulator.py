"""
simulator.py — What-If simulation engine for DecisionOS.
Projects outcomes for each possible operator action given current telemetry.
"""

from typing import Dict, Any, List


def simulate_options(telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """Return full what-if comparison for all 4 actions."""
    sensors = telemetry.get("sensors", {})
    mode = telemetry.get("mode", "NORMAL")

    temp = sensors.get("generator_temperature", 72)
    pressure = sensors.get("pressure", 68)
    flow = sensors.get("flow_rate", 75)

    baseline_risk = "LOW"
    if mode == "FAULT":
        if temp >= 105:
            baseline_risk = "CRITICAL"
        elif temp >= 90:
            baseline_risk = "HIGH"
        else:
            baseline_risk = "MEDIUM"

    options = [
        simulate_action(telemetry, "REDUCE_LOAD_30"),
        simulate_action(telemetry, "INCREASE_COOLANT_FLOW"),
        simulate_action(telemetry, "EMERGENCY_TRIP"),
        simulate_action(telemetry, "DO_NOTHING"),
    ]

    return {
        "scenario": f"Generator Overheating — Coolant Flow Restriction (Mode: {mode})",
        "baselineRisk": baseline_risk,
        "options": options,
        "recommendedAction": "REDUCE_LOAD_30",
    }


def simulate_action(telemetry: Dict[str, Any], action: str) -> Dict[str, Any]:
    """Simulate a single action and return its projected outcome."""
    sensors = telemetry.get("sensors", {})
    temp = sensors.get("generator_temperature", 72)
    pressure = sensors.get("pressure", 68)
    flow = sensors.get("flow_rate", 75)

    if action == "REDUCE_LOAD_30":
        return {
            "action": "REDUCE_LOAD_30",
            "label": "Reduce Load by 30%",
            "outcome": "STABLE",
            "timeToStabilize": "5 min",
            "risk": "LOW",
            "confidence": 0.94,
            "costImpact": "-2.4%",
            "projectedTemperature": round(max(72, temp - 22), 1),
            "projectedPressure": round(min(68, pressure + 12), 1),
            "projectedFlowRate": round(min(75, flow + 20), 1),
            "projectedRisk": "LOW",
            "explanation": (
                "Reducing load by 30% lowers thermal output immediately. "
                "Temperature drops within 5 minutes. Minimal production impact. "
                "Recommended as first response."
            ),
        }

    elif action == "INCREASE_COOLANT_FLOW":
        return {
            "action": "INCREASE_COOLANT_FLOW",
            "label": "Increase Coolant Flow",
            "outcome": "PARTIAL",
            "timeToStabilize": "12 min",
            "risk": "MEDIUM",
            "confidence": 0.71,
            "costImpact": "-0.8%",
            "projectedTemperature": round(max(80, temp - 12), 1),
            "projectedPressure": round(min(65, pressure + 8), 1),
            "projectedFlowRate": round(min(82, flow + 30), 1),
            "projectedRisk": "MEDIUM",
            "explanation": (
                "Forcing higher coolant flow helps but if valve V2 remains restricted, "
                "pump strain increases. Partial recovery expected over 12 minutes. "
                "Valve inspection still required."
            ),
        }

    elif action == "EMERGENCY_TRIP":
        return {
            "action": "EMERGENCY_TRIP",
            "label": "Emergency Trip",
            "outcome": "SAFE",
            "timeToStabilize": "2 min",
            "risk": "HIGH_DISRUPTION",
            "confidence": 0.99,
            "costImpact": "-45.0%",
            "projectedTemperature": 35.0,
            "projectedPressure": 5.0,
            "projectedFlowRate": 0.0,
            "projectedRisk": "CONTAINED",
            "explanation": (
                "Emergency trip immediately isolates the generator. Temperature drops safely. "
                "Full production loss for 4–8 hours. Safe choice if temperature exceeds 120°C. "
                "High operational and financial impact."
            ),
        }

    else:  # DO_NOTHING
        return {
            "action": "DO_NOTHING",
            "label": "No Action",
            "outcome": "CRITICAL_ESCALATION",
            "timeToStabilize": "N/A",
            "risk": "CRITICAL",
            "confidence": 0.97,
            "costImpact": "Unquantifiable",
            "projectedTemperature": round(min(145, temp + 30), 1),
            "projectedPressure": round(max(20, pressure - 20), 1),
            "projectedFlowRate": round(max(0, flow - 30), 1),
            "projectedRisk": "CRITICAL",
            "explanation": (
                "Without intervention, temperature will exceed 130°C within 8 minutes. "
                "Thermal runaway, bearing failure, and generator trip are expected. "
                "Grid Sector 4 faces voltage collapse. DO NOT select this option."
            ),
        }
