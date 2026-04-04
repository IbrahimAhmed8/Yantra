import os
from dotenv import load_dotenv
from yantra_ai.core.config import get_settings
from yantra_ai.core.service import ChatService
from yantra_ai.schemas.chat import ChatRequest, Message

def test_api():
    # If running from ai/ directory
    if os.path.exists(".env"):
        load_dotenv(".env")
    elif os.path.exists("ai/.env"):
        load_dotenv("ai/.env")
    settings = get_settings()
    print(f"DEBUG: Chat Provider: {settings.chat_provider}")
    print(f"DEBUG: Groq Key Configured: {bool(settings.groq_primary_api_key)}")
    print(f"DEBUG: Gemini Key Configured: {bool(settings.gemini_primary_api_key)}")
    
    service = ChatService()
    request = ChatRequest(
        messages=[Message(role="user", content="Respond with exactly one word: 'SUCCESS'")],
        student={
            "name": "TestUser",
            "skill_level": "beginner",
            "current_path": "AI Foundations",
            "progress": 10,
            "learning_goals": ["understanding AI"]
        }
    )
    
    print("\nDEBUG: Calling service.reply()...")
    response = service.reply(request)
    print(f"DEBUG: Provider: {response.provider}")
    print(f"DEBUG: Model: {response.model_used}")
    print(f"DEBUG: Reply: {response.reply}")

if __name__ == "__main__":
    test_api()
