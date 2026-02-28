"""
virtual_sensor.py
Generates realistic simulated physiological data.
Used when no hardware is connected. Mimics real sensor behavior using
sine waves + gaussian noise + periodic stress spikes for demo purposes.
"""

import math
import random
import time


class VirtualSensor:
    def __init__(self):
        self._start_time = time.time()
        self._spike_active = False
        self._spike_end_time = 0
        self._next_spike_time = time.time() + random.uniform(30, 60)

    def _elapsed(self) -> float:
        return time.time() - self._start_time

    def _check_spike(self):
        """Periodically inject a stress spike for demo purposes."""
        now = time.time()
        if now >= self._next_spike_time and not self._spike_active:
            self._spike_active = True
            self._spike_end_time = now + random.uniform(15, 25)
        if self._spike_active and now > self._spike_end_time:
            self._spike_active = False
            self._next_spike_time = now + random.uniform(60, 120)

    def get_reading(self) -> dict:
        """
        Returns simulated physiological readings every call.

        Returns:
            dict with keys: heart_rate, gsr, source
        """
        self._check_spike()
        t = self._elapsed()
        spike_multiplier = 1.45 if self._spike_active else 1.0

        heart_rate = int(
            (72 + 12 * math.sin(t / 30) + random.gauss(0, 2))
            * spike_multiplier
        )
        heart_rate = max(55, min(130, heart_rate))

        gsr = (
            (0.38 + 0.28 * math.sin(t / 45) + random.gauss(0, 0.04))
            * spike_multiplier
        )
        gsr = round(max(0.0, min(1.0, gsr)), 3)

        return {
            "heart_rate": heart_rate,
            "gsr": gsr,
            "spike_active": self._spike_active,
            "source": "virtual",
        }
