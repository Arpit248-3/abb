"""
ollama_ai.py — Ollama AI explanation layer for DecisionOS.
Calls local Ollama (llama3.1:8b) to generate human-friendly operator explanations.
Falls back gracefully if Ollama is unavailable.
"""

import requests
import json
from typing import Dict, Any

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.1:8b"
TIMEOUT = 10  # seconds

# Cache last successful explanation to avoid hammering Ollama every tick
_cached_explanation: str = ""
_ollama_available: bool = False


def check_ollama() -> bool:
    """Check if Ollama is running and the model is available."""
    global _ollama_available
    try:
        resp = requests.get("http://localhost:11434/api/tags", timeout=3)
        _ollama_available = resp.status_code == 200
    except Exception:
        _ollama_available = False
    return _ollama_available


def generate_operator_explanation(
    telemetry: Dict[str, Any],
    root_cause: Dict[str, Any],
    recommendation: Dict[str, Any],
    simulations: list,
) -> str:
    """
    Generate a plain-English AI explanation for the operator.
    Falls back to a canned explanation if Ollama is unavailable or times out.
    """
    global _cached_explanation, _ollama_available

    if not _ollama_available:
        return _fallback_explanation(telemetry, root_cause, recommendation)

    sensors = telemetry.get("sensors", {})
    temp = sensors.get("generator_temperature", 72)
    flow = sensors.get("flow_rate", 75)
    pressure = sensors.get("pressure", 68)
    rc = root_cause.get("rootCause", "Unknown")
    action = recommendation.get("label", "No action")
    confidence = recommendation.get("confidence", 0.0)

    prompt = (
        f"You are an industrial control room AI assistant. Explain this situation to an operator in 2-3 sentences:\n"
        f"- Root cause: {rc}\n"
        f"- Generator temperature: {temp:.1f}°C (normal: 68-78°C)\n"
        f"- Coolant flow: {flow:.1f} L/min (normal: 68-82 L/min)\n"
        f"- System pressure: {pressure:.1f} bar (normal: 60-75 bar)\n"
        f"- Recommended action: {action} (confidence: {confidence:.0%})\n"
        f"Be direct, concise, and use plain language. Do not use markdown."
    )

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=TIMEOUT,
        )
        if resp.status_code == 200:
            data = resp.json()
            explanation = data.get("response", "").strip()
            if explanation:
                _cached_explanation = explanation
                return explanation
    except Exception:
        pass

    # Return cached if available
    if _cached_explanation:
        return _cached_explanation

    return _fallback_explanation(telemetry, root_cause, recommendation)


def _fallback_explanation(
    telemetry: Dict[str, Any],
    root_cause: Dict[str, Any],
    recommendation: Dict[str, Any],
) -> str:
    """Canned explanation for when Ollama is offline."""
    sensors = telemetry.get("sensors", {})
    temp = sensors.get("generator_temperature", 72)
    action = recommendation.get("label", "the recommended action")
    mode = telemetry.get("mode", "NORMAL")

    if mode == "NORMAL":
        return "All systems are operating within normal parameters. No intervention required at this time."

    if mode == "TRIPPED":
        return (
            "The generator has been safely tripped and isolated. "
            "Perform a full post-trip inspection before attempting restart. "
            "Confirm valve V2 status and coolant loop integrity."
        )

    return (
        f"AI explanation running in fallback mode. "
        f"The system recommends {action} because generator temperature is at {temp:.0f}°C "
        f"while coolant flow and pressure are dropping, indicating coolant flow restriction caused by Valve V2. "
        f"This action provides the best balance of safety and operational continuity."
    )


def get_cached_explanation() -> str:
    return _cached_explanation or "AI explanation not yet available."
