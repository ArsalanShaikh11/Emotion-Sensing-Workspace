"""
keystroke_tracker.py
Passively monitors keyboard events to derive stress/focus signals.
Metrics: WPM, error rate (backspace ratio), inter-key interval variance.
Runs in a background thread using pynput.
"""

import time
import threading
import statistics
from collections import deque

try:
    from pynput import keyboard as kb
    PYNPUT_AVAILABLE = True
except ImportError:
    PYNPUT_AVAILABLE = False


class KeystrokeTracker:
    WINDOW_SECONDS = 60       # Rolling window for metrics
    MIN_KEYS_FOR_STATS = 5    # Minimum keystrokes before emitting metrics

    def __init__(self):
        self._lock = threading.Lock()
        self._key_times = deque()          # Timestamps of all keystrokes
        self._backspace_times = deque()    # Timestamps of backspace presses
        self._intervals = deque()          # Inter-key intervals (ms)
        self._last_key_time = None
        self._word_count = 0
        self._char_count = 0

        if not PYNPUT_AVAILABLE:
            print("[KeystrokeTracker] pynput not available. Using default values.")
            return

        self._listener = kb.Listener(
            on_press=self._on_press,
            on_release=None,
        )
        self._listener.start()

    def _on_press(self, key):
        now = time.time()
        with self._lock:
            self._key_times.append(now)
            self._backspace_times.append((now, key == kb.Key.backspace))

            if self._last_key_time is not None:
                interval_ms = (now - self._last_key_time) * 1000
                if interval_ms < 2000:  # Ignore gaps > 2s (not typing)
                    self._intervals.append(interval_ms)
            self._last_key_time = now

            # Count words (space or enter = word boundary)
            if key in (kb.Key.space, kb.Key.enter):
                self._word_count += 1
            elif hasattr(key, "char") and key.char:
                self._char_count += 1

        self._prune()

    def _prune(self):
        """Remove entries outside the rolling window."""
        cutoff = time.time() - self.WINDOW_SECONDS
        while self._key_times and self._key_times[0] < cutoff:
            self._key_times.popleft()
        while self._backspace_times and self._backspace_times[0][0] < cutoff:
            self._backspace_times.popleft()
        while len(self._intervals) > 200:
            self._intervals.popleft()

    def get_reading(self) -> dict:
        """
        Returns current keystroke-derived stress/focus metrics.
        """
        if not PYNPUT_AVAILABLE:
            return {
                "wpm": 40.0,
                "error_rate": 0.05,
                "inter_key_variance": 120.0,
                "keystroke_stress_score": 20.0,
                "source": "keyboard",
            }

        with self._lock:
            total_keys = len(self._key_times)
            backspace_count = sum(1 for _, is_bs in self._backspace_times if is_bs)

            # WPM = word count in last 60s
            wpm = max(0.0, self._word_count * (60 / self.WINDOW_SECONDS))
            wpm = round(wpm, 1)

            # Error rate = backspaces / total keys
            error_rate = round(backspace_count / max(total_keys, 1), 3)

            # Inter-key interval variance (ms²)
            variance = 0.0
            if len(self._intervals) >= self.MIN_KEYS_FOR_STATS:
                variance = round(statistics.variance(self._intervals), 1)

            # Keystroke stress score (0-100)
            # High error_rate + high variance + low WPM → high stress
            normalized_error = min(error_rate / 0.25, 1.0) * 100
            normalized_variance = min(variance / 5000, 1.0) * 100
            normalized_wpm_drop = max(0, (50 - wpm) / 50) * 100  # baseline 50wpm
            stress_score = round(
                normalized_error * 0.40
                + normalized_variance * 0.35
                + normalized_wpm_drop * 0.25,
                1,
            )
            stress_score = max(0.0, min(100.0, stress_score))

        return {
            "wpm": wpm,
            "error_rate": error_rate,
            "inter_key_variance": variance,
            "keystroke_stress_score": stress_score,
            "source": "keyboard",
        }

    def stop(self):
        if PYNPUT_AVAILABLE and hasattr(self, "_listener"):
            self._listener.stop()
