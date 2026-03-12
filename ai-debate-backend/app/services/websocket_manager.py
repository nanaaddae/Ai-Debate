from typing import Dict, Set
import socketio


class WebSocketManager:
    def __init__(self):
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins='*'
        )
        self.app = socketio.ASGIApp(self.sio)
        self.debate_rooms: Dict[int, Set[str]] = {}

    def get_socket_app(self):
        return self.app

    async def emit_debate_update(self, debate_id: int, event: str, data: dict):
        """Emit an event to all users in a debate room"""
        room = f"debate_{debate_id}"
        await self.sio.emit(event, data, room=room)

    async def emit_new_debate(self, debate_data: dict):
        """Emit new debate to all connected users"""
        await self.sio.emit('new_debate', debate_data)


# Create global instance
ws_manager = WebSocketManager()


# Socket.IO event handlers
@ws_manager.sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@ws_manager.sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    # Clean up: remove user from all debate rooms
    for debate_id, sessions in ws_manager.debate_rooms.items():
        if sid in sessions:
            sessions.remove(sid)


@ws_manager.sio.event
async def join_debate(sid, data):
    """Join a specific debate room for real-time updates"""
    debate_id = data.get('debate_id')
    if debate_id:
        room = f"debate_{debate_id}"
        await ws_manager.sio.enter_room(sid, room)

        # Track the session
        if debate_id not in ws_manager.debate_rooms:
            ws_manager.debate_rooms[debate_id] = set()
        ws_manager.debate_rooms[debate_id].add(sid)

        print(f"Client {sid} joined debate room {debate_id}")


@ws_manager.sio.event
async def leave_debate(sid, data):
    """Leave a debate room"""
    debate_id = data.get('debate_id')
    if debate_id:
        room = f"debate_{debate_id}"
        await ws_manager.sio.leave_room(sid, room)

        # Remove from tracking
        if debate_id in ws_manager.debate_rooms and sid in ws_manager.debate_rooms[debate_id]:
            ws_manager.debate_rooms[debate_id].remove(sid)

        print(f"Client {sid} left debate room {debate_id}")