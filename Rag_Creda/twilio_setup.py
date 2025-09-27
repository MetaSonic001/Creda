#twilio_setup.py

import os
import sys
from twilio.rest import Client
import subprocess
import time
import requests
from dotenv import load_dotenv
import json
import platform

# Load environment variables
load_dotenv()

def check_environment():
    """Check if required environment variables are set"""
    required_vars = [
        "TWILIO_ACCOUNT_SID", 
        "TWILIO_AUTH_TOKEN", 
        "GEMINI_API_KEY",  # Primary AI service
        "GROQ_API_KEY"     # Fallback AI service
    ]
    
    missing = []
    warnings = []
    
    for var in required_vars:
        if not os.environ.get(var):
            if var in ["GEMINI_API_KEY", "GROQ_API_KEY"]:
                warnings.append(var)
            else:
                missing.append(var)
    
    if missing:
        print(f"❌ Error: Missing required environment variables: {', '.join(missing)}")
        print("\n📝 Please add them to your .env file:")
        for var in missing:
            if "TWILIO" in var:
                print(f"{var}=your_{var.lower()}_from_twilio_console")
            else:
                print(f"{var}=your_api_key")
        return False
    
    if len(warnings) == 2:
        print("⚠️  Warning: No AI service API keys found (GEMINI_API_KEY, GROQ_API_KEY)")
        print("At least one is required for the CA agent to function properly.")
        return False
    elif warnings:
        print(f"ℹ️  Info: {warnings[0]} not set, will use available AI service")
    
    return True

def check_knowledge_base():
    """Check if the CA financial knowledge base is set up"""
    try:
        import chromadb
        from chromadb.utils import embedding_functions
        
        client = chromadb.PersistentClient(path="./chroma_financial_db")
        embedding_function = embedding_functions.DefaultEmbeddingFunction()
        
        collections_to_check = [
            "financial_knowledge", 
            "tax_rules", 
            "investment_advice", 
            "stock_analysis"
        ]
        
        available_collections = []
        total_documents = 0
        
        for collection_name in collections_to_check:
            try:
                collection = client.get_collection(
                    name=collection_name,
                    embedding_function=embedding_function
                )
                count = collection.count()
                if count > 0:
                    available_collections.append(f"{collection_name} ({count} docs)")
                    total_documents += count
            except Exception as e:
                continue
        
        if not available_collections:
            print("❌ Error: CA financial knowledge base not found.")
            print("Please run the knowledge base setup first:")
            print("python financial_knowledge_setup.py")
            return False
        
        print(f"✅ CA Financial Knowledge Base found:")
        for collection in available_collections:
            print(f"   📚 {collection}")
        print(f"   📊 Total: {total_documents} financial documents")
        return True
        
    except Exception as e:
        print(f"❌ Error accessing knowledge base: {str(e)}")
        print("Please ensure ChromaDB is properly installed and knowledge base is setup.")
        return False

