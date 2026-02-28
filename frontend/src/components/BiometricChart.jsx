import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-accent)", border: "1px solid var(--bg-border)",
      borderRadius: 8, padding: "10px 14px", fontSize: 12,
    }}>
      <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {Math.round(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function BiometricChart() {
  const history = useWorkspaceStore((s) => s.history);

  return (
    <div className="card" style={{ padding: "20px 16px 12px" }}>
      <p className="metric-label" style={{ marginBottom: 16, paddingLeft: 4 }}>Live Biometrics (last 60s)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={history} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)", paddingTop: 8 }}
          />
          <Line
            type="monotone" dataKey="stress" name="Stress"
            stroke="#EF4444" strokeWidth={2} dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone" dataKey="focus" name="Focus"
            stroke="#4FC3F7" strokeWidth={2} dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone" dataKey="fatigue" name="Fatigue"
            stroke="#F59E0B" strokeWidth={2} dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
