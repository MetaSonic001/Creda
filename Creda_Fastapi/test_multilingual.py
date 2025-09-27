import requests
import json

# Test the new multilingual endpoint
response = requests.post('http://localhost:8000/process_multilingual_query', 
                        json={'text': 'SIP क्या है?', 'auto_detect': True})

print('=== MULTILINGUAL ROUND-TRIP TEST ===')
print(f'Status: {response.status_code}')

if response.status_code == 200:
    data = response.json()
    print(f'Original: {data.get("original_text")}')
    print(f'Language: {data.get("detected_language")}')
    print(f'English: {data.get("english_translation")}')
    print(f'Finance Response: {data.get("finance_response", "N/A")[:100]}...')
    print(f'Final Response: {data.get("final_response", "N/A")[:100]}...')
    print(f'Translation Needed: {data.get("processing_info", {}).get("translation_needed")}')
    print(f'Success: {data.get("success")}')
    print()
    print("=== DETAILED ANALYSIS ===")
    if data.get("detected_language") != "english":
        if data.get("english_translation") == data.get("original_text"):
            print("❌ ISSUE: English translation failed - still in original language")
        else:
            print("✅ English translation working")
            
        if data.get("final_response") == data.get("finance_response"):
            print("❌ ISSUE: Response not translated back to original language")
        else:
            print("✅ Response translated back to original language")
    else:
        print("✅ English query - no translation needed")
else:
    print(f'Error: {response.text}')