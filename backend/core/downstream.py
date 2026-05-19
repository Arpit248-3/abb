"""
downstream.py — Downstream dependency impact engine for DecisionOS.
Maps sensor state to health/risk of dependent subsystems.
"""

from typing import Dict, Any, List


def get_downstream_impact(telemetry: Dict[str, Any], root_cause: Dict[str, Any] = None) -> Dict[str, Any]:
    """Return health and risk for all downstream subsystems."""
    sensors = telemetry.get("sensors", {})
    mode = telemetry.get("mode", "NORMAL")

    temp = sensors.get("generator_temperature", 72)
    pressure = sensors.get("pressure", 68)
    flow = sensors.get("flow_rate", 75)
    vibration = sensors.get("vibration", 0.22)
    load = sensors.get("load", 72)
    coolant = sensors.get("coolant_level", 88)

    def _health(value, low_bad, high_bad, low_warn=None, high_warn=None, invert=False):
        """Map a sensor value to 0–100 health score."""
        if invert:
            # Higher is worse (e.g. temperature)
            if value >= high_bad:
                return max(0, int(100 - (value - high_bad) * 5))
            elif high_warn and value >= high_warn:
                return 60
            return 90
        else:
            # Lower is worse (e.g. flow, coolant)
            if value <= low_bad:
                return max(0, int(value / low_bad * 30))
            elif low_warn and value <= low_warn:
                return 60
            return 90

    systems = []

    # 1. Generator Core
    gen_health = _health(temp, None, 105, high_warn=85, invert=True)
    systems.append({
        "id": "generator-core",
        "name": "Generator Core",
        "health": gen_health,
        "risk": _risk_from_health(gen_health),
        "status": _status_from_health(gen_health),
        "affectedBy": ["Cooling Loop", "Load Distribution"],
        "explanation": f"Core temperature: {temp:.1f}°C. {'Thermal runaway risk.' if temp >= 105 else 'Elevated temperature.' if temp >= 85 else 'Normal operating range.'}",
    })

    # 2. Cooling Loop
    cool_health = min(_health(flow, 35, 35, low_warn=50), _health(coolant, 30, 30, low_warn=45))
    systems.append({
        "id": "cooling-loop",
        "name": "Cooling Loop",
        "health": cool_health,
        "risk": _risk_from_health(cool_health),
        "status": _status_from_health(cool_health),
        "affectedBy": ["Valve Assembly V2", "Pump Assembly"],
        "explanation": f"Flow: {flow:.1f} L/min, Coolant level: {coolant:.1f}%. {'Critical restriction detected.' if flow <= 35 else 'Flow below threshold.' if flow <= 50 else 'Cooling adequate.'}",
    })

    # 3. Pump Assembly
    pump_rpm = sensors.get("pump_rpm", 1450)
    valve = sensors.get("valve_opening", 75)
    pump_health = _health(valve, 20, 20, low_warn=40)
    systems.append({
        "id": "pump-assembly",
        "name": "Pump Assembly",
        "health": pump_health,
        "risk": _risk_from_health(pump_health),
        "status": _status_from_health(pump_health),
        "affectedBy": ["Valve Assembly V2"],
        "explanation": f"Valve V2 opening: {valve:.1f}%, Pump RPM: {pump_rpm:.0f}. {'Valve critically restricted.' if valve <= 30 else 'Valve partially open.' if valve <= 45 else 'Normal operation.'}",
    })

    # 4. Grid Sector 4 — affected by generator load
    grid_health = 90 if mode == "NORMAL" else (
        20 if temp >= 105 else 50 if temp >= 85 else 75
    )
    if mode == "TRIPPED":
        grid_health = 30
    systems.append({
        "id": "grid-sector-4",
        "name": "Grid Sector 4",
        "health": grid_health,
        "risk": _risk_from_health(grid_health),
        "status": _status_from_health(grid_health),
        "affectedBy": ["Generator Core"],
        "explanation": f"{'Voltage collapse risk — generator output degraded.' if grid_health < 40 else 'Grid receiving reduced output — monitor.' if grid_health < 75 else 'Grid supply nominal.'}",
    })

    # 5. Assembly Conveyor A2
    conv_health = 90 if mode == "NORMAL" else (
        35 if load >= 80 else 65 if load >= 70 else 85
    )
    systems.append({
        "id": "assembly-conveyor-a2",
        "name": "Assembly Conveyor A2",
        "health": conv_health,
        "risk": _risk_from_health(conv_health),
        "status": _status_from_health(conv_health),
        "affectedBy": ["Grid Sector 4"],
        "explanation": f"Conveyor power draw: {'Critical — motor sync failure risk.' if conv_health < 40 else 'Degraded — throughput reduced.' if conv_health < 70 else 'Normal throughput.'}",
    })

    # 6. Safety Relay
    safety_health = 90 if mode == "NORMAL" else (
        10 if mode == "TRIPPED" else 60 if temp >= 90 else 80
    )
    systems.append({
        "id": "safety-relay",
        "name": "Safety Relay",
        "health": safety_health,
        "risk": _risk_from_health(safety_health),
        "status": _status_from_health(safety_health),
        "affectedBy": ["Generator Core", "Grid Sector 4"],
        "explanation": f"{'Safety relay TRIPPED — system isolated.' if mode == 'TRIPPED' else 'Relay armed — monitoring thresholds.' if temp >= 90 else 'Safety relay nominal.'}",
    })

    return {"systems": systems}


def _risk_from_health(health: int) -> str:
    if health >= 80:
        return "LOW"
    elif health >= 55:
        return "MEDIUM"
    elif health >= 30:
        return "HIGH"
    return "CRITICAL"


def _status_from_health(health: int) -> str:
    if health >= 80:
        return "NORMAL"
    elif health >= 55:
        return "WARNING"
    elif health >= 30:
        return "CRITICAL"
    return "FAILED"
