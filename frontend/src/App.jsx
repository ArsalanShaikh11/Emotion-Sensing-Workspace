import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useWebSocket } from "./hooks/useWebSocket";
import { useWorkspaceStore } from "./store/useWorkspaceStore";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import TeamDashboard from "./pages/TeamDashboard";
import Header from "./components/Header";
import "./index.css";

function App() {
  useWebSocket(); // Initialize WebSocket connection at root level
  const connectionStatus = useWorkspaceStore((s) => s.connectionStatus);

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: "24px 32px", maxWidth: 1440, margin: "0 auto", width: "100%" }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/team" element={<TeamDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
