"""
emotion_engine.py
Fuses all sensor signals into 3 normalized emotional scores (0-100):
  - Stress Score
  - Focus Score
  - Fatigue Score
Uses configurable weighted formulas from config.py.
"""

import sys
import os
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import STRESS_WEIGHTS, FOCUS_WEIGHTS, FATIGUE_WEIGHTS, RESTING_HEART_RATE


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _normalize_hr(heart_rate: float) -> float:
    """Normalize heart rate deviation from resting. Higher HR → higher stress."""
    delta = heart_rate - RESTING_HEART_RATE
    # delta range roughly -17 to +58 → map to 0-1
    return _clamp((delta + 17) / 75, 0.0, 1.0)


class EmotionEngine:
    def compute(self, reading: dict) -> dict:
        """
        Takes a unified sensor reading dict and returns emotion scores.

        Args:
            reading: Output from SensorHub.get_unified_reading()

        Returns:
            dict: { stress, focus, fatigue, timestamp }
        """
        # ── Stress Score ────────────────────────────────────────
        gsr_norm = _clamp(reading["gsr"], 0.0, 1.0)
        hr_norm = _normalize_hr(reading["heart_rate"])
        ks_norm = reading["keystroke_stress_score"] / 100.0
        posture_stress = 1.0 - (_clamp(reading["posture_score"], 0, 100) / 100.0)

        stress = (
            gsr_norm * STRESS_WEIGHTS["gsr"]
            + hr_norm * STRESS_WEIGHTS["heart_rate"]
            + ks_norm * STRESS_WEIGHTS["keystroke"]
            + posture_stress * STRESS_WEIGHTS["posture"]
        ) * 100.0

        # ── Focus Score ─────────────────────────────────────────
        wpm_norm = _clamp(reading["wpm"] / 80.0, 0.0, 1.0)   # baseline 80wpm = focused
        eye_norm = _clamp(reading["eye_openness"], 0.0, 1.0)
        error_penalty = 1.0 - _clamp(reading["error_rate"] / 0.3, 0.0, 1.0)

        focus = (
            wpm_norm * FOCUS_WEIGHTS["wpm"]
            + eye_norm * FOCUS_WEIGHTS["eye_openness"]
            + error_penalty * FOCUS_WEIGHTS["error_rate"]
        ) * 100.0

        # ── Fatigue Score ────────────────────────────────────────
        blink_norm = _clamp(reading["blink_rate"] / 30.0, 0.0, 1.0)  # >30 bpm = fatigued
        eye_fatigue = 1.0 - _clamp(reading["eye_openness"], 0.0, 1.0)
        posture_fatigue = 1.0 - (_clamp(reading["posture_score"], 0, 100) / 100.0)

        fatigue = (
            blink_norm * FATIGUE_WEIGHTS["blink_rate"]
            + eye_fatigue * FATIGUE_WEIGHTS["eye_openness"]
            + posture_fatigue * FATIGUE_WEIGHTS["posture"]
        ) * 100.0

        return {
            "stress": round(_clamp(stress), 1),
            "focus": round(_clamp(focus), 1),
            "fatigue": round(_clamp(fatigue), 1),
            "timestamp": reading["timestamp"],
        }
