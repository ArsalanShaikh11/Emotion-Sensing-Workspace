"""
controller.py
Environment controller abstraction.
In simulation mode: updates a shared state dict and logs to console.
In Arduino mode: sends serial commands for LED colors.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import MODE_SETTINGS, SENSOR_MODE


class EnvironmentController:
    def __init__(self):
        self._current_mode = "NORMAL"
        self._state = dict(MODE_SETTINGS["NORMAL"])
        self._arduino = None

        if "arduino" in SENSOR_MODE:
            self._init_arduino()

    def _init_arduino(self):
        try:
            import serial
            from config import ARDUINO_PORT, ARDUINO_BAUD
            self._arduino = serial.Serial(ARDUINO_PORT, ARDUINO_BAUD, timeout=1)
            print(f"[Controller] Arduino connected on {ARDUINO_PORT}")
        except Exception as e:
            print(f"[Controller] Arduino not available: {e}")

    def apply_mode(self, mode: str):
        """
        Apply the given workspace mode to the environment.
        Updates internal state. Sends serial command if Arduino connected.
        """
        if mode == self._current_mode:
            return

        settings = MODE_SETTINGS.get(mode, MODE_SETTINGS["NORMAL"])
        self._current_mode = mode
        self._state = dict(settings)

        color = settings["light_color"]
        brightness = settings["light_brightness"]
        music = settings["music"]
        dnd = settings["dnd"]

        print(f"[ENV] {settings['emoji']} {settings['description']} | "
              f"Light: {color} ({brightness}%) | Music: {music} | DND: {dnd}")

        # Send LED color to Arduino if connected
        if self._arduino and self._arduino.is_open:
            try:
                r, g, b = self._hex_to_rgb(color)
                # Scale by brightness
                scale = brightness / 100.0
                r_s, g_s, b_s = int(r * scale), int(g * scale), int(b * scale)
                cmd = f"LED:{r_s},{g_s},{b_s}\n"
                self._arduino.write(cmd.encode())
            except Exception as e:
                print(f"[Controller] Arduino write error: {e}")

    def get_state(self) -> dict:
        """Returns current environment state for WebSocket broadcast."""
        return {
            "light_color": self._state.get("light_color", "#F5F5F0"),
            "light_brightness": self._state.get("light_brightness", 75),
            "music": self._state.get("music", "none"),
            "dnd": self._state.get("dnd", False),
            "description": self._state.get("description", "Normal Mode"),
            "emoji": self._state.get("emoji", "⚪"),
        }

    @staticmethod
    def _hex_to_rgb(hex_color: str):
        h = hex_color.lstrip("#")
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