def start_ngrok(port=5000):
    """Start ngrok tunnel for Twilio webhooks"""
    print(f"🚀 Starting ngrok tunnel on port {port}...")
    
    # Check if ngrok is installed
    try:
        result = subprocess.run(["ngrok", "--version"], 
                              check=True, capture_output=True, text=True)
        print(f"✅ Ngrok version: {result.stdout.strip()}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: ngrok is not installed or not in PATH.")
        print("\n📥 Please install ngrok:")
        print("   Windows: Download from https://ngrok.com/download")
        print("   macOS: brew install ngrok")
        print("   Linux: Download and extract to /usr/local/bin/")
        print("\n🔑 Then authenticate with: ngrok config add-authtoken YOUR_TOKEN")
        return None
    
    # Kill existing ngrok processes
    try:
        if platform.system() == "Windows":
            subprocess.run(["taskkill", "/f", "/im", "ngrok.exe"], 
                          capture_output=True)
        else:
            subprocess.run(["pkill", "-f", "ngrok"], capture_output=True)
        time.sleep(1)
    except:
        pass
    
    # Start ngrok process
    ngrok_process = subprocess.Popen(
        ["ngrok", "http", str(port)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for ngrok to start
    print("⏳ Waiting for ngrok to establish tunnel...")
    time.sleep(5)
    
    # Get ngrok URL
    try:
        response = requests.get("http://localhost:4040/api/tunnels", timeout=10)
        data = response.json()
        
        if not data.get("tunnels"):
            print("❌ Error: No ngrok tunnels found.")
            print("Make sure ngrok started successfully and you're authenticated.")
            print("Run: ngrok config add-authtoken YOUR_TOKEN")
            return None
        
        # Get HTTPS URL (preferred for Twilio)
        https_url = None
        for tunnel in data["tunnels"]:
            if tunnel["proto"] == "https":
                https_url = tunnel["public_url"]
                break
        
        if https_url:
            print(f"✅ Ngrok HTTPS tunnel: {https_url}")
            return https_url
        else:
            # Fallback to HTTP
            http_url = data["tunnels"][0]["public_url"]
            print(f"⚠️  Using HTTP tunnel: {http_url} (HTTPS preferred)")
            return http_url
            
    except Exception as e:
        print(f"❌ Error getting ngrok URL: {str(e)}")
        print("Make sure ngrok is running and accessible at http://localhost:4040")
        return None

def test_flask_app(ngrok_url):
    """Test if Flask app is responding"""
    try:
        test_endpoints = [
            ("/health", "Health check"),
            ("/webhook-test", "Webhook test")
        ]
        
        print("🧪 Testing Flask application...")
        
        for endpoint, description in test_endpoints:
            try:
                response = requests.get(f"{ngrok_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    print(f"   ✅ {description}: OK")
                else:
                    print(f"   ⚠️  {description}: Status {response.status_code}")
            except Exception as e:
                print(f"   ❌ {description}: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"⚠️  Flask app test failed: {str(e)}")
        print("Make sure to start Flask app with: python app.py")
        return False

def setup_twilio_phone(ngrok_url):
    """Configure Twilio phone number for CA voice agent"""
    if not check_environment():
        return None
    
    account_sid = os.environ["TWILIO_ACCOUNT_SID"]
    auth_token = os.environ["TWILIO_AUTH_TOKEN"]
    
    try:
        client = Client(account_sid, auth_token)
        account = client.api.accounts(account_sid).fetch()
        print(f"✅ Connected to Twilio account: {account.friendly_name}")
        
    except Exception as e:
        print(f"❌ Error connecting to Twilio: {str(e)}")
        print("Please check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN")
        return None
    
    # Get available phone numbers
    try:
        numbers = client.incoming_phone_numbers.list()
        
        if not numbers:
            print("\n📞 No phone numbers found in your Twilio account.")
            print("You need to purchase a phone number for the CA voice service.")
            
            # Search for available numbers
            countries = [
                {"code": "IN", "name": "India", "type": "local"},
                {"code": "US", "name": "United States", "type": "toll_free"},
                {"code": "GB", "name": "United Kingdom", "type": "local"},
                {"code": "CA", "name": "Canada", "type": "local"}
            ]
            
            print("\n🌍 Available countries for phone numbers:")
            for i, country in enumerate(countries, 1):
                print(f"{i}. {country['name']} ({country['code']}) - {country['type']}")
            
            while True:
                try:
                    choice = input(f"\nSelect country (1-{len(countries)}) or 'skip': ").strip()
                    if choice.lower() == 'skip':
                        print("⏭️  Skipping phone number purchase. You can configure manually later.")
                        return None
                    
                    choice_idx = int(choice) - 1
                    if 0 <= choice_idx < len(countries):
                        selected_country = countries[choice_idx]
                        break
                    else:
                        print("❌ Invalid choice. Please try again.")
                except ValueError:
                    print("❌ Please enter a number.")
            
            # Search for available numbers
            try:
                print(f"\n🔍 Searching for numbers in {selected_country['name']}...")
                
                if selected_country['type'] == 'toll_free':
                    available_numbers = client.available_phone_numbers(selected_country['code']).toll_free.list(limit=10)
                else:
                    available_numbers = client.available_phone_numbers(selected_country['code']).local.list(limit=10)
                
                if not available_numbers:
                    print(f"❌ No numbers available in {selected_country['name']}.")
                    print("Try a different country or check your Twilio account balance.")
                    return None
                
                print(f"\n📱 Available phone numbers:")
                for i, number in enumerate(available_numbers[:5], 1):
                    print(f"{i}. {number.phone_number} - {number.friendly_name}")
                
                while True:
                    try:
                        selection = input(f"\nSelect number (1-{min(5, len(available_numbers))}): ").strip()
                        selection_idx = int(selection) - 1
                        if 0 <= selection_idx < len(available_numbers):
                            selected_number = available_numbers[selection_idx]
                            break
                        else:
                            print("❌ Invalid selection.")
                    except ValueError:
                        print("❌ Please enter a number.")
                
                # Purchase the number
                print(f"\n💳 Purchasing {selected_number.phone_number}...")
                webhook_url = f"{ngrok_url}/voice"
                
                purchased_number = client.incoming_phone_numbers.create(
                    phone_number=selected_number.phone_number,
                    voice_url=webhook_url,
                    voice_method="POST"
                )
                
                print(f"✅ Successfully purchased and configured: {purchased_number.phone_number}")
                return purchased_number.phone_number
                        
            except Exception as e:
                print(f"❌ Error searching/purchasing numbers: {str(e)}")
                if "does not appear to be a valid country code" in str(e):
                    print("Please use a valid country code.")
                elif "insufficient funds" in str(e).lower():
                    print("Please add funds to your Twilio account.")
                return None
        
        else:
            # Use existing numbers
            print(f"\n📱 Found {len(numbers)} phone number(s) in your account:")
            for i, number in enumerate(numbers, 1):
                print(f"{i}. {number.phone_number} ({number.friendly_name})")
            
            if len(numbers) == 1:
                choice = input("\nConfigure {numbers[0].phone_number} for CA service? (y/n): ").strip().lower()
                if choice in ['y', 'yes']:
                    selected_number = numbers[0]
                else:
                    print("⏭️  Setup cancelled.")
                    return None
            else:
                while True:
                    try:
                        selection = input(f"\nSelect number to configure (1-{len(numbers)}): ").strip()
                        selection_idx = int(selection) - 1
                        if 0 <= selection_idx < len(numbers):
                            selected_number = numbers[selection_idx]
                            break
                        else:
                            print("❌ Invalid selection.")
                    except ValueError:
                        print("❌ Please enter a number.")
            
            # Configure the selected number
            try:
                webhook_url = f"{ngrok_url}/voice"
                selected_number.update(
                    voice_url=webhook_url,
                    voice_method="POST"
                )
                print(f"✅ Successfully configured: {selected_number.phone_number}")
                print(f"   📡 Webhook URL: {webhook_url}")
                return selected_number.phone_number
                
            except Exception as e:
                print(f"❌ Error configuring number: {str(e)}")
                return None
                
    except Exception as e:
        print(f"❌ Error accessing Twilio numbers: {str(e)}")
        return None

def display_final_instructions(phone_number, ngrok_url):
    """Display final setup instructions"""
    print("\n" + "=" * 70)
    print("🎉 CA VOICE RAG AGENT SETUP COMPLETED!")
    print("=" * 70)
    
    if phone_number:
        print(f"📞 Phone Number: {phone_number}")
    print(f"🌐 Webhook URL: {ngrok_url}/voice")
    print(f"🔍 Test Interface: {ngrok_url}/test")
    print(f"📊 Health Check: {ngrok_url}/health")
    print(f"📈 Analytics: {ngrok_url}/analytics")
    
    print("\n📋 NEXT STEPS:")
    print("1. Keep this terminal running to maintain ngrok tunnel")
    print("2. Start Flask app: python app.py")
    if phone_number:
        print(f"3. Call {phone_number} to test the CA voice agent")
    print("4. Ask about tax planning, investments, stock analysis")
    
    print("\n💡 SAMPLE QUESTIONS TO ASK:")
    print("• How can I save tax under Section 80C?")
    print("• What's the best investment for a 30-year-old?")
    print("• Should I choose old or new tax regime?")
    print("• Which mutual funds are good for SIP?")
    print("• How much should I invest in ELSS?")
    print("• What's the current market outlook?")
    print("• Suggest a retirement plan based on my profile")
    print("• Investment plan for 10 years")
    
    print("\n🔧 TECHNICAL FEATURES:")
    print("✓ Gemini Live API (fast responses)")
    print("✓ Groq API (fallback mechanism)")
    print("✓ Real-time stock data integration")
    print("✓ Persistent ChromaDB storage")
    print("✓ Automated financial news crawling")
    print("✓ Age, Income, Savings-based personalization")
    print("✓ Investment horizon follow-up")
    print("✓ Tax regime optimization")
    
    print("\n⚠️  IMPORTANT NOTES:")
    print("• This provides general financial guidance")
    print("• For complex decisions, consult a qualified CA")
    print("• Voice responses are optimized for clarity")
    print("• Knowledge base updates automatically")
    print("• Agent collects profile info on first call")
    
    print(f"\n🚀 Your CA Voice RAG Agent is ready!")
    print("Press Ctrl+C to stop the ngrok tunnel")

def main():
    """Main setup function"""
    print("🏛️  CA VOICE RAG AGENT - TWILIO SETUP")
    print("=" * 50)
    print("This will set up a voice-based CA advisory system")
    print("Clients can call to get:")
    print("• Tax planning and compliance advice")
    print("• Investment recommendations and analysis")
    print("• Stock market insights and suggestions")
    print("• Portfolio optimization strategies")
    print("• SIP and mutual fund guidance")
    print("• Financial goal planning")
    print("• Personalized retirement & investment plans")
    print("=" * 50)
    
    # Step 1: Check environment variables
    print("\n🔍 Step 1: Checking environment configuration...")
    if not check_environment():
        print("\n❌ Setup cannot continue without required environment variables")
        print("\n📝 Create a .env file with:")
        print("TWILIO_ACCOUNT_SID=your_account_sid")
        print("TWILIO_AUTH_TOKEN=your_auth_token")
        print("GEMINI_API_KEY=your_gemini_api_key")
        print("GROQ_API_KEY=your_groq_api_key")
        return
    
    # Step 2: Check knowledge base
    print("\n🔍 Step 2: Checking CA financial knowledge base...")
    if not check_knowledge_base():
        print("\n❌ Setup cannot continue without financial knowledge base")
        print("Run: python financial_knowledge_setup.py")
        return
    
    print("\n✅ Environment and knowledge base checks passed")
    
    # Step 3: Start ngrok tunnel
    print("\n🔍 Step 3: Starting ngrok tunnel...")
    ngrok_url = start_ngrok()
    if not ngrok_url:
        print("\n❌ Failed to start ngrok. Setup cancelled.")
        print("Make sure ngrok is installed and authenticated")
        return
    
    # Step 4: Test Flask application
    print("\n🔍 Step 4: Testing Flask application...")
    flask_running = test_flask_app(ngrok_url)
    if not flask_running:
        print("\n⚠️  Flask app is not responding")
        print("Make sure to run: python app.py")
        print("You can continue setup and start Flask later")
    
    # Step 5: Configure Twilio phone number
    print("\n🔍 Step 5: Configuring Twilio phone number...")
    phone_number = setup_twilio_phone(ngrok_url)
    
    # Step 6: Display final instructions
    display_final_instructions(phone_number, ngrok_url)
    
    # Keep running to maintain tunnel
    if phone_number:
        try:
            print(f"\n🔄 Keeping tunnel active... (Ctrl+C to stop)")
            while True:
                time.sleep(60)
                # Ping health endpoint to keep services warm
                try:
                    requests.get(f"{ngrok_url}/health", timeout=5)
                except:
                    pass
        except KeyboardInterrupt:
            print("\n\n👋 Shutting down CA Voice RAG Agent setup...")
            print("The phone number configuration is saved in Twilio")
            print("You can run this setup again anytime to get a new tunnel")
            print("\nTo restart the service:")
            print("1. Run: python twilio_setup.py")
            print("2. Run: python app.py")
    else:
        print("\n⚠️  Phone number configuration incomplete")
        print("You can configure manually in Twilio console:")
        print(f"Voice webhook URL: {ngrok_url}/voice")

if __name__ == "__main__":
    main()