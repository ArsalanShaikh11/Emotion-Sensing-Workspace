import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

export default function PredictionBanner() {
  const prediction = useWorkspaceStore((s) => s.prediction);
  if (!prediction) return null;

  const { alert, alert_message, stress_in_15min } = prediction;

  return (
    <AnimatePresence>
      <motion.div
        key={alert ? "alert" : "ok"}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px",
          borderRadius: "var(--radius)",
          background: alert ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
          border: `1px solid ${alert ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
          boxShadow: alert ? "0 0 20px rgba(239,68,68,0.1)" : "0 0 20px rgba(16,185,129,0.05)",
        }}
      >
        {alert
          ? <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
          : <CheckCircle size={20} color="#10B981" style={{ flexShrink: 0 }} />
        }
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: alert ? "#EF4444" : "#10B981"
          }}>
            {alert ? "Burnout Risk Detected" : "Stress Levels Stable"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            {alert_message}
          </div>
        </div>
        <div style={{
          fontSize: 20, fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          color: alert ? "#EF4444" : "#10B981",
        }}>
          {Math.round(stress_in_15min)}
          <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}> /100</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right", minWidth: 60 }}>
          Predicted<br />Stress in 15m
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
