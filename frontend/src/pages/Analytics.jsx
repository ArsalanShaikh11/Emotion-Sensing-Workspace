import React, { useEffect, useState } from "react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import axios from "axios";

const API = "http://localhost:8000";

export default function Analytics() {
  const history = useWorkspaceStore((s) => s.history);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/stats/today`)
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  // Build mode distribution from local history
  const modeCounts = history.reduce((acc, h) => {
    if (h.mode) {
      acc[h.mode] = (acc[h.mode] || 0) + 1;
    }
    return acc;
  }, { NORMAL: 0, FOCUS: 0, RELAX: 0, BREAK: 0, STRESSED: 0 });

  const modeData = Object.entries(modeCounts).map(([name, count]) => ({ name, count }));
  const modeColors = { FOCUS: "#4FC3F7", RELAX: "#FFB347", BREAK: "#81C784", NORMAL: "#8B9EC7", STRESSED: "#EF4444" };

  // Last 20 readings for mini bar chart
  const recentData = history.slice(-20).map((h, i) => ({
    i,
    stress: h.stress,
    focus: h.focus,
  }));

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22 }}>
          Analytics
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Session insights and productivity patterns
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="dashboard-grid">
          {[
            { label: "Avg Stress", value: stats.avg_stress, color: "#EF4444", unit: "/100" },
            { label: "Avg Focus",  value: stats.avg_focus,  color: "#4FC3F7", unit: "/100" },
            { label: "Peak Stress",value: stats.peak_stress,color: "#F59E0B", unit: "/100" },
          ].map((item) => (
            <div key={item.label} className="card" style={{ textAlign: "center" }}>
              <p className="metric-label" style={{ marginBottom: 10 }}>{item.label}</p>
              <div style={{
                fontSize: 36, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: item.color,
              }}>
                {item.value}
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode distribution */}
      {modeData.length > 0 && (
        <div className="card">
          <p className="metric-label" style={{ marginBottom: 16 }}>Mode Distribution (This Session)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={modeData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--bg-accent)", border: "1px solid var(--bg-border)", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" name="Readings" radius={[4, 4, 0, 0]}>
                {modeData.map((entry) => (
                  <Cell key={entry.name} fill={modeColors[entry.name] || "#8B9EC7"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent stress vs focus */}
      {recentData.length > 0 && (
        <div className="card">
          <p className="metric-label" style={{ marginBottom: 16 }}>Stress vs Focus (Recent)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={recentData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="i" tick={false} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--bg-accent)", border: "1px solid var(--bg-border)", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="stress" name="Stress" fill="#EF4444" radius={[3, 3, 0, 0]} />
              <Bar dataKey="focus"  name="Focus"  fill="#4FC3F7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {recentData.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div>Session data will appear here once you connect to the backend.</div>
        </div>
      )}
    </div>
  );
}
