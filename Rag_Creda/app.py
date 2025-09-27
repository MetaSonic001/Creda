# CA Voice RAG Agent - Main Application
#app.py
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, Response, jsonify, redirect
import os
import json
import chromadb
import requests
import logging
import asyncio
import aiohttp
from datetime import datetime, timedelta
from twilio.twiml.voice_response import VoiceResponse, Gather
from chromadb.utils import embedding_functions
from chromadb import PersistentClient
import time
import google.generativeai as genai
from groq import Groq
from typing import Dict, List, Any, Optional
import yfinance as yf
import pandas as pd
from loguru import logger
import sqlite3
import re
from textblob import TextBlob
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)

@app.before_request
def before_request():
    """Force HTTPS for ngrok"""
    if 'ngrok' in request.host and request.headers.get('X-Forwarded-Proto') == 'http':
        url = request.url.replace('http://', 'https://', 1)
        return redirect(url, code=301)

# Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"  # Fast model for quicker responses
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")

# Initialize AI clients (prefer Groq for speed as primary)
groq_client = None
gemini_model = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("Groq client initialized as primary (faster)")
    except Exception as e:
        logger.error(f"Failed to initialize Groq: {str(e)}")
        print("⚠️ Check GROQ_API_KEY on Groq console")

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(
            'gemini-1.5-flash-latest',  # Fastest available
            generation_config={
                'temperature': 0.1,  # Lowered for factual responses
                'top_p': 0.6,  # Lowered to reduce creativity
                'max_output_tokens': 200  # Reduced for brevity
            }
        )
        logger.info("Gemini AI initialized as fallback")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {str(e)}")
        print("⚠️ Check GEMINI_API_KEY and quota in Google Cloud Console")

# Initialize ChromaDB with persistent storage
try:
    client = PersistentClient(path="./chroma_financial_db")
    embedding_function = embedding_functions.DefaultEmbeddingFunction()
    
    # Get collections
    collections = {}
    collection_names = ["financial_knowledge", "tax_rules", "investment_advice", "stock_analysis"]
    
    for name in collection_names:
        try:
            collections[name] = client.get_collection(
                name=name, 
                embedding_function=embedding_function
            )
            logger.info(f"Connected to {name} collection")
        except Exception as e:
            logger.warning(f"Collection {name} not found: {str(e)}")
            collections[name] = None
    
    logger.info("Connected to persistent ChromaDB collections")
    
except Exception as e:
    logger.error(f"ChromaDB connection failed: {str(e)}")
    logger.error("Please run financial_knowledge_setup.py first")
    collections = {}

# Session storage
sessions = {}

def extract_number_from_speech(speech: str) -> Optional[float]:
    """Extract the first number from speech input using regex."""
    match = re.search(r'\b(\d+(?:\.\d+)?)\b', speech, re.IGNORECASE)
    return float(match.group(1)) if match else None

def extract_income_source_from_speech(speech: str) -> str:
    """Extract income source from speech (salary or business)."""
    speech_lower = speech.lower()
    if "business" in speech_lower or "self-employed" in speech_lower or "freelance" in speech_lower:
        return "business"
    elif "salary" in speech_lower or "job" in speech_lower or "employed" in speech_lower:
        return "salary"
    return "unknown"

def extract_tax_regime_from_speech(speech: str) -> str:
    """Extract tax regime from speech (old or new)."""
    speech_lower = speech.lower()
    if "old" in speech_lower:
        return "old"
    elif "new" in speech_lower:
        return "new"
    return "unknown"

