"""
decision_brain.py
Evaluates rules in priority order and selects the active WorkspaceMode.
Also integrates a simple RL-style feedback stub (reward on focus improvement).
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from brain.rules import RULES


import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from brain.rules import RULES
from ai.rl_agent import PersonalizationRLAgent


class DecisionBrain:
    def __init__(self):
        self._current_mode = "NORMAL"
        self._mode_duration = 0      # seconds in current mode
        self._last_focus = 50.0
        self._reward_log = []
        
        # Initialize the Reinforcement Learning agent
        self.rl_agent = PersonalizationRLAgent()

    def decide(self, emotion: dict, predicted_stress: float | None) -> str:
        """
        Evaluate all rules and return the highest-priority matching mode.
        If RL is enabled, it may override the rule engine.
        """
        s = emotion["stress"]
        f = emotion["focus"]
        fa = emotion["fatigue"]
        ps = predicted_stress

        # 1. Ask the Rule Engine
        base_mode = "NORMAL"
        for rule in RULES:
            try:
                if rule["condition"](s, f, fa, ps):
                    base_mode = rule["mode"]
                    break
            except Exception:
                continue

        # 2. Ask the RL Agent to personalize/override
        selected_mode = self.rl_agent.choose_mode(s, fa, base_mode)

        # 3. Apply RL Reward (Feedback loop)
        # We reward the agent based on how much focus changed
        reward = f - self._last_focus
        if selected_mode == self._current_mode:
             # Apply small continuous feedback
             self.rl_agent.apply_reward(reward * 0.1)
        else:
             # Significant feedback on mode transition
             self.rl_agent.apply_reward(reward)

        self._reward_log.append({
            "mode": self._current_mode,
            "reward": reward,
        })
        if len(self._reward_log) > 500:
            self._reward_log.pop(0)

        self._last_focus = f
        if selected_mode != self._current_mode:
            print(f"[Brain] Mode change: {self._current_mode} → {selected_mode} "
                  f"(stress={s:.1f}, focus={f:.1f}, fatigue={fa:.1f})")
            self._current_mode = selected_mode

        return self._current_mode

    def get_reward_summary(self) -> dict:
        """Returns average reward per mode for the RL summary."""
        summary = {}
        for entry in self._reward_log:
            m = entry["mode"]
            summary.setdefault(m, []).append(entry["reward"])
        return {k: round(sum(v) / len(v), 2) for k, v in summary.items()}
