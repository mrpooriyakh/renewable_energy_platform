from fastapi import WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Set
import json
import asyncio
import redis.asyncio as redis
from datetime import datetime
from app.database import get_redis
from app.auth import get_current_user
from app.models import User
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections for real-time notifications."""
    
    def __init__(self):
        # Store active connections: {user_id: {websocket1, websocket2, ...}}
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.redis_client: redis.Redis = None
        self.listening_task = None
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a new WebSocket for a user."""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected via WebSocket")
        
        # Start Redis listener if not already running
        if not self.listening_task:
            self.redis_client = await get_redis()
            self.listening_task = asyncio.create_task(self._listen_to_redis())
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection",
            "message": "Connected to real-time notifications",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a WebSocket for a user."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # Remove user entry if no more connections
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        logger.info(f"User {user_id} disconnected from WebSocket")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific WebSocket connection."""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending message to WebSocket: {e}")
    
    async def send_message_to_user(self, user_id: str, message: dict):
        """Send message to all connections of a specific user."""
        if user_id in self.active_connections:
            # Create a copy of the set to avoid modification during iteration
            connections = self.active_connections[user_id].copy()
            for websocket in connections:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    # Remove broken connection
                    self.active_connections[user_id].discard(websocket)
    
    async def broadcast_to_all(self, message: dict):
        """Broadcast message to all connected users."""
        for user_id in list(self.active_connections.keys()):
            await self.send_message_to_user(user_id, message)
    
    async def broadcast_to_students(self, message: dict):
        """Broadcast message to all student connections."""
        # In a real implementation, you'd filter by user role
        # For now, broadcast to all
        await self.broadcast_to_all(message)
    
    async def _listen_to_redis(self):
        """Listen to Redis pub/sub for real-time updates."""
        try:
            pubsub = self.redis_client.pubsub()
            await pubsub.subscribe("content_updates", "notifications", "submissions")
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        # Parse the message and broadcast to appropriate users
                        data = json.loads(message["data"])
                        await self._handle_redis_message(message["channel"], data)
                    except json.JSONDecodeError as e:
                        logger.error(f"Error parsing Redis message: {e}")
                    except Exception as e:
                        logger.error(f"Error handling Redis message: {e}")
        
        except Exception as e:
            logger.error(f"Redis listener error: {e}")
            # Restart listener after a delay
            await asyncio.sleep(5)
            self.listening_task = asyncio.create_task(self._listen_to_redis())
    
    async def _handle_redis_message(self, channel: str, data: dict):
        """Handle messages from Redis and route to appropriate users."""
        if channel == "content_updates":
            # Notify all students about new content
            notification = {
                "type": "content_update",
                "title": "New Content Available",
                "message": "A teacher has uploaded new learning material",
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.broadcast_to_students(notification)
        
        elif channel == "notifications":
            # Handle general notifications
            if "user_id" in data:
                await self.send_message_to_user(data["user_id"], data)
            else:
                await self.broadcast_to_all(data)
        
        elif channel == "submissions":
            # Handle submission notifications (mainly for teachers)
            notification = {
                "type": "submission",
                "title": "New Submission",
                "message": "A student has submitted an assignment",
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            # In real implementation, send only to relevant teachers
            await self.broadcast_to_all(notification)


# Global connection manager
manager = ConnectionManager()


# WebSocket endpoint
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """Main WebSocket endpoint for real-time communication."""
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await handle_websocket_message(user_id, message, websocket)
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Error processing message"
                }, websocket)
    
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)


async def handle_websocket_message(user_id: str, message: dict, websocket: WebSocket):
    """Handle incoming WebSocket messages from clients."""
    message_type = message.get("type", "")
    
    if message_type == "ping":
        # Respond to ping with pong
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
    
    elif message_type == "subscribe":
        # Handle subscription to specific channels
        channels = message.get("channels", [])
        await manager.send_personal_message({
            "type": "subscribed",
            "channels": channels,
            "message": f"Subscribed to {len(channels)} channels"
        }, websocket)
    
    elif message_type == "notification_read":
        # Mark notification as read
        notification_id = message.get("notification_id")
        if notification_id:
            # In a real implementation, update database
            await manager.send_personal_message({
                "type": "notification_updated",
                "notification_id": notification_id,
                "status": "read"
            }, websocket)
    
    else:
        await manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, websocket)


# Utility functions for sending notifications
async def send_notification_to_user(user_id: str, title: str, message: str, data: dict = None):
    """Send a notification to a specific user."""
    notification = {
        "type": "notification",
        "title": title,
        "message": message,
        "data": data or {},
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.send_message_to_user(user_id, notification)


async def broadcast_content_update(module_id: str, content_id: str, title: str):
    """Broadcast content update to all students."""
    notification = {
        "type": "content_update",
        "title": "New Content Available",
        "message": f"New content '{title}' has been added",
        "data": {
            "module_id": module_id,
            "content_id": content_id,
            "title": title
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast_to_students(notification)


async def notify_submission_received(teacher_id: str, student_name: str, assignment_title: str):
    """Notify teacher about new submission."""
    notification = {
        "type": "submission",
        "title": "New Submission Received",
        "message": f"{student_name} has submitted '{assignment_title}'",
        "data": {
            "student_name": student_name,
            "assignment_title": assignment_title
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.send_message_to_user(teacher_id, notification)