class FinancialAdvisor:
    def __init__(self):
        self.gemini_requests_count = 0
        self.max_gemini_requests = 1000  # Daily limit
        self.db_path = "financial_data.db"
        self.rate_limit_reset = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        
    def reset_daily_limits(self):
        """Reset daily API limits"""
        if datetime.now() >= self.rate_limit_reset:
            self.gemini_requests_count = 0
            self.rate_limit_reset = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
            logger.info("Daily API limits reset")
        
    def get_user_profile(self, session_data: Dict) -> Dict:
        """Extract user profile from conversation"""
        profile = {
            "age": session_data.get("age", "unknown"),
            "income": session_data.get("income", "unknown"),
            "savings": session_data.get("savings", "unknown"),
            "income_source": session_data.get("income_source", "unknown"),  # salary or business
            "risk_tolerance": session_data.get("risk_tolerance", "moderate"),
            "investment_goal": session_data.get("investment_goal", "general"),
            "experience_level": session_data.get("experience_level", "beginner"),
            "location": session_data.get("location", "India"),
            "tax_regime": session_data.get("tax_regime", "unknown"),
            "investment_horizon": session_data.get("investment_horizon", "unknown")
        }
        return profile
    
    def determine_query_category(self, query: str) -> str:
        """Categorize user query to search appropriate collection"""
        query_lower = query.lower()
        
        # Retirement keywords
        retirement_keywords = [
            "retirement", "pension", "nps", "ppf", "retire", "post-retirement",
            "retirement planning", "corpus", "withdrawal"
        ]
        
        # Investment keywords (enhanced)
        investment_keywords = [
            "invest", "investment", "mutual fund", "sip", "portfolio", "returns", 
            "risk", "elss", "ppf", "nps", "fd", "recurring deposit", "bonds",
            "diversification", "asset allocation", "rebalancing", "investment plan"
        ]
        
        # Tax-related keywords
        tax_keywords = [
            "tax", "80c", "80d", "deduction", "exemption", "itr", "tds", 
            "advance tax", "refund", "section", "income tax", "capital gains",
            "ltcg", "stcg", "rebate", "surcharge", "cess", "new regime", "old regime", "tax filing", "tax saving"
        ]
        
        # Stock keywords
        stock_keywords = [
            "stock", "share", "market", "nifty", "sensex", "ipo", "dividend",
            "pe ratio", "eps", "volatility", "sector", "blue chip", "small cap",
            "mid cap", "large cap", "nse", "bse"
        ]
        
        # Financial literacy keywords
        financial_literacy_keywords = [
            "financial literacy", "budgeting", "saving tips", "debt management", "credit score", "inflation", "finance laws"
        ]
        
        if any(keyword in query_lower for keyword in retirement_keywords):
            return "retirement_planning"
        elif any(keyword in query_lower for keyword in investment_keywords):
            return "investment_advice"
        elif any(keyword in query_lower for keyword in tax_keywords):
            return "tax_rules"
        elif any(keyword in query_lower for keyword in stock_keywords):
            return "stock_analysis"
        elif any(keyword in query_lower for keyword in financial_literacy_keywords):
            return "financial_knowledge"
        else:
            return "financial_knowledge"
    
    def query_chroma(self, query: str, category: str) -> List[Dict]:
        """Query specific ChromaDB collection with fallback and relevance filter"""
        collection_map = {
            "retirement_planning": "financial_knowledge",
            "investment_advice": "investment_advice",
            "tax_rules": "tax_rules",
            "stock_analysis": "stock_analysis",
            "financial_knowledge": "financial_knowledge"
        }
        actual_category = collection_map.get(category, "financial_knowledge")
        
        if collections.get(actual_category):
            try:
                results = collections[actual_category].query(
                    query_texts=[query],
                    n_results=5,  # Increased for more context
                    include=["documents", "metadatas", "distances"]
                )
                # Filter results with high relevance (distance < 0.5)
                filtered_results = [
                    {"content": doc, "metadata": meta}
                    for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0])
                    if dist < 0.5 and meta.get("confidence", 1.0) >= 0.8
                ]
                return filtered_results if filtered_results else [{"content": "No highly relevant information found.", "metadata": {}}]
            except Exception as e:
                logger.error(f"Chroma query failed for {actual_category}: {str(e)}")
                return [{"content": "No relevant information found.", "metadata": {}}]
        return [{"content": "No relevant information found.", "metadata": {}}]
    
    async def get_ai_response(self, prompt: str) -> Optional[str]:
        """Get AI response with Groq as primary (faster) and Gemini fallback"""
        self.reset_daily_limits()
        
        # Primary: Groq (faster inference)
        if groq_client:
            try:
                response = groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=GROQ_MODEL,
                    temperature=0.1,  # Lowered for factual responses
                    max_tokens=200,  # Reduced for brevity
                    top_p=0.6  # Lowered to reduce creativity
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"Groq failed: {str(e)} - falling back to Gemini")
        
        # Fallback: Gemini
        if gemini_model and self.gemini_requests_count < self.max_gemini_requests:
            try:
                self.gemini_requests_count += 1
                response = await gemini_model.generate_content_async(
                    prompt,
                    generation_config={
                        'temperature': 0.1,
                        'top_p': 0.6,
                        'max_output_tokens': 200
                    }
                )
                return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini failed: {str(e)}")
        
        # Ultimate fallback: Rule-based response
        return self.get_rule_based_response(prompt)
    
    def get_rule_based_response(self, query: str) -> str:
        """Sophisticated rule-based fallback for when AI services are unavailable"""
        query_lower = query.lower()
        
        if "retirement" in query_lower:
            return "For retirement planning, consider a mix of NPS and PPF for tax benefits and stable returns. A corpus of 25-30x your annual expenses is ideal. What’s your target retirement age?"
        elif "investment" in query_lower or "sip" in query_lower:
            return "For investments, start with diversified equity mutual funds via SIPs for long-term growth. ELSS funds offer tax benefits under Section 80C. What’s your investment horizon?"
        elif "tax" in query_lower:
            return "You can save up to ₹1.5 lakh under Section 80C via ELSS, PPF, or NSC. The new tax regime may suit high earners. Which regime are you using?"
        elif "stock" in query_lower:
            return "Diversify across large-cap and mid-cap stocks to balance risk. Monitor NIFTY 50 trends and P/E ratios. Which sector interests you?"
        elif "financial literacy" in query_lower or "budgeting" in query_lower:
            return "Financial literacy basics: Track expenses, save 20% of income, build emergency fund. Avoid debt traps. What's your specific question?"
        else:
            return "Could you clarify your financial query? For example, ask about taxes, investments, or retirement planning."
    
    async def generate_response(self, query: str, session_id: str) -> tuple[str, Optional[str]]:
        """Generate financial advice with RAG and AI. Returns (response, follow_up_question)"""
        session = sessions.get(session_id, {})
        category = self.determine_query_category(query)
        rag_results = self.query_chroma(query, category)
        
        context = "\n".join([result["content"] for result in rag_results]) if rag_results else "No relevant information found."
        
        profile = self.get_user_profile(session)
        
        # Enhanced prompt with stricter instructions
        prompt = f"""
        You are a professional Indian Chartered Accountant. Provide accurate, concise financial advice based strictly on Indian laws and the provided context. Do not speculate or provide unverified information. If information is missing, state so and ask for clarification. Keep responses under 75 words unless details are requested, using clear, professional financial terms. End with a relevant follow-up question if needed.
        
        User Profile: Age {profile['age']}, Annual Income ₹{profile['income']}, Savings ₹{profile['savings']}, Income Source: {profile['income_source']},
        Risk Tolerance: {profile['risk_tolerance']}, Investment Horizon: {profile['investment_horizon']}, Goal: {profile['investment_goal']}.
        
        Context from Knowledge Base: {context}
        Current Query: {query}
        
        Respond in a professional, engaging tone suitable for voice conversation.
        """
        
        response = await self.get_ai_response(prompt)
        
        # Validate response for key facts (e.g., tax limits)
        if "80C" in query.lower() and "1.5 lakh" not in response and "150000" not in response:
            response += " Note: Section 80C allows deductions up to ₹1.5 lakh."
        
        # Detect follow-ups based on category
        follow_up = None
        follow_up_type = None
        if category == "investment_advice" and profile['investment_horizon'] == "unknown" and ("sip" in query_lower or "investment" in query_lower):
            follow_up = "What’s your investment horizon in years?"
            follow_up_type = "investment_horizon"
        elif category == "tax_rules" and profile['tax_regime'] == "unknown":
            follow_up = "Are you using the old or new tax regime?"
            follow_up_type = "tax_regime"
        elif category == "tax_rules" and profile['income_source'] == "unknown" and "filing" in query_lower:
            follow_up = "Is your income from salary or business?"
            follow_up_type = "income_source"
        elif category == "tax_rules" and profile['income'] == "unknown" and "filing" in query_lower:
            follow_up = "What is your approximate annual income in rupees, like 'ten lakhs'?"
            follow_up_type = "income"
        
        # Update session
        session["last_query"] = query
        session["last_response"] = response
        if follow_up:
            session["pending_follow_up"] = follow_up
            session["pending_follow_up_type"] = follow_up_type
        sessions[session_id] = session
        
        return response, follow_up

