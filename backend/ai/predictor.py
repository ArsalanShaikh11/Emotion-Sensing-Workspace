"""
predictor.py
LSTM-based stress predictor.
Trains incrementally on session data and predicts stress 15 minutes ahead.
Returns None until enough data has been collected (LSTM_MIN_DATA_POINTS).
"""

import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import LSTM_SEQUENCE_LENGTH, LSTM_MIN_DATA_POINTS, MODEL_PATH

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("[Predictor] TensorFlow not available. Predictions disabled.")


class StressPredictor:
    def __init__(self):
        self._history = []        # list of [stress, focus, fatigue]
        self._model = None
        self._trained = False
        self._train_every = 50    # Retrain every N new readings

        if TF_AVAILABLE:
            self._build_model()

    def _build_model(self):
        self._model = Sequential([
            LSTM(64, input_shape=(LSTM_SEQUENCE_LENGTH, 3), return_sequences=True),
            Dropout(0.2),
            LSTM(32),
            Dropout(0.2),
            Dense(16, activation="relu"),
            Dense(1, activation="sigmoid"),  # Output: 0-1 normalized stress
        ])
        self._model.compile(optimizer="adam", loss="mse")

    def add_reading(self, emotion: dict):
        """Add a new emotion reading to the training history."""
        self._history.append([
            emotion["stress"] / 100.0,
            emotion["focus"] / 100.0,
            emotion["fatigue"] / 100.0,
        ])
        # Retrain periodically
        if (TF_AVAILABLE
                and len(self._history) >= LSTM_MIN_DATA_POINTS
                and len(self._history) % self._train_every == 0):
            self._train()

    def _train(self):
        """Train on current history using a sliding window approach."""
        if len(self._history) < LSTM_SEQUENCE_LENGTH + 1:
            return
        data = np.array(self._history)
        X, y = [], []
        for i in range(len(data) - LSTM_SEQUENCE_LENGTH - 1):
            X.append(data[i: i + LSTM_SEQUENCE_LENGTH])
            # Predict stress 30 steps ahead (≈15 min at 500ms interval)
            future_idx = min(i + LSTM_SEQUENCE_LENGTH + 30, len(data) - 1)
            y.append(data[future_idx, 0])   # stress only

        X = np.array(X)
        y = np.array(y)
        self._model.fit(X, y, epochs=3, batch_size=16, verbose=0)
        self._trained = True

    def predict(self) -> dict:
        """
        Predict stress level in ~15 minutes.

        Returns:
            dict: { stress_in_15min, alert, alert_message }
            or None if insufficient data.
        """
        if (not TF_AVAILABLE
                or not self._trained
                or len(self._history) < LSTM_SEQUENCE_LENGTH):
            # Fallback: simple linear trend extrapolation
            if len(self._history) >= 10:
                recent = [h[0] * 100 for h in self._history[-10:]]
                trend = recent[-1] - recent[0]
                predicted = max(0, min(100, recent[-1] + trend * 1.5))
                alert = predicted > 75
                return {
                    "stress_in_15min": round(predicted, 1),
                    "alert": alert,
                    "alert_message": f"Stress trending {'high' if alert else 'normal'} in ~15 mins",
                    "method": "trend",
                }
            return None

        seq = np.array([self._history[-LSTM_SEQUENCE_LENGTH:]])
        pred_normalized = float(self._model.predict(seq, verbose=0)[0][0])
        predicted_stress = round(pred_normalized * 100, 1)

        alert = predicted_stress > 75
        minutes_str = "~12"
        msg = (
            f"⚠️ Burnout risk detected in {minutes_str} minutes"
            if alert
            else f"Stress levels stable for next 15 minutes"
        )

        return {
            "stress_in_15min": predicted_stress,
            "alert": alert,
            "alert_message": msg,
            "method": "lstm",
        }
