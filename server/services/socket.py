from fastapi import WebSocket
from uuid import UUID
class WSManager:
    def __init__(self):
        self.connections: dict[UUID, WebSocket] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket):
        await websocket.accept()

        old = self.connections.get(user_id)
        if old:
            await old.close()

        self.connections[user_id] = websocket

    def disconnect(self, user_id: UUID, websocket: WebSocket = None):
        if websocket:
            if self.connections.get(user_id) == websocket:
                self.connections.pop(user_id, None)
        else:
            self.connections.pop(user_id, None)

    async def send(self, user_id: UUID, message: dict):
        conn = self.connections.get(user_id)
        if conn:
            await conn.send_json(message)
            
ws_manager = WSManager()