advisor = FinancialAdvisor()

@app.route("/voice", methods=["POST"])
def voice():
    """Handle incoming voice calls with general greeting"""
    session_id = request.form.get("CallSid")
    sessions[session_id] = {}  # Start with no state, general conversation
    
    response = VoiceResponse()
    response.say("Hi, I'm Creda. How can I assist you with your finances today? You can ask about taxes, investments, mutual funds, or financial laws.", voice="Polly.Aditi", language="en-IN")
    gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
    response.append(gather)
    return Response(str(response), mimetype="text/xml")

@app.route("/process_speech", methods=["POST"])
def process_speech():
    """Process user speech and respond"""
    speech = request.form.get("SpeechResult", "").strip()
    session_id = request.form.get("CallSid")
    session = sessions.get(session_id, {})
    
    response = VoiceResponse()
    
    if not speech:
        response.say("I didn't catch that. Please try again.", voice="Polly.Aditi", language="en-IN")
        gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
        response.append(gather)
        return Response(str(response), mimetype="text/xml")
    
    if "goodbye" in speech.lower() or "end call" in speech.lower() or "thank you" in speech.lower():
        response.say("Thank you for calling. Have a great day! Goodbye.", voice="Polly.Aditi", language="en-IN")
        response.hangup()
        return Response(str(response), mimetype="text/xml")
    
    # Check for pending follow-up
    pending_follow_up = session.get("pending_follow_up")
    pending_follow_up_type = session.get("pending_follow_up_type")
    if pending_follow_up:
        # Process based on follow-up type
        if pending_follow_up_type == "investment_horizon":
            horizon_num = extract_number_from_speech(speech)
            if horizon_num and horizon_num > 0:
                session["investment_horizon"] = str(int(horizon_num))
                del session["pending_follow_up"]
                del session["pending_follow_up_type"]
                sessions[session_id] = session
                response.say(f"Noted, {int(horizon_num)}-year investment horizon. Let me refine that advice for you.", voice="Polly.Aditi", language="en-IN")
                # Regenerate response with updated profile
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                ai_response, new_follow_up = loop.run_until_complete(advisor.generate_response(session["last_query"], session_id))
                response.say(ai_response, voice="Polly.Aditi", language="en-IN")
            else:
                response.say("Please say a number of years, like 'ten' or 'twenty five'.", voice="Polly.Aditi", language="en-IN")
                gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
                response.append(gather)
                sessions[session_id] = session
                return Response(str(response), mimetype="text/xml")
        elif pending_follow_up_type == "income_source":
            income_source = extract_income_source_from_speech(speech)
            if income_source != "unknown":
                session["income_source"] = income_source
                del session["pending_follow_up"]
                del session["pending_follow_up_type"]
                sessions[session_id] = session
                response.say(f"Noted, income from {income_source}. Let me refine that advice for you.", voice="Polly.Aditi", language="en-IN")
                # Regenerate response
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                ai_response, new_follow_up = loop.run_until_complete(advisor.generate_response(session["last_query"], session_id))
                response.say(ai_response, voice="Polly.Aditi", language="en-IN")
            else:
                response.say("Please say 'salary' or 'business'.", voice="Polly.Aditi", language="en-IN")
                gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
                response.append(gather)
                sessions[session_id] = session
                return Response(str(response), mimetype="text/xml")
        elif pending_follow_up_type == "tax_regime":
            tax_regime = extract_tax_regime_from_speech(speech)
            if tax_regime != "unknown":
                session["tax_regime"] = tax_regime
                del session["pending_follow_up"]
                del session["pending_follow_up_type"]
                sessions[session_id] = session
                response.say(f"Noted, {tax_regime} tax regime. Let me refine that advice for you.", voice="Polly.Aditi", language="en-IN")
                # Regenerate response
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                ai_response, new_follow_up = loop.run_until_complete(advisor.generate_response(session["last_query"], session_id))
                response.say(ai_response, voice="Polly.Aditi", language="en-IN")
            else:
                response.say("Please say 'old' or 'new' regime.", voice="Polly.Aditi", language="en-IN")
                gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
                response.append(gather)
                sessions[session_id] = session
                return Response(str(response), mimetype="text/xml")
        elif pending_follow_up_type == "income":
            income_num = extract_number_from_speech(speech)
            if income_num and income_num > 0:
                session["income"] = str(int(income_num * 100000))  # Assume lakhs
                del session["pending_follow_up"]
                del session["pending_follow_up_type"]
                sessions[session_id] = session
                response.say(f"Noted, annual income ₹{int(income_num * 100000):,}. Let me refine that advice for you.", voice="Polly.Aditi", language="en-IN")
                # Regenerate response
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                ai_response, new_follow_up = loop.run_until_complete(advisor.generate_response(session["last_query"], session_id))
                response.say(ai_response, voice="Polly.Aditi", language="en-IN")
            else:
                response.say("Please say your annual income, like 'ten lakhs'.", voice="Polly.Aditi", language="en-IN")
                gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
                response.append(gather)
                sessions[session_id] = session
                return Response(str(response), mimetype="text/xml")
        
        if new_follow_up:
            session["pending_follow_up"] = new_follow_up
            # Set pending_follow_up_type based on new_follow_up
            if "horizon" in new_follow_up.lower():
                session["pending_follow_up_type"] = "investment_horizon"
            elif "income from" in new_follow_up.lower():
                session["pending_follow_up_type"] = "income_source"
            elif "regime" in new_follow_up.lower():
                session["pending_follow_up_type"] = "tax_regime"
            elif "income" in new_follow_up.lower():
                session["pending_follow_up_type"] = "income"
            gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
            gather.say(new_follow_up, voice="Polly.Aditi", language="en-IN")
            response.append(gather)
        else:
            gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
            response.append(gather)
        
        sessions[session_id] = session
        return Response(str(response), mimetype="text/xml")
    
    # Generate normal response
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    ai_response, follow_up = loop.run_until_complete(advisor.generate_response(speech, session_id))
    
    response.say(ai_response, voice="Polly.Aditi", language="en-IN")
    
    if follow_up:
        session["pending_follow_up"] = follow_up
        if "horizon" in follow_up.lower():
            session["pending_follow_up_type"] = "investment_horizon"
        elif "income from" in follow_up.lower():
            session["pending_follow_up_type"] = "income_source"
        elif "regime" in follow_up.lower():
            session["pending_follow_up_type"] = "tax_regime"
        elif "income" in follow_up.lower():
            session["pending_follow_up_type"] = "income"
        gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
        gather.say(follow_up, voice="Polly.Aditi", language="en-IN")
        response.append(gather)
    else:
        gather = Gather(input="speech", action="/process_speech", method="POST", speech_timeout="auto", language="en-IN", timeout=60)
        response.append(gather)
    
    sessions[session_id] = session
    
    return Response(str(response), mimetype="text/xml")

