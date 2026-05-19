"""
alerts.py — Alert engine and suppression logic for DecisionOS.
Converts raw telemetry into structured alerts, then suppresses
cascading/duplicate alarms under a single primary root-cause alert.
"""

import time
import uuid
from typing import List, Dict, Any


def generate_alerts(telemetry: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate alerts from telemetry sensor readings."""
    sensors = telemetry.get("sensors", {})
    alerts: List[Dict[str, Any]] = []
    ts = telemetry.get("timestamp", time.time())

    temp = sensors.get("generator_temperature", 0)
    pressure = sensors.get("pressure", 99)
    flow = sensors.get("flow_rate", 99)
    vibration = sensors.get("vibration", 0)
    coolant = sensors.get("coolant_level", 99)
    valve = sensors.get("valve_opening", 99)

    if temp >= 105:
        alerts.append(_alert("CRITICAL", "Generator Core Temperature Critical",
            f"Temperature at {temp:.1f}°C — thermal runaway risk imminent.",
            "Generator Core", "Coolant flow restriction", ts))
    elif temp >= 90:
        alerts.append(_alert("WARNING", "Generator Temperature High",
            f"Temperature at {temp:.1f}°C — exceeding safe operating band.",
            "Generator Core", "Check coolant flow and valve position", ts))

    if pressure <= 35:
        alerts.append(_alert("CRITICAL", "System Pressure Critical Low",
            f"Pressure at {pressure:.1f} bar — structural risk.",
            "Pressure System", "Restore coolant flow immediately", ts))
    elif pressure <= 45:
        alerts.append(_alert("WARNING", "System Pressure Low",
            f"Pressure at {pressure:.1f} bar — dropping below threshold.",
            "Pressure System", "Inspect coolant loop", ts))

    if flow <= 35:
        alerts.append(_alert("CRITICAL", "Coolant Flow Rate Critical",
            f"Flow at {flow:.1f} L/min — pump cannot sustain cooling.",
            "Cooling Loop", "Trigger auxiliary pump or reduce load", ts))
    elif flow <= 50:
        alerts.append(_alert("WARNING", "Coolant Flow Rate Low",
            f"Flow at {flow:.1f} L/min — below minimum operational threshold.",
            "Cooling Loop", "Inspect valve V2 and pump assembly", ts))

    if vibration >= 0.90:
        alerts.append(_alert("CRITICAL", "Rotor Vibration Critical",
            f"Vibration at {vibration:.2f} g — bearing damage risk.",
            "Rotor Assembly", "Emergency load reduction or trip", ts))
    elif vibration >= 0.60:
        alerts.append(_alert("WARNING", "Rotor Vibration High",
            f"Vibration at {vibration:.2f} g — monitor closely.",
            "Rotor Assembly", "Reduce load and inspect bearings", ts))

    if coolant <= 45:
        alerts.append(_alert("WARNING", "Coolant Level Low",
            f"Coolant level at {coolant:.1f}% — refill required.",
            "Cooling Loop", "Top up coolant reservoir", ts))

    if valve <= 35:
        alerts.append(_alert("WARNING", "Valve Opening Critically Low",
            f"Valve V2 opening at {valve:.1f}% — restricting flow.",
            "Valve Assembly", "Inspect and reopen valve V2", ts))

    return alerts


def suppress_alerts(alerts: List[Dict[str, Any]], telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """
    Suppress cascading alerts. If temperature + flow + valve are all abnormal,
    the root cause is Coolant Flow Restriction — all other alerts become secondary.
    Returns: { primary, suppressed, all }
    """
    sensors = telemetry.get("sensors", {})
    temp = sensors.get("generator_temperature", 0)
    flow = sensors.get("flow_rate", 99)
    valve = sensors.get("valve_opening", 99)

    # Check if primary root cause pattern matches
    is_coolant_restriction = (temp >= 90 and flow <= 55 and valve <= 45)

    if not alerts:
        return {"primary": None, "suppressed": [], "all": []}

    if is_coolant_restriction and len(alerts) > 1:
        # Find the most critical alert — mark as primary
        primary = _find_most_critical(alerts)
        primary["isPrimary"] = True
        primary["suppressedCount"] = len(alerts) - 1
        primary["relatedAlertIds"] = [a["id"] for a in alerts if a["id"] != primary["id"]]
        primary["suggestedAction"] = "REDUCE_LOAD_30"

        suppressed = []
        for a in alerts:
            if a["id"] != primary["id"]:
                a["isPrimary"] = False
                a["suppressedBy"] = primary["id"]
                suppressed.append(a)

        return {"primary": primary, "suppressed": suppressed, "all": alerts}
    else:
        # No suppression — return first alert as primary
        for i, a in enumerate(alerts):
            a["isPrimary"] = (i == 0)
            a["suppressedCount"] = 0
            a["relatedAlertIds"] = []
        return {"primary": alerts[0] if alerts else None, "suppressed": [], "all": alerts}


def _alert(severity: str, title: str, message: str, source: str, suggested: str, ts: float) -> Dict[str, Any]:
    return {
        "id": str(uuid.uuid4())[:8],
        "title": title,
        "message": message,
        "severity": severity,
        "source": source,
        "timestamp": ts,
        "isPrimary": False,
        "suppressedCount": 0,
        "relatedAlertIds": [],
        "suggestedAction": suggested,
    }


def _find_most_critical(alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
    order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
    return sorted(alerts, key=lambda a: order.get(a["severity"], 9))[0]
