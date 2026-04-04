import urllib.request
import json
import time

def run():
    print("--- SARVAM TTS TEST ---")
    start = time.time()
    
    url = "http://127.0.0.1:3000/api/sarvam/tts"
    data = json.dumps({"text": "Welcome to Yantra, your Python learning assistant."}).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            elapsed = round((time.time() - start) * 1000)
            print(f"Status: {response.getcode()}")
            print(f"Content-Type: {response.headers.get('content-type')}")
            content = response.read()
            print(f"Audio bytes received: {len(content)}")
            print(f"Latency: {elapsed}ms")
    except Exception as e:
        elapsed = round((time.time() - start) * 1000)
        print(f"Error: {e}")
        print(f"Latency: {elapsed}ms")

if __name__ == "__main__":
    run()
