CREDA: Multilingual Finance Voice Assistant
CREDA is an AI-powered, voice-first financial literacy and guidance platform designed for India's diverse population. Supporting 11+ Indian languages, CREDA leverages advanced Retrieval-Augmented Generation (RAG), real-time market data (yfinance), and machine learning to provide personalized financial advice, portfolio management, expense tracking, and regulatory guidance (RBI, SEBI, IRDAI). Unlike brokerage apps like Zerodha or Groww, CREDA is the on-ramp to financial inclusion, empowering underserved users—rural households, non-English speakers, and low-literacy individuals—with accessible, compliant, and actionable financial insights.
🚀 Features
Multilingual Voice Service (FastAPI, Port 8000)

Speech Recognition: AI4Bharat IndicConformer for <3s processing in 11+ Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, English).
Translation: Hierarchical system (IndicTrans2 → NLLB → Google Translate) for accurate financial term translation.
Intent Analysis: Hybrid LLM (Gemini Pro, Groq, Ollama) ensures 99% uptime and context-aware responses.
Text-to-Speech (TTS): AI4Bharat IndicTTS + edge-tts for natural, multilingual voice responses.
Audio Preprocessing: Noise reduction, 16kHz mono conversion for robust voice input handling.

Finance Processing Service (FastAPI, Port 8001)

Portfolio Optimization: Markowitz model tailored for Indian markets, with 5% drift detection and tax-efficient rebalancing.
Budget Optimization: Multi-Armed Bandit (ε=0.1) adapts 50/30/20 rule based on user spending patterns.
User Clustering: K-Means generates 5 investment personas (e.g., "Young Aggressive Saver") for personalized advice.
RAG System: ChromaDB with AI4Bharat embeddings queries 50+ regulatory documents (RBI, SEBI, IRDAI) for compliant advice.
Anomaly Detection: ML-powered analysis flags unusual spending (e.g., ₹15,000 vs. usual ₹8,000 on groceries).
Financial Health Scoring: Multi-factor assessment (savings, diversification, emergency fund) with actionable recommendations.
Performance: <0.1s portfolio calculations, <0.5s RAG queries, <0.2s budget optimization.

API Gateway (Port 8080)

Single entry point for seamless routing to Multilingual and Finance services.
Supports health checks, CORS, HTTPS, and scalable Docker deployment.

🏗️ Architecture
User (Voice/Text) → API Gateway (8080) → Multilingual Service (8000) → Translation → Intent Analysis
                                    ↘ Finance Service (8001) → RAG Query → ML Analytics → Response → TTS → User


Data Flow: User inputs (voice/text) are processed for language and intent, routed to finance analytics, validated via RAG, and returned as text/audio.
Storage: ChromaDB for persistent vectors, SQLite for web cache, logs in financial_agent.log.
Future Integration: Account Aggregator (AA) framework for secure access to real bank, mutual fund, and insurance data via user consent (OTP-based).

📦 Installation
Prerequisites

Python 3.9+
Docker (recommended for production)
API Keys: Gemini, Groq, HuggingFace (for AI4Bharat models)
Optional: CUDA-enabled GPU for faster ML processing

Quick Start

Clone Repository
git clone <repository-url>
cd creda-finance-assistant
pip install -r requirements.txt


Set Environment VariablesCreate a .env file:
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
HF_TOKEN=your_huggingface_token
FASTAPI2_URL=http://localhost:8001
CHROMA_DB_PATH=./chroma_financial_db
LOG_LEVEL=INFO
WORKERS=1


Run Services Locally
# Terminal 1: Finance Service
cd fastapi2
python fastapi2_finance.py
# Terminal 2: Multilingual Service
cd fastapi1
python fastapi1_multilingual.py


Docker Deployment (Recommended)
# Start all services
docker-compose up -d
# View logs
docker-compose logs -f
# Scale finance service
docker-compose up -d --scale finance-service=3
# Stop services
docker-compose down


Verify Setup
curl http://localhost:8080/health
# Expected: {"gateway": "healthy", "multilingual_service": "healthy", "finance_service": "healthy"}



🔧 API Endpoints
API Gateway (Port 8080)

Base URL: http://localhost:8080 (dev) | https://your-ngrok-url.ngrok.io (prod)
Health Check: GET /health → System status
Services List: GET /services → Available services and URLs

Multilingual Service (Port 8000)

POST /process_voice: Process audio input (WAV/MP3/M4A/OGG, max 10MB){
  "file": "<audio_file>",
  "language": "hindi" // optional
}

Response: Transcription, translation, intent, response text/audio
POST /translate: Translate text (e.g., "Portfolio optimization" → "पोर्टफोलियो अनुकूलन")
POST /understand_intent: Extract intent/entities (e.g., "Log ₹500 for groceries" → {"intent": "expense_logging", "entities": {"amount": 500, "category": "groceries"}})
POST /get_audio_response: Convert text to audio (e.g., "आपका पोर्टफोलियो तैयार है" → WAV stream)

Finance Service (Port 8001)

POST /portfolio_optimization: Generate optimal portfolio{
  "investment_amount": 100000,
  "risk_tolerance": "moderate",
  "investment_horizon": 10,
  "preferences": {"sector_preference": "diversified", "age": 35}
}

