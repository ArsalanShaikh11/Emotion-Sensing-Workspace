# config.py — Central configuration for Emotion-Sensing Workspace

# ─── Sensor Mode ────────────────────────────────────────────────
# Options: "virtual" | "camera" | "keyboard" | "full" | "arduino"
# "virtual"  → Only simulated data (no hardware required)
# "camera"   → Webcam + virtual HR/GSR
# "keyboard" → Keystroke tracking + virtual HR/GSR
# "full"     → Camera + Keyboard + virtual HR/GSR
# "arduino"  → Full + real Arduino sensors
SENSOR_MODE = "full"

# ─── Arduino (only used if SENSOR_MODE includes "arduino") ──────
ARDUINO_PORT = "COM3"          # Windows: COM3/COM4, Linux: /dev/ttyUSB0
ARDUINO_BAUD = 9600

# ─── Server Ports ────────────────────────────────────────────────
WEBSOCKET_PORT = 8765
API_PORT = 8000
WEBSOCKET_HOST = "localhost"

# ─── Loop Timing ─────────────────────────────────────────────────
SENSOR_POLL_INTERVAL = 0.1     # seconds (100ms)
BROADCAST_INTERVAL = 0.5       # seconds (500ms)

# ─── AI / ML ─────────────────────────────────────────────────────
LSTM_SEQUENCE_LENGTH = 30      # Number of readings to feed LSTM
LSTM_MIN_DATA_POINTS = 60      # Min readings before predictions start
PREDICTION_HORIZON_MINUTES = 15
MODEL_PATH = "data/models/lstm_model.h5"

# ─── History ─────────────────────────────────────────────────────
HISTORY_CSV_PATH = "data/history.csv"
MAX_HISTORY_RECORDS = 10000

# ─── Emotion Engine Weights ──────────────────────────────────────
STRESS_WEIGHTS = {
    "gsr": 0.35,
    "heart_rate": 0.25,
    "keystroke": 0.25,
    "posture": 0.15,
}

FOCUS_WEIGHTS = {
    "wpm": 0.40,
    "eye_openness": 0.30,
    "error_rate": 0.30,
}

FATIGUE_WEIGHTS = {
    "blink_rate": 0.50,
    "eye_openness": 0.30,
    "posture": 0.20,
}

# ─── Heart Rate Baseline (resting) ───────────────────────────────
RESTING_HEART_RATE = 72

# ─── Workspace Mode Environment Settings ─────────────────────────
MODE_SETTINGS = {
    "FOCUS": {
        "light_color": "#4FC3F7",
        "light_brightness": 90,
        "music": "lofi",
        "dnd": True,
        "description": "Deep Focus Mode",
        "emoji": "🔵",
    },
    "RELAX": {
        "light_color": "#FFB347",
        "light_brightness": 40,
        "music": "ambient",
        "dnd": False,
        "description": "Relax Mode",
        "emoji": "🟠",
    },
    "BREAK": {
        "light_color": "#81C784",
        "light_brightness": 70,
        "music": "upbeat",
        "dnd": False,
        "description": "Break Time",
        "emoji": "🟢",
    },
    "NORMAL": {
        "light_color": "#F5F5F0",
        "light_brightness": 75,
        "music": "none",
        "dnd": False,
        "description": "Normal Mode",
        "emoji": "⚪",
    },
}
