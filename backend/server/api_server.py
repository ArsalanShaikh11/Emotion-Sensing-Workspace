"""
api_server.py
FastAPI REST endpoints for historical data and configuration.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except ImportError:
    print("[API] FastAPI not installed. Run: pip install fastapi uvicorn")
    raise

from config import API_PORT, HISTORY_CSV_PATH


def create_app(state_ref: dict) -> FastAPI:
    """
    Create and return the FastAPI application.

    Args:
        state_ref: A shared mutable dict containing 'history' and 'current' keys.
    """
    app = FastAPI(title="Emotion Workspace API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/current")
    def current_state():
        return state_ref.get("current", {})

    @app.get("/api/history")
    def history(limit: int = 120):
        h = state_ref.get("history", [])
        return h[-limit:]

    @app.get("/api/stats/today")
    def stats_today():
        h = state_ref.get("history", [])
        if not h:
            return {"avg_stress": 0, "avg_focus": 0, "avg_fatigue": 0, "peak_stress": 0}
        stresses = [r["emotion"]["stress"] for r in h if "emotion" in r]
        focuses = [r["emotion"]["focus"] for r in h if "emotion" in r]
        fatigues = [r["emotion"]["fatigue"] for r in h if "emotion" in r]
        return {
            "avg_stress": round(sum(stresses) / len(stresses), 1) if stresses else 0,
            "avg_focus": round(sum(focuses) / len(focuses), 1) if focuses else 0,
            "avg_fatigue": round(sum(fatigues) / len(fatigues), 1) if fatigues else 0,
            "peak_stress": round(max(stresses), 1) if stresses else 0,
            "total_readings": len(h),
        }

    @app.get("/api/team")
    def get_team_stats():
        """Mocked multi-organization team data for the hackathon B2B demo."""
        import random
        curr = state_ref.get("current", {})
        base_stress = curr.get("emotion", {}).get("stress", 40)
        
        teams = [
            {
                "id": "org1",
                "name": "Engineering Team Alpha",
                "members": [
                    {"id": "U1", "name": "Arsalan (You)", "role": "Frontend", "stress": base_stress, "fatigue": curr.get("emotion", {}).get("fatigue", 30), "mode": curr.get("mode", "NORMAL")},
                    {"id": "U2", "name": "Sarah J.", "role": "Backend", "stress": random.randint(60, 85), "fatigue": random.randint(40, 70), "mode": "RELAX"},
                    {"id": "U3", "name": "David L.", "role": "Design", "stress": random.randint(20, 40), "fatigue": random.randint(10, 30), "mode": "FOCUS"},
                    {"id": "U4", "name": "Priya M.", "role": "DevOps", "stress": random.randint(70, 95), "fatigue": random.randint(60, 90), "mode": "BREAK"},
                    {"id": "U5", "name": "James T.", "role": "Product", "stress": random.randint(30, 50), "fatigue": random.randint(20, 40), "mode": "NORMAL"},
                ]
            },
            {
                "id": "org2",
                "name": "Design Team Bravo",
                "members": [
                    {"id": "U6", "name": "Alex K.", "role": "UX Lead", "stress": random.randint(30, 60), "fatigue": random.randint(20, 50), "mode": "FOCUS"},
                    {"id": "U7", "name": "Mia F.", "role": "UI Designer", "stress": random.randint(20, 40), "fatigue": random.randint(15, 30), "mode": "NORMAL"},
                    {"id": "U8", "name": "Leo V.", "role": "Motion Graphics", "stress": random.randint(40, 70), "fatigue": random.randint(30, 60), "mode": "RELAX"},
                ]
            },
            {
                "id": "org3",
                "name": "Marketing Team Charlie",
                "members": [
                    {"id": "U9", "name": "Nina P.", "role": "Growth", "stress": random.randint(70, 95), "fatigue": random.randint(60, 85), "mode": "BREAK"},
                    {"id": "U10", "name": "Tom W.", "role": "Content", "stress": random.randint(65, 85), "fatigue": random.randint(50, 75), "mode": "RELAX"},
                    {"id": "U11", "name": "Zoe B.", "role": "Social Media", "stress": random.randint(80, 100), "fatigue": random.randint(70, 90), "mode": "BREAK"},
                ]
            }
        ]
        
        # Calculate health metrics for each team
        for team in teams:
            high_stress_count = sum(1 for m in team["members"] if m["stress"] > 65)
            team["high_stress_count"] = high_stress_count
            team["team_health"] = max(0, 100 - (high_stress_count * 15))
            
            if high_stress_count >= 2:
                team["recommendation"] = "Mandatory 15-Minute Break | No Meetings Afternoon"
            elif high_stress_count == 1:
                team["recommendation"] = "Monitor individual stress levels"
            else:
                team["recommendation"] = "Optimal Working Conditions"
            
            team["is_alert"] = high_stress_count >= 2

        return {"teams": teams}

    @app.get("/api/config")
    def get_config():
        return state_ref.get("config", {})

    return app
