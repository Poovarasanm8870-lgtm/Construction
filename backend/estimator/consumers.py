import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .services.ai_estimator import process_ai_chat_query

class EstimatorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'estimator_chat'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Send initial welcome greeting with WebSocket confirmation
        welcome_payload = {
            "type": "chat_response",
            "sender": "bot",
            "message": "👋 Welcome to ConstructAI Real-Time Cost Estimator! Ask me anything about building material pricing, labor rates, or custom 3D house estimations.",
            "calculation": None
        }
        await self.send(text_data=json.dumps(welcome_payload))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            user_message = data.get('message', '')
            config = data.get('config', {})

            if not user_message:
                return

            # Process query with AI Estimator Service
            ai_result = process_ai_chat_query(user_message, current_config=config)

            response_data = {
                "type": "chat_response",
                "sender": "bot",
                "message": ai_result['text'],
                "calculation": ai_result['calculation'],
                "parameters_used": ai_result['parameters_used']
            }

            await self.send(text_data=json.dumps(response_data))
            
        except Exception as e:
            error_response = {
                "type": "chat_error",
                "sender": "bot",
                "message": f"Sorry, I encountered an error processing your estimate: {str(e)}"
            }
            await self.send(text_data=json.dumps(error_response))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))
