/**
 * useWorkspaceStore.js
 * Zustand global state store for the Emotion Workspace dashboard.
 */
import { create } from "zustand";

const DEFAULT_EMOTION = { stress: 0, focus: 0, fatigue: 0 };
const DEFAULT_PREDICTION = {
  stress_in_15min: 0,
  alert: false,
  alert_message: "Collecting data...",
};
const DEFAULT_ENV = {
  light_color: "#F5F5F0",
  light_brightness: 75,
  music: "none",
  dnd: false,
  description: "Normal Mode",
  emoji: "⚪",
};
const DEFAULT_SENSORS = {
  heart_rate: 72,
  gsr: 0.4,
  blink_rate: 15,
  eye_openness: 0.65,
  posture_score: 75,
  wpm: 40,
  error_rate: 0.05,
  keystroke_stress_score: 20,
  face_detected: false,
  active_sources: ["virtual"],
};

export const useWorkspaceStore = create((set) => ({
  // Live state
  emotion: DEFAULT_EMOTION,
  prediction: DEFAULT_PREDICTION,
  mode: "NORMAL",
  environment: DEFAULT_ENV,
  sensors: DEFAULT_SENSORS,

  // Connection
  connectionStatus: "connecting", // "connecting" | "connected" | "disconnected"

  // Rolling history for charts (last 120 readings)
  history: [],

  // Actions
  setFrame: (frame) =>
    set((state) => {
      const newHistory = [
        ...state.history,
        {
          time: new Date(frame.timestamp * 1000).toLocaleTimeString(),
          stress: frame.emotion.stress,
          focus: frame.emotion.focus,
          fatigue: frame.emotion.fatigue,
          mode: frame.mode,
        },
      ].slice(-120);

      return {
        emotion: frame.emotion,
        prediction: frame.prediction,
        mode: frame.mode,
        environment: frame.environment,
        sensors: frame.sensors,
        history: newHistory,
        connectionStatus: "connected",
      };
    }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));
