import requests
import base64

def test_sarvam_tts():
    print("\n--- Testing Sarvam TTS ---")
    url = "http://localhost:3000/api/sarvam/tts"
    payload = {"text": "Hello from Yantra, this is a test of Sarvam AI speech synthesis."}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS: Received audio/wav response.")
            # Save a small sample or just check content type
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            print(f"Audio Size: {len(response.content)} bytes")
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

def test_gemini_fallback():
    print("\n--- Testing Gemini Fallback ---")
    # We can test /api/docs-support which uses Gemini directly
    url = "http://localhost:3000/api/docs-support"
    payload = {"messages": [{"role": "user", "content": "How do I use Yantra?"}]}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS: Received response from Gemini.")
            print(f"Reply Preview: {data.get('reply')[:100]}...")
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_sarvam_tts()
    test_gemini_fallback()
