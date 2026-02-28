"""
sensor_hub.py
Central aggregator. Pulls from all active sensors and merges
into a single unified reading dict on every call.
"""

import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import SENSOR_MODE, RESTING_HEART_RATE

from sensors.virtual_sensor import VirtualSensor

# Optional imports
_face_tracker = None
_keystroke_tracker = None


def _init_sensors(mode: str):
    global _face_tracker, _keystroke_tracker
    if "camera" in mode or "full" in mode:
        try:
            from sensors.face_tracker import FaceTracker
            _face_tracker = FaceTracker()
            print("[SensorHub] FaceTracker initialized.")
        except Exception as e:
            print(f"[SensorHub] FaceTracker failed: {e}")

    if "keyboard" in mode or "full" in mode:
        try:
            from sensors.keystroke_tracker import KeystrokeTracker
            _keystroke_tracker = KeystrokeTracker()
            print("[SensorHub] KeystrokeTracker initialized.")
        except Exception as e:
            print(f"[SensorHub] KeystrokeTracker failed: {e}")


class SensorHub:
    def __init__(self, mode: str = SENSOR_MODE):
        self._mode = mode
        self._virtual = VirtualSensor()
        _init_sensors(mode)
        print(f"[SensorHub] Started in mode: {mode}")

    def get_unified_reading(self) -> dict:
        """
        Merges all active sensor readings into one unified schema.

        Returns:
            dict: Unified reading with all fields populated.
        """
        now = time.time()
        reading = {
            "timestamp": now,
            # Defaults (overridden by real sources below)
            "heart_rate": 72.0,
            "gsr": 0.4,
            "blink_rate": 15.0,
            "eye_openness": 0.65,
            "posture_score": 75.0,
            "head_tilt": 0.0,
            "face_detected": False,
            "wpm": 40.0,
            "error_rate": 0.05,
            "inter_key_variance": 120.0,
            "keystroke_stress_score": 20.0,
            "active_sources": [],
        }

        # Virtual sensor always provides HR + GSR baseline
        virtual = self._virtual.get_reading()
        reading["heart_rate"] = virtual["heart_rate"]
        reading["gsr"] = virtual["gsr"]
        reading["active_sources"].append("virtual")

        # Camera
        if _face_tracker is not None:
            try:
                face = _face_tracker.get_reading()
                reading["blink_rate"] = face["blink_rate"]
                reading["eye_openness"] = face["eye_openness"]
                reading["posture_score"] = face["posture_score"]
                reading["head_tilt"] = face["head_tilt"]
                reading["face_detected"] = face["face_detected"]
                if face["face_detected"]:
                    reading["active_sources"].append("camera")
            except Exception as e:
                print(f"[SensorHub] Face read error: {e}")

        # Keyboard
        if _keystroke_tracker is not None:
            try:
                ks = _keystroke_tracker.get_reading()
                reading["wpm"] = ks["wpm"]
                reading["error_rate"] = ks["error_rate"]
                reading["inter_key_variance"] = ks["inter_key_variance"]
                reading["keystroke_stress_score"] = ks["keystroke_stress_score"]
                reading["active_sources"].append("keyboard")
            except Exception as e:
                print(f"[SensorHub] Keystroke read error: {e}")

        return reading
