"""
ws_server.py
WebSocket server that broadcasts the full system state to all
connected React clients every 500ms.
"""

import asyncio
import json
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    import websockets
except ImportError:
    print("[WSServer] websockets not installed. Run: pip install websockets")
    raise

from config import WEBSOCKET_HOST, WEBSOCKET_PORT, BROADCAST_INTERVAL


class WebSocketServer:
    def __init__(self, state_provider):
        """
        Args:
            state_provider: A callable that returns the full state dict
                            to broadcast to clients.
        """
        self._state_provider = state_provider
        self._clients = set()
        self._server = None

    async def _handler(self, websocket):
        """Handle a new client connection."""
        self._clients.add(websocket)
        client_addr = websocket.remote_address
        print(f"[WS] Client connected: {client_addr} | Total: {len(self._clients)}")
        try:
            await websocket.wait_closed()
        finally:
            self._clients.discard(websocket)
            print(f"[WS] Client disconnected: {client_addr} | Total: {len(self._clients)}")

    async def _broadcast_loop(self):
        """Continuously broadcast state to all connected clients."""
        while True:
            if self._clients:
                try:
                    state = self._state_provider()
                    message = json.dumps(state)
                    # Broadcast to all connected clients simultaneously
                    await asyncio.gather(
                        *[ws.send(message) for ws in list(self._clients)],
                        return_exceptions=True,
                    )
                except Exception as e:
                    print(f"[WS] Broadcast error: {e}")
            await asyncio.sleep(BROADCAST_INTERVAL)

    async def start(self):
        """Start the WebSocket server and broadcast loop concurrently."""
        self._server = await websockets.serve(
            self._handler,
            WEBSOCKET_HOST,
            WEBSOCKET_PORT,
        )
        print(f"[WS] Server running on ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")
        await self._broadcast_loop()
