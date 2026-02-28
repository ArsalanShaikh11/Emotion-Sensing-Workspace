import React from "react";
import { motion } from "framer-motion";

const COLORS = {
  stress: { low: "#10B981", mid: "#F59E0B", high: "#EF4444" },
  focus:  { low: "#EF4444", mid: "#F59E0B", high: "#4FC3F7" },
  fatigue:{ low: "#10B981", mid: "#F59E0B", high: "#EF4444" },
};

function getColor(type, value) {
  const c = COLORS[type];
  if (value < 40) return c.low;
  if (value < 70) return c.mid;
  return c.high;
}

/**
 * Circular gauge showing a score 0-100.
 * Props: type ("stress"|"focus"|"fatigue"), value (0-100), label
 */
export default function Gauge({ type, value, label }) {
  const color = getColor(type, value);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div
      className="card"
      style={{ textAlign: "center", padding: "28px 20px", position: "relative", overflow: "hidden" }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: "var(--radius)",
          background: `radial-gradient(ellipse at center, ${color}0A 0%, transparent 70%)`,
          transition: "background 0.5s ease",
          pointerEvents: "none",
        }}
      />

      <p className="metric-label" style={{ marginBottom: 16 }}>{label}</p>

      <div style={{ position: "relative", display: "inline-block" }}>
        <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={65} cy={65} r={radius} fill="none" stroke="var(--bg-accent)" strokeWidth={10} />
          {/* Progress */}
          <motion.circle
            cx={65} cy={65} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        {/* Center value */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.span
            key={Math.round(value)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: 28, fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              color: color,
              lineHeight: 1,
            }}
          >
            {Math.round(value)}
          </motion.span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      {/* Status text */}
      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color }}>
        {value < 40 ? "Low" : value < 70 ? "Moderate" : "High"}
      </div>
    </div>
  );
}
