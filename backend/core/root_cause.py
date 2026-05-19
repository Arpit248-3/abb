"""
root_cause.py — Root cause analysis engine for DecisionOS.
Identifies the primary fault chain from sensor data and alerts.
"""

from typing import Dict, Any, List


def find_root_cause(telemetry: Dict[str, Any], alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Identify root cause from telemetry + alerts."""
    sensors = telemetry.get("sensors", {})
    mode = telemetry.get("mode", "NORMAL")

    temp = sensors.get("generator_temperature", 0)
    pressure = sensors.get("pressure", 99)
    flow = sensors.get("flow_rate", 99)
    valve = sensors.get("valve_opening", 99)
    vibration = sensors.get("vibration", 0)

    if mode == "NORMAL":
        return {
            "rootCause": "None",
            "confidence": 0.99,
            "summary": "All systems operating within normal parameters. No fault detected.",
            "chain": [],
            "affectedComponents": [],
        }

    if mode == "TRIPPED":
        return {
            "rootCause": "Emergency Trip Executed",
            "confidence": 1.0,
            "summary": "Generator unit was safely tripped by operator action. System is in safe state.",
            "chain": [
                "Operator initiated emergency trip sequence",
                "Generator load disconnected from grid",
                "Coolant flow halted safely",
                "System isolated successfully",
            ],
            "affectedComponents": ["Generator Core", "Grid Sector 4", "Assembly Line A"],
        }

    # Primary pattern: Coolant flow restriction
    if flow <= 55 and valve <= 50:
        confidence = 0.86
        if temp >= 105:
            confidence = 0.96
        elif temp >= 90:
            confidence = 0.91

        chain = []
        if valve <= 50:
            chain.append(f"Valve V2 opening dropped to {valve:.0f}% — below safe threshold (65%)")
        chain.append(f"Coolant flow rate decreased to {flow:.0f} L/min (normal: 68–82 L/min)")
        chain.append(f"Generator core temperature rising: {temp:.0f}°C (normal: 68–78°C)")
        if pressure <= 50:
            chain.append(f"System pressure dropping: {pressure:.0f} bar (normal: 60–75 bar)")
        if vibration >= 0.50:
            chain.append(f"Rotor vibration increasing: {vibration:.2f} g — bearing stress developing")
        chain.append("Downstream Grid Sector 4 receiving reduced power — risk of voltage collapse")

        return {
            "rootCause": "Coolant Flow Restriction",
            "confidence": round(confidence, 2),
            "summary": (
                f"Valve V2 partial closure ({valve:.0f}%) restricted coolant circulation, "
                f"causing generator temperature to rise to {temp:.0f}°C. "
                "This is the single root cause generating all cascading downstream alerts."
            ),
            "chain": chain,
            "affectedComponents": [
                "Valve Assembly (V2)",
                "Cooling Loop",
                "Generator Core",
                "Pressure System",
                "Grid Sector 4",
                "Assembly Conveyor A2",
            ],
        }

    # Secondary pattern: High temperature with unknown cause
    if temp >= 90:
        return {
            "rootCause": "Generator Thermal Overload",
            "confidence": 0.72,
            "summary": f"Generator temperature at {temp:.0f}°C without clear flow restriction. Possible load imbalance.",
            "chain": [
                f"Generator temperature elevated: {temp:.0f}°C",
                "Load may be exceeding generator rating",
                "Cooling system performance marginal",
            ],
            "affectedComponents": ["Generator Core", "Load Distribution"],
        }

    # Generic warning
    return {
        "rootCause": "System Anomaly Detected",
        "confidence": 0.55,
        "summary": "Sensor readings outside normal range. Monitoring for pattern development.",
        "chain": ["Sensor values drifting from baseline", "Cause pattern not yet confirmed"],
        "affectedComponents": [],
    }
