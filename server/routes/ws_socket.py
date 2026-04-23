from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from config import SupabaseConfig
from services import ws_manager
import logging

supa_client = SupabaseConfig().client
ws_router = APIRouter()
logger = logging.getLogger(__name__)


@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    user_id = None

    try:
        token = websocket.query_params.get("token")
        logger.info("WebSocket connection attempt")

        if not token:
            await websocket.close(code=1008)
            logger.warning("WebSocket connection rejected: No token provided")
            return

        user = supa_client.auth.get_user(token).user
        user_id = str(user.id)

        await ws_manager.connect(user_id, websocket)
        logger.info("WebSocket connected for user: %s", user_id)

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        if user_id:
            ws_manager.disconnect(user_id)
            logger.info("WebSocket disconnected for user: %s", user_id)
    except Exception as e:
        logger.error("WebSocket error: %s", str(e))
        if user_id:
            ws_manager.disconnect(user_id)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass