import React from "react";
import Gauge from "../components/Gauge";
import BiometricChart from "../components/BiometricChart";
import PredictionBanner from "../components/PredictionBanner";
import EnvironmentPanel from "../components/EnvironmentPanel";
import SensorPanel from "../components/SensorPanel";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

export default function Dashboard() {
  const emotion = useWorkspaceStore((s) => s.emotion);
  const connectionStatus = useWorkspaceStore((s) => s.connectionStatus);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Offline notice */}
      {connectionStatus !== "connected" && (
        <div style={{
          padding: "10px 16px",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-sm)",
          fontSize: 13, color: "#F87171",
        }}>
          ⚠️ Backend not connected. Start the Python backend: <code>python backend/main.py</code>
        </div>
      )}

      {/* Prediction Banner */}
      <PredictionBanner />

      {/* Gauges row */}
      <div className="dashboard-grid">
        <Gauge type="stress"  value={emotion.stress}  label="Stress Score"  />
        <Gauge type="focus"   value={emotion.focus}   label="Focus Score"   />
        <Gauge type="fatigue" value={emotion.fatigue} label="Fatigue Score" />
      </div>

      {/* Chart + Environment */}
      <div className="dashboard-grid-2">
        <BiometricChart />
        <EnvironmentPanel />
      </div>

      {/* Sensor Panel */}
      <SensorPanel />

    </div>
  );
}
