"""
rules.py
Editable rule table for the Decision Brain.
Rules are evaluated in priority order (lower number = higher priority).
"""

from typing import Callable


def make_rule(name: str, condition: Callable, mode: str, priority: int) -> dict:
    return {"name": name, "condition": condition, "mode": mode, "priority": priority}


# ── Rule Table ────────────────────────────────────────────────────
# Each rule receives: (stress, focus, fatigue, predicted_stress)
# predicted_stress is None if predictor hasn't started yet

RULES = sorted([
    make_rule(
        "Predictive Burnout",
        lambda s, f, fa, ps: ps is not None and ps > 78,
        "RELAX",
        priority=1,
    ),
    make_rule(
        "Critical Stress",
        lambda s, f, fa, ps: s > 78 and f < 35,
        "RELAX",
        priority=2,
    ),
    make_rule(
        "High Stress",
        lambda s, f, fa, ps: s > 65,
        "RELAX",
        priority=3,
    ),
    make_rule(
        "Extreme Fatigue",
        lambda s, f, fa, ps: fa > 78,
        "BREAK",
        priority=4,
    ),
    make_rule(
        "High Fatigue",
        lambda s, f, fa, ps: fa > 60 and s < 50,
        "BREAK",
        priority=5,
    ),
    make_rule(
        "Deep Focus",
        lambda s, f, fa, ps: s < 35 and f > 68 and fa < 45,
        "FOCUS",
        priority=6,
    ),
    make_rule(
        "Good Focus",
        lambda s, f, fa, ps: s < 45 and f > 55,
        "FOCUS",
        priority=7,
    ),
    make_rule(
        "Default",
        lambda s, f, fa, ps: True,
        "NORMAL",
        priority=99,
    ),
], key=lambda r: r["priority"])
