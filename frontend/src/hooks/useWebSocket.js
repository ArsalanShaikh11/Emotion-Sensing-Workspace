/**
 * useWebSocket.js
 * Connects to the Python WebSocket server.
 * Auto-reconnects on disconnect with exponential backoff.
 */
import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

const WS_URL = "ws://localhost:8765";
const MAX_RETRIES = 10;

export function useWebSocket() {
  const setFrame = useWorkspaceStore((s) => s.setFrame);
  const setConnectionStatus = useWorkspaceStore((s) => s.setConnectionStatus);
  const retries = useRef(0);
  const wsRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function connect() {
      setConnectionStatus("connecting");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        retries.current = 0;
        setConnectionStatus("connected");
        console.log("[WS] Connected to backend.");
      };

      ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data);
          setFrame(frame);
        } catch (e) {
          console.warn("[WS] Parse error:", e);
        }
      };

      ws.onerror = (err) => {
        console.warn("[WS] Error:", err);
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        if (retries.current < MAX_RETRIES) {
          const delay = Math.min(1000 * 2 ** retries.current, 15000);
          retries.current += 1;
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retries.current})...`);
          timeoutRef.current = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      clearTimeout(timeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [setFrame, setConnectionStatus]);
}
