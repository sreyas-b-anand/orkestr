from fastapi import APIRouter , WebSocket 
from config import SupabaseConfig
from fastapi import WebSocketDisconnect
from services import ws_manager

supa_client = SupabaseConfig().client
ws_router = APIRouter()
import logging
logger = logging.getLogger(__name__)
@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        token = websocket.query_params.get("token")
        logger.info(f"WebSocket connection attempt with token: {token}")

        if not token:
            await websocket.close(code=1008)
            logger.warning("WebSocket connection rejected: No token provided")
            return

        user = supa_client.auth.get_user(token).user
        user_id = user.id

        await ws_manager.connect(user_id, websocket)

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        if user_id:
            ws_manager.disconnect(user_id)