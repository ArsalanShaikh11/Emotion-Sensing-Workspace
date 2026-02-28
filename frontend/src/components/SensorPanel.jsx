import React from "react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { Heart, Zap, Eye, Keyboard, Monitor } from "lucide-react";

function SensorRow({ icon, label, value, unit, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 0", borderBottom: "1px solid var(--bg-border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: color || "var(--text-primary)" }}>
        {value} <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>{unit}</span>
      </div>
    </div>
  );
}

export default function SensorPanel() {
  const sensors = useWorkspaceStore((s) => s.sensors);

  return (
    <div className="card">
      <p className="metric-label" style={{ marginBottom: 14 }}>Live Sensors</p>

      <SensorRow
        icon={<Heart size={13} />} label="Heart Rate"
        value={Math.round(sensors.heart_rate)} unit="BPM"
        color={sensors.heart_rate > 95 ? "#EF4444" : "#10B981"}
      />
      <SensorRow
        icon={<Zap size={13} />} label="Skin Conductance"
        value={(sensors.gsr * 100).toFixed(0)} unit="μS"
        color={sensors.gsr > 0.65 ? "#F59E0B" : "#10B981"}
      />
      <SensorRow
        icon={<Eye size={13} />} label="Blink Rate"
        value={sensors.blink_rate?.toFixed(1)} unit="/min"
        color={sensors.blink_rate > 22 ? "#F59E0B" : undefined}
      />
      <SensorRow
        icon={<Monitor size={13} />} label="Posture"
        value={Math.round(sensors.posture_score)} unit="/ 100"
        color={sensors.posture_score < 50 ? "#EF4444" : "#10B981"}
      />
      <SensorRow
        icon={<Keyboard size={13} />} label="Typing Speed"
        value={sensors.wpm?.toFixed(0)} unit="WPM"
      />

      {/* Active sources */}
      <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(sensors.active_sources || []).map((src) => (
          <span key={src} style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 12,
            background: "var(--bg-accent)", color: "var(--text-secondary)",
            fontWeight: 500, textTransform: "capitalize",
          }}>
            ● {src}
          </span>
        ))}
      </div>
    </div>
  );
}
