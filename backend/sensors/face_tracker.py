"""
face_tracker.py
Uses OpenCV + MediaPipe to extract emotion & fatigue signals from a webcam feed.
Signals: blink rate, eye openness, posture score, head tilt.
Falls back to neutral values if no face is detected.
"""

import time
import threading
import numpy as np

try:
    import cv2
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False


# MediaPipe landmark indices
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
NOSE_TIP = 4


def _eye_aspect_ratio(landmarks, eye_indices, w, h):
    pts = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in eye_indices]
    A = np.linalg.norm(np.array(pts[1]) - np.array(pts[5]))
    B = np.linalg.norm(np.array(pts[2]) - np.array(pts[4]))
    C = np.linalg.norm(np.array(pts[0]) - np.array(pts[3]))
    return (A + B) / (2.0 * C) if C > 0 else 0.3


class FaceTracker:
    EAR_BLINK_THRESHOLD = 0.21
    BLINK_WINDOW_SECONDS = 60

    def __init__(self):
        self._lock = threading.Lock()
        self._latest = self._neutral()

        if not MEDIAPIPE_AVAILABLE:
            print("[FaceTracker] MediaPipe not available. Using neutral values.")
            return

        self._mp_face = mp.solutions.face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self._mp_pose = mp.solutions.pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self._cap = cv2.VideoCapture(0)
        self._blink_times = []
        self._was_blinking = False

        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def _neutral(self) -> dict:
        return {
            "blink_rate": 15.0,
            "eye_openness": 0.65,
            "posture_score": 75.0,
            "head_tilt": 0.0,
            "face_detected": False,
            "source": "camera",
        }

    def _loop(self):
        while True:
            ret, frame = self._cap.read()
            if not ret:
                time.sleep(0.1)
                continue

            h, w = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_result = self._mp_face.process(rgb)
            pose_result = self._mp_pose.process(rgb)

            data = self._neutral()

            if face_result.multi_face_landmarks:
                lm = face_result.multi_face_landmarks[0].landmark
                data["face_detected"] = True

                ear_l = _eye_aspect_ratio(lm, LEFT_EYE, w, h)
                ear_r = _eye_aspect_ratio(lm, RIGHT_EYE, w, h)
                ear = (ear_l + ear_r) / 2.0
                data["eye_openness"] = round(min(1.0, ear / 0.35), 3)

                # Blink detection
                now = time.time()
                if ear < self.EAR_BLINK_THRESHOLD and not self._was_blinking:
                    self._blink_times.append(now)
                    self._was_blinking = True
                elif ear >= self.EAR_BLINK_THRESHOLD:
                    self._was_blinking = False

                self._blink_times = [t for t in self._blink_times if now - t < self.BLINK_WINDOW_SECONDS]
                data["blink_rate"] = round(len(self._blink_times) * (60 / self.BLINK_WINDOW_SECONDS), 1)

                # Head tilt (nose vs midpoint of eyes)
                nose = lm[NOSE_TIP]
                left_eye_center = lm[LEFT_EYE[0]]
                right_eye_center = lm[RIGHT_EYE[0]]
                mid_x = (left_eye_center.x + right_eye_center.x) / 2
                tilt = abs(nose.x - mid_x) * 180
                data["head_tilt"] = round(tilt, 1)

            if pose_result.pose_landmarks:
                pl = pose_result.pose_landmarks.landmark
                l_sh = pl[LEFT_SHOULDER]
                r_sh = pl[RIGHT_SHOULDER]
                shoulder_tilt = abs(l_sh.y - r_sh.y)
                # Lower tilt → better posture (closer to 100)
                posture = max(0, 100 - (shoulder_tilt * 300))
                data["posture_score"] = round(posture, 1)

            with self._lock:
                self._latest = data

            time.sleep(0.05)  # ~20 FPS

    def get_reading(self) -> dict:
        if not MEDIAPIPE_AVAILABLE:
            return self._neutral()
        with self._lock:
            return dict(self._latest)

    def release(self):
        if MEDIAPIPE_AVAILABLE and hasattr(self, "_cap"):
            self._cap.release()