@app.route("/test", methods=["GET"])
def test_interface():
    return """
    <html>
        <head><title>CA Voice RAG Agent Test</title></head>
        <body>
            <h1>CA Voice RAG Agent Test Interface</h1>
            <p>System is running. Use Twilio to test voice calls.</p>
        </body>
    </html>
    """

@app.route("/health", methods=["GET"])
def health_check():
    status = "healthy" if (groq_client or gemini_model) else "degraded"
    return jsonify({"status": status, "timestamp": datetime.now().isoformat()})

# Add error handler for uncaught exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(e)}")
    
    # For Twilio webhooks, always return valid TwiML
    if request.endpoint in ['voice', 'process_speech']:
        response = VoiceResponse()
        response.say("Technical issue. Please call back.", voice="Polly.Aditi", language="en-IN")
        return Response(str(response), mimetype="text/xml")
    
    # For API endpoints
    return jsonify({
        "error": "Internal server error",
        "message": "Please try again or contact support"
    }), 500

def verify_system_health():
    """Verify system components with fallbacks"""
    issues = []
    
    # Check ChromaDB
    try:
        if not collections.get("financial_knowledge"):
            issues.append("Knowledge base not found - will use static responses")
    except Exception as e:
        issues.append(f"ChromaDB error: {e}")
    
    # Check AI services
    ai_available = bool(groq_client or gemini_model)
    if not ai_available:
        issues.append("No AI services available - will use rule-based responses")
    
    # Check Twilio config
    if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN):
        issues.append("Twilio not configured - voice calls won't work")
    
    if issues:
        print("⚠️  System Issues Found:")
        for issue in issues:
            print(f"   - {issue}")
        print("\n✅ System will continue with available fallbacks")
    else:
        print("✅ All systems operational")
    
    return len(issues) == 0

if __name__ == "__main__":
    # System health check
    print("🏛️  CA Voice RAG Agent Starting...")
    print("=" * 50)
    
    all_systems_ok = verify_system_health()
    
    if not all_systems_ok:
        print("\n⚠️  Running in degraded mode with fallbacks")
        print("Some features may be limited but voice calls will work")
    
    print("\nServices Available:")
    print(f"✓ Voice Interface (Twilio): {'Yes' if TWILIO_ACCOUNT_SID else 'No'}")
    print(f"✓ AI Services: {'Yes' if (groq_client or gemini_model) else 'Rule-based only'}")
    print(f"✓ Knowledge Base: {'Yes' if collections.get('financial_knowledge') else 'Static only'}")
    print(f"✓ Fallback Responses: Always available")
    
    print("=" * 50)
    print(f"🌐 Test Interface: http://localhost:5000/test")
    print(f"📊 Health Check: http://localhost:5000/health") 
    print(f"☎️  Twilio Webhook: Use HTTPS ngrok URL + /voice")
    print("=" * 50)
    
    try:
        app.run(debug=False, port=5000, host='0.0.0.0', threaded=True)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("Check if port 5000 is available or try a different port")