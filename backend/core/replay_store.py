"""
replay_store.py — In-memory replay timeline store for DecisionOS.
Maintains a rolling window of the last 300 state snapshots.
"""

from collections import deque
from typing import List, Dict, Any

# Rolling window — max 300 data points (~5 minutes at 1 tick/sec)
_replay_store: deque = deque(maxlen=300)


def add_replay_point(point: Dict[str, Any]) -> None:
    """Append a new telemetry snapshot to the replay timeline."""
    _replay_store.append(point)


def get_replay() -> Dict[str, Any]:
    """Return the full replay timeline."""
    return {"timeline": list(_replay_store)}


def get_replay_at_index(index: int) -> Dict[str, Any]:
    """Return a specific replay point by index (0 = oldest)."""
    items = list(_replay_store)
    if 0 <= index < len(items):
        return items[index]
    return {}


def clear_replay() -> None:
    """Clear the replay store (used on system reset)."""
    _replay_store.clear()
