from fastapi import WebSocket
from uuid import UUID


class WSManager:
    def __init__(self):
        self.connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        old = self.connections.get(user_id)
        if old:
            try:
                await old.close()
            except Exception:
                pass

        self.connections[user_id] = websocket

    def disconnect(self, user_id: str):
        self.connections.pop(user_id, None)

    async def send(self, user_id: str, message: dict):
        conn = self.connections.get(user_id)
        if conn:
            try:
                await conn.send_json(message)
            except Exception:
                self.disconnect(user_id)


ws_manager = WSManager()