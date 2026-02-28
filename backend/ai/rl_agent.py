"""
rl_agent.py
A lightweight Reinforcement Learning (Contextual Bandit) stub for the hackathon.
It learns the user's optimal environment settings by tracking the "Reward" (Focus increase/decrease)
after a Mode change.
"""

import random


class PersonalizationRLAgent:
    def __init__(self):
        # Q-table: Maps State -> Action -> Expected Reward
        # State: "HighStress", "HighFatigue", "Normal"
        # Action: "FOCUS", "RELAX", "BREAK", "NORMAL"
        self.q_table = {
            "HighStress": {"RELAX": 5.0, "BREAK": 2.0, "FOCUS": -5.0, "NORMAL": 0.0},
            "HighFatigue": {"BREAK": 5.0, "RELAX": 3.0, "FOCUS": -5.0, "NORMAL": 0.0},
            "Normal": {"FOCUS": 5.0, "NORMAL": 2.0, "RELAX": 0.0, "BREAK": -2.0}
        }
        self.learning_rate = 0.1
        self.epsilon = 0.1  # Exploration rate (10% of the time, try something random)
        
        self.last_state = "Normal"
        self.last_action = "NORMAL"

    def _get_discrete_state(self, stress: float, fatigue: float) -> str:
        if stress > 65:
            return "HighStress"
        if fatigue > 60:
            return "HighFatigue"
        return "Normal"

    def choose_mode(self, stress: float, fatigue: float, base_mode: str) -> str:
        """
        Takes the rule-engine's 'base_mode', but sometimes overrides it based on learned preferences.
        """
        state = self._get_discrete_state(stress, fatigue)
        self.last_state = state

        # Epsilon-greedy exploration
        if random.random() < self.epsilon:
            # Explore: Try a random mode
            actions = list(self.q_table[state].keys())
            chosen = random.choice(actions)
            print(f"[RL Agent] Exploring new intervention: {chosen} instead of {base_mode}")
            self.last_action = chosen
            return chosen

        # Exploit: Choose the mode with the highest Expected Reward for this state
        best_action = max(self.q_table[state], key=self.q_table[state].get)
        
        # If the RL agent heavily disagrees with the base rule, override it.
        # Otherwise, trust the base rule.
        if self.q_table[state][best_action] > self.q_table[state][base_mode] + 2.0:
            print(f"[RL Agent] Overriding rule! Learned that {best_action} works better than {base_mode} here.")
            self.last_action = best_action
            return best_action
            
        self.last_action = base_mode
        return base_mode

    def apply_reward(self, focus_delta: float):
        """
        Called 30 seconds after a mode change.
        If focus went up, focus_delta is positive (Reward).
        If focus went down, focus_delta is negative (Penalty).
        """
        state = self.last_state
        action = self.last_action
        
        # Q-learning update formula
        old_q = self.q_table[state][action]
        new_q = old_q + self.learning_rate * (focus_delta - old_q)
        self.q_table[state][action] = new_q
        
        if abs(focus_delta) > 5.0:
            direction = "improved" if focus_delta > 0 else "worsened"
            print(f"[RL Agent] Focus {direction} by {abs(focus_delta):.1f} after choosing {action}. " 
                  f"Updated Q-Value: {new_q:.2f}")