Response: Allocation (e.g., 40% large-cap, 35% bonds), expected return, risk score
POST /get_portfolio_allocation: Detailed portfolio based on user profile
POST /optimize_budget: Adaptive budget using Multi-Armed Bandit{
  "profile": {"age": 28, "income": 600000, "savings": 150000},
  "spending_data": [{"category": "food", "amount": 15000}],
  "feedback": {"needs_satisfaction": 0.8}
}


POST /rag_query: Answer financial queries (e.g., "What are SEBI mutual fund guidelines?") with RAG-backed sources
POST /calculate_health_score: Financial health score (0-100) with recommendations
POST /detect_anomalies: Flag unusual spending patterns

Universal Query

POST /process_request: Route any text/voice query to appropriate service{
  "text": "I want retirement advice",
  "user_language": "english"
}



🧠 AI/ML Models

Speech & Language: AI4Bharat IndicConformer (ASR), IndicTrans2 (translation), IndicTTS (TTS), Gemini Pro/Groq/Ollama for intent.
Finance: K-Means clustering (5 personas), Multi-Armed Bandit (budget), Isolation Forest (anomaly detection), Markowitz optimization (portfolio).
RAG: ChromaDB with AI4Bharat Sentence-BERT embeddings, 50+ Indian regulatory documents.

📊 Supported Financial Features

Expense Management: Voice-log expenses, auto-categorize, detect anomalies (e.g., ₹15,000 grocery spike).
Portfolio Management: Risk profiling, asset allocation, rebalancing alerts, P&L tracking.
Goal Planning: SIP calculations, Monte Carlo simulations for retirement/child education.
Insurance Advisory: Coverage recommendations, claim guidance (e.g., PMJJBY steps), policy comparisons.
Budget Optimization: Adaptive 50/30/20 rule with user feedback.
Regulatory Guidance: RAG-based answers on RBI/SEBI/IRDAI laws (e.g., ELSS tax benefits under Section 80C).

🔒 Security & Compliance

Data Privacy: No persistent user data storage; session data clears after 1 hour.
Compliance: RAG validates all advice against RBI, SEBI, IRDAI guidelines.
Fraud Detection: Real-time anomaly alerts for spending patterns.

🌐 Frontend Integration

Voice Upload:const formData = new FormData();
formData.append('audio', audioBlob, 'recording.wav');
fetch('http://localhost:8080/process_voice', { method: 'POST', body: formData });


User Profile:const userProfile = {
  age: 35,
  income: 800000,
  savings: 200000,
  dependents: 2,
  risk_tolerance: 3,
  goal_type: "retirement",
  time_horizon: 25
};


Formats: Audio (WAV/MP3, <10MB), JSON for profiles/expenses.

🚀 Deployment
Production (Docker)
# Build and start
docker-compose up -d --build
# Scale finance service
docker-compose up -d --scale finance-service=3
# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"


Volumes: ./chroma_financial_db:/app/chroma_db, ./models:/app/models, ./logs:/app/logs
Caching: Multi-stage Docker builds for dependency/model caching
Resources: Multilingual (4GB RAM, 2 cores), Finance (2GB RAM, 1 core)

Environment Configuration
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
HF_TOKEN=your_huggingface_token
FASTAPI2_URL=http://finance-service:8001

🧪 Testing
Postman Collection

Health Check: GET /health (validate system status)
Voice Processing: POST /process_voice (test Hindi audio: "मुझे निवेश की सलाह चाहिए")
Portfolio: POST /get_portfolio_allocation (test with user profile)
RAG Query: POST /rag_query (test: "What are RBI emergency fund guidelines?")

Curl Examples
# Health check
curl http://localhost:8080/health
# Portfolio optimization
curl -X POST "http://localhost:8001/portfolio_optimization" -H "Content-Type: application/json" -d '{"investment_amount": 100000, "risk_tolerance": "moderate", "investment_horizon": 10}'
# RAG query
curl -X POST "http://localhost:8001/rag_query" -H "Content-Type: application/json" -d '"What are SEBI mutual fund guidelines?"'

Python Requests
import requests
response = requests.post('http://localhost:8001/optimize_budget', json={
    "profile": {"age": 28, "income": 600000, "savings": 150000},
    "spending_data": [{"category": "food", "amount": 15000}]
})
print(response.json())

🌟 Unique Innovations

Multilingual Pipeline: First financial assistant with AI4Bharat integration for Indian languages.
Indian Market AI: Markowitz optimization and Multi-Armed Bandit tailored for RBI/SEBI-compliant markets.
RAG for Compliance: Ensures all advice is backed by 50+ authoritative documents.
Accessibility: Voice-first UI for low-literacy, non-English users.
Future-Ready: Planned Account Aggregator integration for real bank/portfolio data.

🙏 Acknowledgments

AI4Bharat for multilingual models
ChromaDB for vector storage
FastAPI and Docker communities
Indian regulatory bodies (RBI, SEBI, IRDAI)

📜 License
MIT License

CREDA: Finance ka dost, har bhasha mein.Ready to empower 300M+ underserved Indians with financial literacy and guidance!
