import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Music, BellOff, Bell } from "lucide-react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

const MUSIC_LABELS = {
  lofi: "Lo-Fi Focus",
  ambient: "Ambient / Nature",
  upbeat: "Upbeat Energizer",
  none: "Silence",
};

export default function EnvironmentPanel() {
  const environment = useWorkspaceStore((s) => s.environment);
  const mode = useWorkspaceStore((s) => s.mode);

  const { light_color, light_brightness, music, dnd, description, emoji } = environment;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p className="metric-label">Environment</p>

      {/* Mode title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          key={mode}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${light_color}22`,
            border: `2px solid ${light_color}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
            boxShadow: `0 0 20px ${light_color}33`,
          }}
        >
          {emoji}
        </motion.div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: light_color }}>{description}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Active Mode</div>
        </div>
      </div>

      {/* Light */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
            <Lightbulb size={14} /> Lighting
          </div>
          <span style={{ fontSize: 12, color: light_color, fontWeight: 600 }}>
            {light_brightness}%
          </span>
        </div>
        {/* Color swatch */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            animate={{ backgroundColor: light_color }}
            transition={{ duration: 0.6 }}
            style={{
              width: 28, height: 28, borderRadius: 8,
              boxShadow: `0 0 14px ${light_color}88`,
              flexShrink: 0,
            }}
          />
          {/* Brightness bar */}
          <div style={{ flex: 1, height: 6, background: "var(--bg-accent)", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${light_brightness}%`, backgroundColor: light_color }}
              transition={{ duration: 0.6 }}
              style={{ height: "100%", borderRadius: 3 }}
            />
          </div>
        </div>
      </div>

      {/* Music */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
          <Music size={14} /> Music
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: music === "none" ? "var(--text-muted)" : light_color,
          padding: "3px 10px", borderRadius: 12,
          background: music === "none" ? "transparent" : `${light_color}18`,
        }}>
          {MUSIC_LABELS[music] || music}
        </div>
      </div>

      {/* DND */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
          {dnd ? <BellOff size={14} /> : <Bell size={14} />} Notifications
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: dnd ? "#EF4444" : "#10B981",
          padding: "3px 10px", borderRadius: 12,
          background: dnd ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
        }}>
          {dnd ? "DND On" : "Normal"}
        </div>
      </div>
    </div>
  );
}
