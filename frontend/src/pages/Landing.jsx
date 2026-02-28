import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Activity, BatteryCharging, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import ComputerModel from "../components/ComputerModel";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ 
      minHeight: "calc(100vh - 64px)", 
      display: "flex", flexDirection: "column", 
      alignItems: "center", justifyContent: "center",
      padding: "0 20px"
    }}>
      
      {/* Hero Section - Split Layout */}
      <div style={{ 
        display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        width: "100%", maxWidth: 1200, gap: 40, marginTop: 40, marginBottom: 80,
        flexWrap: "wrap"
      }}>
        
        {/* Left Side: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ flex: 1, minWidth: 320, maxWidth: 600, textAlign: "left" }}
        >
          <div style={{ 
            display: "inline-flex", alignItems: "center", gap: 8, 
            padding: "6px 16px", borderRadius: 20, 
            background: "rgba(79, 195, 247, 0.1)", border: "1px solid rgba(79, 195, 247, 0.2)",
            color: "#4FC3F7", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em",
            marginBottom: 24
          }}>
            <Zap size={14} fill="#4FC3F7" /> HACKATHON EDITION
          </div>

          <h1 style={{ 
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, 
            fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.1, marginBottom: 24,
            background: "linear-gradient(135deg, #FFFFFF 0%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            The Workspace That<br />Adapts To Your Mind.
          </h1>
          
          <p style={{ 
            fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text-secondary)", 
            lineHeight: 1.6, marginBottom: 48, maxWidth: 640
          }}>
            EmotionSpace uses live biometric inference to detect stress, focus, and fatigue in real-time—automatically adjusting your environment to prevent burnout before it happens.
          </p>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
            <button 
              onClick={() => navigate("/dashboard")}
              style={{ 
                padding: "14px 28px", borderRadius: 12, 
                background: "var(--mode-focus)", color: "#000",
                fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 0 30px rgba(79, 195, 247, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Launch Live Dashboard <ArrowRight size={18} />
            </button>
            
            <button 
              onClick={() => navigate("/team")}
              style={{ 
                padding: "14px 28px", borderRadius: 12, 
                background: "var(--bg-card)", color: "var(--text-primary)",
                fontSize: 16, fontWeight: 600, border: "1px solid var(--bg-border)", 
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-accent)"}
              onMouseOut={(e) => e.currentTarget.style.background = "var(--bg-card)"}
            >
              Organization View
            </button>
          </div>
        </motion.div>

        {/* Right Side: 3D Model */}
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           style={{ flex: 1, minWidth: 320, height: 500, display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <ComputerModel />
        </motion.div>
      </div>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="dashboard-grid" style={{ maxWidth: 1000, width: "100%", textAlign: "left" }}
      >
        <div className="card" style={{ background: "rgba(15, 22, 41, 0.6)", backdropFilter: "blur(10px)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(79, 195, 247, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Activity color="#4FC3F7" size={20} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Real-Time Inference</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Fuses webcam micro-expressions, keystroke dynamics, and simulated biometrics to create a live emotional profile.
          </p>
        </div>

        <div className="card" style={{ background: "rgba(15, 22, 41, 0.6)", backdropFilter: "blur(10px)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <BatteryCharging color="#EF4444" size={20} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Burnout Prevention</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Predicts stress spikes 15 minutes before they occur, deploying automated interventions to protect mental bandwidth.
          </p>
        </div>

        <div className="card" style={{ background: "rgba(15, 22, 41, 0.6)", backdropFilter: "blur(10px)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Brain color="#10B981" size={20} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>RL Personalization</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            A local Contextual Bandit agent learns which specific lighting and music modes actually improve your focus.
          </p>
        </div>
      </motion.div>
      
      {/* Footer minimal */}
      <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
        <ShieldCheck size={14} /> 100% Local Inference • Privacy First Architecture
      </div>

    </div>
  );
}
