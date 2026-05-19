"""
schemas.py — Pydantic schemas for DecisionOS request/response validation.
"""

from pydantic import BaseModel
from typing import Optional


class ApplyActionRequest(BaseModel):
    action: str  # REDUCE_LOAD_30 | INCREASE_COOLANT_FLOW | EMERGENCY_TRIP | DO_NOTHING


class SimulateRequest(BaseModel):
    action: Optional[str] = None  # If None, simulate all options


class HealthResponse(BaseModel):
    status: str
    ollama: bool
    langgraph: bool
    mode: str
