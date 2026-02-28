import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, AlertTriangle, CheckCircle, Activity, Send, X } from "lucide-react";

const API = "http://localhost:8000";

const MODE_COLORS = {
  FOCUS: "#4FC3F7",
  RELAX: "#FFB347",
  BREAK: "#81C784",
  NORMAL: "#8B9EC7"
};

export default function TeamDashboard() {
  const [data, setData] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTeam = () => {
      axios.get(`${API}/api/team`)
        .then((r) => {
          setData(r.data);
          if (!selectedTeamId && r.data.teams?.length > 0) {
            setSelectedTeamId(r.data.teams[0].id);
          }
        })
        .catch(() => {});
    };
    fetchTeam();
    const int = setInterval(fetchTeam, 2000);
    return () => clearInterval(int);
  }, [selectedTeamId]);

  if (!data || !data.teams) {
    return <div style={{ color: "var(--text-muted)", padding: 40, textAlign: "center" }}>Loading Organization Data...</div>;
  }

  const selectedTeam = data.teams.find(t => t.id === selectedTeamId) || data.teams[0];
  const { members, team_health, high_stress_count, recommendation, is_alert } = selectedTeam;
  
  // Filter members acting as the trigger for the alert
  const affectedMembers = members.filter(m => m.stress > 65);

  return (
    <div className="fade-in" style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)", position: "relative" }}>
      
      {/* LEFT SIDEBAR: Organization List */}
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--mode-focus)", marginBottom: 4 }}>
            <Users size={16} />
            <span style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Organization View</span>
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24 }}>
            Active Teams
          </h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flex: 1, paddingRight: 4 }}>
          {data.teams.map(team => (
            <div 
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className="card"
              style={{ 
                cursor: "pointer", 
                border: selectedTeamId === team.id ? "1px solid var(--mode-focus)" : "1px solid var(--bg-border)",
                background: selectedTeamId === team.id ? "rgba(79, 195, 247, 0.05)" : "var(--bg-card)",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{team.name}</div>
                {team.is_alert && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} className="pulse" />}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <Users size={12} style={{ display: "inline", marginRight: 4 }} /> 
                  {team.members.length} Members
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: team.team_health > 70 ? "#10B981" : "#F59E0B" }}>
                  {team.team_health}% Health
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MAIN AREA: Selected Team Details */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", paddingRight: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28 }}>
              {selectedTeam.name}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              Live biometric tracking for {members.length} engineers.
            </p>
          </div>
          <div style={{ textAlign: "right", background: "var(--bg-card)", padding: "12px 24px", borderRadius: "12px", border: "1px solid var(--bg-border)" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", marginBottom: 4 }}>Overall Team Health</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: team_health > 70 ? "#10B981" : "#F59E0B", lineHeight: 1 }}>
              {team_health}%
            </div>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div style={{
          padding: "16px 20px", borderRadius: "var(--radius)",
          background: is_alert ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
          border: `1px solid ${is_alert ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
          display: "flex", alignItems: "center", gap: 16
        }}>
          {is_alert ? <AlertTriangle size={24} color="#EF4444" /> : <CheckCircle size={24} color="#10B981" />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: is_alert ? "#EF4444" : "#10B981", marginBottom: 2 }}>
              {is_alert 
                ? `${high_stress_count} / ${members.length} team members showing high fatigue/stress right now.`
                : "Team metrics are stable and healthy."}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-muted)" }}>AI Analysis: </span>
              {recommendation}
            </div>
          </div>
          <div 
            onClick={() => setShowModal(true)}
            style={{
              padding: "8px 16px", borderRadius: 8, 
              background: is_alert ? "#EF4444" : "transparent",
              border: is_alert ? "none" : "1px solid #10B981",
              color: is_alert ? "#fff" : "#10B981", 
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: is_alert ? "0 4px 12px rgba(239,68,68,0.3)" : "none",
              transition: "all 0.2s"
            }}>
            {is_alert ? "Apply Intervention" : "View Feedback"}
          </div>
        </div>

        {/* Individual Members Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {members.map((m) => {
             const color = m.stress > 65 ? "#EF4444" : (m.stress > 40 ? "#F59E0B" : "#10B981");
             return (
               <div key={m.id} className="card" style={{ position: "relative", overflow: "hidden" }}>
                  <div style={{ width: 4, position: "absolute", left: 0, top: 0, bottom: 0, background: color }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.role}</div>
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                      background: `${MODE_COLORS[m.mode]}22`, color: MODE_COLORS[m.mode],
                      height: "fit-content", border: `1px solid ${MODE_COLORS[m.mode]}44`
                    }}>
                      {m.mode}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                     <div>
                       <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Activity size={10} /> Stress</div>
                       <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{Math.round(m.stress)}</div>
                     </div>
                     <div style={{ textAlign: "right" }}>
                       <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Fatigue</div>
                       <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>{Math.round(m.fatigue)}</div>
                     </div>
                  </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Intervention Modal Overlay */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(8,13,26,0.8)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="card fade-in" style={{ 
            width: 500, maxWidth: "90%", position: "relative",
            border: `1px solid ${is_alert ? "#EF4444" : "#10B981"}`
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            
            {is_alert ? (
              <>
                <h3 style={{ fontSize: 20, color: "#EF4444", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={20} /> Action Required
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
                  The AI detected systemic burnout risk. The following members are currently experiencing high stress.
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {affectedMembers.map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-primary)", borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Stress: <span style={{ color: "#EF4444" }}>{Math.round(m.stress)}</span> • Fatigue: {Math.round(m.fatigue)}</div>
                      </div>
                      <button style={{ 
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", 
                        color: "#F87171", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                      }}>
                        <Send size={12} /> DM Employee
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--text-muted)", color: "var(--text-muted)", borderRadius: 8, cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={() => setShowModal(false)} style={{ padding: "10px 16px", background: "#EF4444", border: "none", color: "white", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                    Apply Action: {recommendation}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 20, color: "#10B981", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={20} /> Positive Feedback
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                  Team health is excellent ({team_health}%). The AI has no active interventions. 
                </p>
                <div style={{ padding: 16, background: "rgba(16,185,129,0.1)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)", marginBottom: 24 }}>
                  <strong style={{ color: "#10B981", fontSize: 13 }}>Suggestion:</strong>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 4 }}>
                    Use this high-focus period to tackle complex architectural discussions or sprint planning.
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "100%", padding: "10px", background: "var(--bg-accent)", border: "none", color: "var(--text-primary)", borderRadius: 8, cursor: "pointer" }}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
