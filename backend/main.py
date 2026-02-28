"""
main.py
Entry point for the Emotion-Sensing Workspace backend.
Runs the sensor polling loop, AI processing pipeline, and WebSocket server.
"""

import asyncio
import threading
import time
import os
import sys

# ── Path setup ────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))

from config import SENSOR_POLL_INTERVAL, BROADCAST_INTERVAL, API_PORT
from sensors.sensor_hub import SensorHub
from ai.emotion_engine import EmotionEngine
from ai.predictor import StressPredictor
from brain.decision_brain import DecisionBrain
from environment.controller import EnvironmentController
from server.ws_server import WebSocketServer

# ── Ensure data directories exist ────────────────────────────────
os.makedirs("data/models", exist_ok=True)
os.makedirs("data/logs", exist_ok=True)

# ── Shared mutable state ──────────────────────────────────────────
_state = {
    "current": {},
    "history": [],
    "config": {"sensor_mode": "full"},
}

# ── Component initialization ──────────────────────────────────────
sensor_hub = SensorHub()
emotion_engine = EmotionEngine()
predictor = StressPredictor()
brain = DecisionBrain()
controller = EnvironmentController()


def build_broadcast_frame(emotion, prediction, mode, env_state, raw) -> dict:
    """Build the full JSON frame sent to React clients."""
    return {
        "timestamp": raw.get("timestamp", time.time()),
        "emotion": emotion,
        "prediction": prediction or {
            "stress_in_15min": 0,
            "alert": False,
            "alert_message": "Collecting data...",
        },
        "mode": mode,
        "environment": env_state,
        "sensors": {
            "heart_rate": raw.get("heart_rate", 72),
            "gsr": raw.get("gsr", 0.4),
            "blink_rate": raw.get("blink_rate", 15),
            "eye_openness": raw.get("eye_openness", 0.65),
            "posture_score": raw.get("posture_score", 75),
            "wpm": raw.get("wpm", 40),
            "error_rate": raw.get("error_rate", 0.05),
            "keystroke_stress_score": raw.get("keystroke_stress_score", 20),
            "face_detected": raw.get("face_detected", False),
            "active_sources": raw.get("active_sources", ["virtual"]),
        },
    }


def sensor_loop():
    """
    Main processing loop. Runs in a background thread.
    Polls sensors → computes emotion → predicts → decides → controls.
    """
    print("[Main] Sensor loop started.")
    while True:
        try:
            raw = sensor_hub.get_unified_reading()
            emotion = emotion_engine.compute(raw)
            predictor.add_reading(emotion)
            prediction = predictor.predict()

            predicted_stress = prediction["stress_in_15min"] if prediction else None
            mode = brain.decide(emotion, predicted_stress)
            controller.apply_mode(mode)

            frame = build_broadcast_frame(
                emotion, prediction, mode, controller.get_state(), raw
            )

            _state["current"] = frame
            _state["history"].append({
                "timestamp": raw["timestamp"],
                "emotion": emotion,
                "mode": mode,
            })
            # Keep last 2000 history entries in memory
            if len(_state["history"]) > 2000:
                _state["history"].pop(0)

        except Exception as e:
            print(f"[Main] Sensor loop error: {e}")

        time.sleep(BROADCAST_INTERVAL)


def run_api_server():
    """Start the FastAPI REST server in a separate thread."""
    try:
        from server.api_server import create_app
        import uvicorn
        app = create_app(_state)
        uvicorn.run(app, host="localhost", port=API_PORT, log_level="warning")
    except Exception as e:
        print(f"[Main] API server error: {e}")


async def main():
    print("=" * 55)
    print("  🧠 Emotion-Sensing Workspace — Backend Starting")
    print("=" * 55)

    # Start sensor loop in background thread
    sensor_thread = threading.Thread(target=sensor_loop, daemon=True)
    sensor_thread.start()

    # Start API server in background thread
    api_thread = threading.Thread(target=run_api_server, daemon=True)
    api_thread.start()

    # Start WebSocket server (async, blocks here)
    ws_server = WebSocketServer(state_provider=lambda: _state["current"])
    print(f"[Main] WebSocket ready | API ready on http://localhost:{API_PORT}")
    print("[Main] Open http://localhost:5173 in browser after starting frontend.\n")
    await ws_server.start()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Main] Shutting down gracefully.")
