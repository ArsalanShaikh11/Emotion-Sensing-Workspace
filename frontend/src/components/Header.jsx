import React from "react";
import { NavLink } from "react-router-dom";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { Brain, Activity, BarChart2, Users, BrainCircuit } from "lucide-react";

const modeColors = {
  FOCUS: "var(--mode-focus)",
  RELAX: "var(--mode-relax)",
  BREAK: "var(--mode-break)",
  NORMAL: "var(--mode-normal)",
};

export default function Header() {
  const mode = useWorkspaceStore((s) => s.mode);
  const environment = useWorkspaceStore((s) => s.environment);
  const connectionStatus = useWorkspaceStore((s) => s.connectionStatus);

  const modeColor = modeColors[mode] || "var(--mode-normal)";
  const isConnected = connectionStatus === "connected";

  return (
    <header
      style={{
        background: "rgba(8,13,26,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--bg-border)",
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logomark / Brand - Now clickable to home */}
      <NavLink to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          padding: 8, borderRadius: 8, display: "flex",
          border: "1px solid rgba(16, 185, 129, 0.3)"
        }}>
          <BrainCircuit size={24} color="#10B981" />
        </div>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 800, margin: 0,
            lineHeight: 1.1, fontFamily: "'Space Grotesk', sans-serif"
          }}>
            EmotionSpace
          </h1>
          <div style={{
            fontSize: 10, letterSpacing: "0.1em", color: "var(--text-muted)",
            textTransform: "uppercase", fontWeight: 600
          }}>
            Adaptive Workspace AI
          </div>
        </div>
      </NavLink>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 4 }}>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={14} /> Live
          </span>
        </NavLink>
        <NavLink to="/team" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={14} /> Team
          </span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BarChart2 size={14} /> Analytics
          </span>
        </NavLink>
      </nav>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Mode badge */}
        <div
          style={{
            padding: "4px 12px", borderRadius: 20,
            background: `${modeColor}18`,
            border: `1px solid ${modeColor}44`,
            fontSize: 12, fontWeight: 600, color: modeColor,
            transition: "all 0.5s ease",
          }}
        >
          {environment.emoji} {environment.description}
        </div>
        {/* Connection dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            className={isConnected ? "pulse" : ""}
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isConnected ? "#10B981" : "#EF4444",
            }}
          />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {isConnected ? "Live" : connectionStatus === "connecting" ? "Connecting..." : "Offline"}
          </span>
        </div>
      </div>
    </header>
  );
}
