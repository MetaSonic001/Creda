#test_groq.py
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("❌ GROQ_API_KEY not found. Check .env file path/loading.")
    exit(1)

try:
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    models = client.models.list()
    print("✅ Groq API key is working!")
    print("Available models:")
    for model in models.data:
        print(f" - {model.id}")
except ImportError:
    print("❌ Groq library not installed. Run: pip install groq")
except Exception as e:
    print(f"❌ Error: {e}")
    if "401" in str(e) or "invalid_api_key" in str(e).lower():
        print("   → Invalid key. Regenerate at https://console.groq.com/keys")
    elif "429" in str(e):
        print("   → Rate limit hit. Check https://console.groq.com/docs/rate-limits")
    else:
        print("   → Check network or permissions")