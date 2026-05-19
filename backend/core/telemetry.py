"""
telemetry.py — Industrial sensor simulator for DecisionOS.
Manages simulation state (NORMAL / FAULT / RECOVERY / TRIPPED) and generates
realistic telemetry packets that tell a clear physical story.
"""

import time
import math
import random
from typing import Dict, Any

# ── Simulation state ────────────────────────────────────────────────────────
simulation_state: Dict[str, Any] = {
    "mode": "NORMAL",          # NORMAL | FAULT | RECOVERY | TRIPPED
    "fault_tick": 0,           # ticks since fault started
    "recovery_tick": 0,        # ticks since recovery started
    "applied_action": None,    # action currently applied
}

# ── Normal-range midpoints ──────────────────────────────────────────────────
NORMAL = {
    "generator_temperature": 72.0,
    "pressure": 68.0,
    "flow_rate": 75.0,
    "vibration": 0.22,
    "load": 72.0,
    "coolant_level": 88.0,
    "pump_rpm": 1450.0,
    "valve_opening": 75.0,
}

def _jitter(value: float, pct: float = 0.015) -> float:
    """Add small realistic noise (±pct of value)."""
    return round(value + random.uniform(-value * pct, value * pct), 2)


def generate_telemetry() -> Dict[str, Any]:
    """Return a single telemetry packet reflecting the current mode."""
    mode = simulation_state["mode"]
    ft = simulation_state["fault_tick"]
    rt = simulation_state["recovery_tick"]

    if mode == "NORMAL":
        sensors = {k: _jitter(v) for k, v in NORMAL.items()}
        system_status = "NORMAL"

    elif mode == "FAULT":
        simulation_state["fault_tick"] += 1
        progress = min(ft / 30.0, 1.0)   # 0→1 over 30 ticks

        sensors = {
            "generator_temperature": _jitter(NORMAL["generator_temperature"] + progress * 55),
            "pressure":              _jitter(NORMAL["pressure"]              - progress * 35),
            "flow_rate":             _jitter(NORMAL["flow_rate"]             - progress * 45),
            "vibration":             _jitter(NORMAL["vibration"]             + progress * 0.85),
            "load":                  _jitter(NORMAL["load"]                  + progress * 10),
            "coolant_level":         _jitter(NORMAL["coolant_level"]         - progress * 40),
            "pump_rpm":              _jitter(NORMAL["pump_rpm"]              + progress * 250),
            "valve_opening":         _jitter(NORMAL["valve_opening"]         - progress * 55),
        }

        temp = sensors["generator_temperature"]
        if temp >= 105:
            system_status = "CRITICAL"
        elif temp >= 90:
            system_status = "WARNING"
        else:
            system_status = "NORMAL"

    elif mode == "RECOVERY":
        simulation_state["recovery_tick"] += 1
        # How far into fault were we?
        fault_progress = min(simulation_state.get("fault_tick", 30) / 30.0, 1.0)
        recovery_progress = min(rt / 25.0, 1.0)  # ease back to normal over 25 ticks

        action = simulation_state.get("applied_action", "REDUCE_LOAD_30")

        # Recovery speed / depth depends on action
        if action == "REDUCE_LOAD_30":
            temp_recovery_factor = 0.92  # good
        elif action == "INCREASE_COOLANT_FLOW":
            temp_recovery_factor = 0.75  # slower
        else:
            temp_recovery_factor = 1.0   # emergency trip / do nothing — still cooling

        peak_temp = NORMAL["generator_temperature"] + fault_progress * 55
        recovered_temp = peak_temp - (peak_temp - NORMAL["generator_temperature"]) * recovery_progress * temp_recovery_factor

        sensors = {
            "generator_temperature": _jitter(max(recovered_temp, NORMAL["generator_temperature"])),
            "pressure":              _jitter(NORMAL["pressure"]     - (1 - recovery_progress) * fault_progress * 35),
            "flow_rate":             _jitter(NORMAL["flow_rate"]    - (1 - recovery_progress) * fault_progress * 45),
            "vibration":             _jitter(NORMAL["vibration"]    + (1 - recovery_progress) * fault_progress * 0.85),
            "load":                  _jitter(NORMAL["load"]         + (1 - recovery_progress) * fault_progress * 10),
            "coolant_level":         _jitter(NORMAL["coolant_level"]- (1 - recovery_progress) * fault_progress * 40),
            "pump_rpm":              _jitter(NORMAL["pump_rpm"]     + (1 - recovery_progress) * fault_progress * 250),
            "valve_opening":         _jitter(NORMAL["valve_opening"]- (1 - recovery_progress) * fault_progress * 55),
        }

        if recovery_progress >= 1.0:
            simulation_state["mode"] = "NORMAL"
            simulation_state["fault_tick"] = 0
            simulation_state["recovery_tick"] = 0

        temp = sensors["generator_temperature"]
        if temp >= 105:
            system_status = "CRITICAL"
        elif temp >= 85:
            system_status = "WARNING"
        else:
            system_status = "NORMAL"

    elif mode == "TRIPPED":
        # System shut down — values drop to safe levels
        sensors = {
            "generator_temperature": _jitter(35.0),
            "pressure":              _jitter(5.0),
            "flow_rate":             _jitter(0.0, pct=0),
            "vibration":             _jitter(0.05),
            "load":                  0.0,
            "coolant_level":         _jitter(NORMAL["coolant_level"]),
            "pump_rpm":              0.0,
            "valve_opening":         0.0,
        }
        system_status = "NORMAL"

    else:
        sensors = {k: _jitter(v) for k, v in NORMAL.items()}
        system_status = "NORMAL"

    return {
        "timestamp": time.time(),
        "mode": mode,
        "system_status": system_status,
        "sensors": sensors,
        "units": {
            "generator_temperature": "°C",
            "pressure": "bar",
            "flow_rate": "L/min",
            "vibration": "g",
            "load": "%",
            "coolant_level": "%",
            "pump_rpm": "RPM",
            "valve_opening": "%",
        },
    }


def trigger_fault() -> None:
    """Switch the simulator into FAULT mode."""
    simulation_state["mode"] = "FAULT"
    simulation_state["fault_tick"] = 0
    simulation_state["recovery_tick"] = 0
    simulation_state["applied_action"] = None


def reset_system() -> None:
    """Reset simulator to NORMAL mode."""
    simulation_state["mode"] = "NORMAL"
    simulation_state["fault_tick"] = 0
    simulation_state["recovery_tick"] = 0
    simulation_state["applied_action"] = None


def apply_action(action: str) -> None:
    """Apply an operator action — starts recovery or trips the unit."""
    simulation_state["applied_action"] = action
    simulation_state["recovery_tick"] = 0

    if action == "EMERGENCY_TRIP":
        simulation_state["mode"] = "TRIPPED"
    elif action == "DO_NOTHING":
        # Stay in fault — do nothing
        pass
    else:
        simulation_state["mode"] = "RECOVERY"


def get_system_status() -> str:
    return simulation_state["mode"]
