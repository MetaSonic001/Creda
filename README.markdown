# Combined Financial Voice Assistant

The **Combined Financial Voice Assistant** is a state-of-the-art, AI-powered financial advisory platform designed for Indian users, delivering personalized financial planning, portfolio management, budget optimization, and expense tracking. It integrates the **CA Voice RAG Agent** (a Flask-based, Twilio-powered voice system) with the **Multilingual Finance Voice Assistant** (a FastAPI-based, multilingual AI system) to provide seamless voice and text interactions in 11+ Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, and English). Leveraging Retrieval-Augmented Generation (RAG), advanced AI models (Groq, Gemini, AI4Bharat), and Indian market-specific optimizations, the platform ensures accurate, regulatory-compliant financial advice with high performance and scalability.

## 📜 Project Overview

### Purpose
The Combined Financial Voice Assistant aims to democratize financial advisory services in India by offering:
- **Accessibility**: Voice and text interfaces in multiple Indian languages for diverse user groups.
- **Precision**: RAG-based queries using authoritative sources (RBI, SEBI, IRDAI) and real-time market data (yfinance).
- **Personalization**: Tailored portfolio optimization, budgeting, and financial health scoring based on user profiles.
- **Compliance**: Adherence to Indian financial regulations with secure, privacy-focused design.
- **Scalability**: Microservices architecture for robust deployment in development and production environments.

### Key Components
1. **CA Voice RAG Agent** (Flask, Port 5000):
   - Provides Twilio-powered voice interactions via a phone number.
   - Focuses on conversational financial advice with session management to maintain topic continuity.
   - Integrates ChromaDB for RAG queries and yfinance for stock data.
2. **Multilingual Finance Voice Assistant** (FastAPI, Ports 8000 & 8001):
   - Handles multilingual voice/text processing (Port 8000) with AI4Bharat models for speech recognition and translation.
   - Performs advanced financial computations (Port 8001), including Markowitz portfolio optimization and Multi-Armed Bandit budgeting.
   - Uses ChromaDB with AI4Bharat embeddings for precise financial knowledge retrieval.
3. **API Gateway** (Port 8080):
   - Unifies access to both services, routing requests intelligently and providing health checks.

### Architecture
```
User Input (Voice/Text) → API Gateway (Port 8080) → Multilingual Service (FastAPI, Port 8000: ASR, Translation, Intent Analysis) → Finance Service (FastAPI, Port 8001; Flask, Port 5000: RAG, Portfolio, Budget) → Response (Text/Audio)
```

### Use Cases
- **Retail Investors**: Get personalized investment strategies, e.g., "Should I invest in ELSS for tax savings?"
- **Budget Planners**: Optimize spending with adaptive budgets, e.g., "Log ₹500 for groceries."
- **Financial Education**: Access regulatory guidelines in native languages, e.g., "What are SEBI mutual fund rules?"
- **Voice Accessibility**: Enable non-English speakers to manage finances via voice, e.g., "मुझे रिटायरमेंट के लिए कितना बचाना चाहिए?"

## 🚀 Features

### Multilingual Voice & Text Processing
- **Speech Recognition**: AI4Bharat IndicConformer for <3s processing in 11+ Indian languages.
- **Translation**: Hierarchical system with AI4Bharat IndicTrans2, NLLB, and Google Translate fallback.
- **Text-to-Speech (TTS)**: AI4Bharat IndicTTS and edge-tts for natural, context-aware audio responses.
- **Intent Understanding**: Hybrid AI pipeline (Gemini Pro, Groq, Ollama) for 99% uptime.
- **Supported Languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, English.

### Financial Advisory & Analytics
- **RAG System**: Queries 50+ Indian financial documents (RBI, SEBI, IRDAI) using ChromaDB with AI4Bharat embeddings.
- **Portfolio Optimization**: Markowitz model tailored for Indian markets with real-time drift detection (5% threshold).
- **Budget Optimization**: Multi-Armed Bandit with epsilon-greedy strategy (ε=0.1) for adaptive 50/30/20 budgeting.
- **Financial Health Scoring**: Multi-factor assessment (savings rate, diversification, emergency fund).
- **Anomaly Detection**: ML-powered expense pattern analysis with early warnings.
- **Real-Time Market Data**: Integrates yfinance for stock analysis and optional web crawling for financial updates.

### Voice Interaction
- **Twilio Integration**: Enables phone-based queries via a Twilio number with TwiML responses.
- **Session Management**: Maintains conversation context to prevent topic switching.
- **Rule-Based Fallback**: Ensures responses when AI services are unavailable.

### Performance Metrics
- Voice processing: <3s for 10s audio.
- Portfolio calculations: <0.1s.
- RAG queries: <0.5s.
- Budget optimization: <0.2s.
- Translation: <1s per 100 words.

## 🏗️ Architecture Details

### System Flow
1. **User Input**: Voice (via Twilio or audio upload) or text (via API).
2. **Multilingual Service (FastAPI, Port 8000)**:
   - Processes audio with AI4Bharat IndicConformer for transcription.
   - Translates queries to English using IndicTrans2 or fallbacks.
   - Analyzes intent with Gemini Pro, Groq, or Ollama.
3. **Finance Service (FastAPI, Port 8001; Flask, Port 5000)**:
   - Queries ChromaDB for RAG-based answers.
   - Performs portfolio optimization, budget allocation, or anomaly detection.
   - Integrates real-time market data via yfinance.
4. **Response Generation**: Converts responses to text or audio (IndicTTS) and delivers via API or Twilio.

### Data Storage
- **ChromaDB**: Persistent vector database for financial knowledge, tax rules, investment advice, and stock analysis.
- **SQLite**: Caches crawled web data (`financial_data.db`).
- **Logs**: Stores debugging info in `financial_agent.log` and `logs/` directory.

## 📦 Prerequisites
- **Python**: 3.9+
- **Docker**: Recommended for production deployment.
- **API Keys**:
  - Twilio (Account SID, Auth Token)
  - Gemini (Google API key)
  - Groq (API key)
  - Hugging Face (for AI4Bharat models)
- **Tools**: ngrok for webhook tunneling, CUDA-enabled GPU (optional for AI4Bharat models).
- **Dependencies**: Listed in `requirements.txt` (see [Installation](#installation)).

## 🔧 Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd combined-financial-assistant
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   Key packages:
   - `fastapi`, `uvicorn`: FastAPI services.
   - `flask`, `twilio`: Twilio voice service.
   - `chromadb`: Vector database for RAG.
   - `google-generativeai`, `groq`: AI models.
   - `yfinance`, `pandas`, `scikit-learn`: Financial computations.
   - `sentence-transformers`, `huggingface_hub`: AI4Bharat models.
   - `gTTS`, `pydub`: Text-to-speech and audio processing.

3. **Set Up Environment Variables**:
   Create a `.env` file in the project root:
   ```
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   HF_TOKEN=your_huggingface_token
   FASTAPI2_URL=http://localhost:8001
   CHROMA_DB_PATH=./chroma_financial_db
   LOG_LEVEL=INFO
   WORKERS=1
   ```

4. **Populate Knowledge Base**:
   Initialize ChromaDB with financial documents, stock data, and web content:
   ```bash
   python knowledge_setup.py
   ```

5. **Configure Twilio Webhook**:
   Set up the Twilio phone number and ngrok tunnel:
   ```bash
   ngrok http 5000
   python twilio_setup.py
   ```
   Update the Twilio webhook to `https://<ngrok-url>.ngrok.io/voice`.

6. **Run Services (Development)**:
   ```bash
   # Terminal 1: Finance Service (FastAPI, Port 8001)
   python app2.py
   # Terminal 2: Multilingual Service (FastAPI, Port 8000)
   python app1.py
   # Terminal 3: Voice Service (Flask, Port 5000)
   python app.py
   ```

7. **Docker Deployment (Production)**:
   ```bash
   # Build and start all services
   docker-compose up -d --build
   # View logs
   docker-compose logs -f
   # Scale services
   docker-compose up -d --scale finance-service=2
   ```

## 📚 Usage

### Accessing the System
- **API Gateway**: `http://localhost:8080` (development) or `https://<ngrok-url>.ngrok.io` (production).
- **Voice Interaction**: Call the Twilio number or upload audio to `/process_voice`.
- **Text Queries**: Use `/process_request` or `/rag_query` for text-based inputs.

### Sample Queries
- **Voice**: 
  - "How do I file taxes under the new regime?" (English)
  - "मुझे SIP में निवेश करना है" (Hindi: I want to invest in SIP)
- **Text**:
  - "Optimize my portfolio for ₹1 lakh, moderate risk, 10 years."
  - "What are RBI guidelines for emergency funds?"

### Example Commands
```bash
# Voice query
curl -X POST "http://localhost:8000/process_voice" -F "file=@sample.wav" -F "language=hindi"
# Portfolio optimization
curl -X POST "http://localhost:8001/portfolio_optimization" -H "Content-Type: application/json" -d '{"investment_amount": 100000, "risk_tolerance": "moderate", "investment_horizon": 10}'
# RAG query
curl -X POST "http://localhost:8001/rag_query" -H "Content-Type: application/json" -d '{"query": "What are SEBI mutual fund rules?", "top_k": 5}'
```

## 📁 Project Structure
- `app.py`: Flask-based Twilio voice service (Port 5000).
- `app1.py`: FastAPI multilingual service (Port 8000).
- `app2.py`: FastAPI finance service (Port 8001).
- `knowledge_setup.py`: Populates ChromaDB with financial data.
- `twilio_setup.py`: Configures Twilio webhook and ngrok.
- `requirements.txt`: Lists Python dependencies.
- `chroma_financial_db/`: Persistent ChromaDB storage.
- `logs/`: Application logs for debugging.
- `financial_data.db`: SQLite cache for crawled data.
- `Dockerfile`, `docker-compose.yml`: Docker configurations.

## 🧪 Testing

### Postman Collection
1. **Health Check**:
   ```bash
   curl http://localhost:8080/health
   ```
   Expected: `{"gateway": "healthy", "multilingual_service": "healthy", "finance_service": "healthy"}`

2. **Voice Processing**:
   ```bash
   curl -X POST "http://localhost:8000/process_voice" -F "file=@sample.wav" -F "language=hindi"
   ```
   Expected: `{"transcription": "मुझे निवेश की सलाह चाहिए", "translation": "I need investment advice", "intent": "investment_advice", "response": "..."}`

3. **Portfolio Optimization**:
   ```bash
   curl -X POST "http://localhost:8001/portfolio_optimization" -H "Content-Type: application/json" -d '{"investment_amount": 100000, "risk_tolerance": "moderate", "investment_horizon": 10}'
   ```
   Expected: `{"allocation": {"large_cap_equity": 0.4, "bonds": 0.35, ...}, "expected_return": 0.085, "risk_score": 4.2}`

4. **Twilio Voice Test**:
   Call the Twilio number and ask: "What are ELSS tax benefits?"
   Expected: TwiML response: "Under Section 80C, ELSS offers up to ₹1.5 lakh deduction... Need more tax-saving tips?"

5. **Knowledge Base Stats**:
   ```bash
   curl http://localhost:8001/knowledge_base_stats
   ```
   Expected: `{"total_documents": 50, "categories": {"sebi_guidelines": 15, ...}, "last_updated": "2025-09-27"}`

### Docker Testing
```bash
# Verify container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
# Test inter-service communication
docker exec -it multilingual-service curl http://finance-service:8001/health
# Check knowledge base persistence
docker-compose down && docker-compose up -d
curl http://localhost:8001/knowledge_base_stats
```

### Performance Validation
| Endpoint                | Target Time | Test Method         |
|-------------------------|-------------|---------------------|
| `/process_voice`        | <3s         | Audio upload test   |
| `/portfolio_optimization`| <0.1s       | Postman timer       |
| `/rag_query`            | <0.5s       | Postman timer       |
| `/optimize_budget`      | <0.2s       | Postman timer       |
| `/health`               | <1s         | Collection runner   |

## 🔍 Troubleshooting

### Common Issues
1. **404 Not Found for `/webhook-test`**:
   - Remove `/webhook-test` from `twilio_setup.py` (line ~93) as it’s undefined.
   - Update `test_flask_app` to test only `/health` and `/voice`.
2. **AttributeError: 'FinancialAdvisor' object has no attribute 'generate_response'**:
   - Ensure `app.py` includes `generate_response` in the `FinancialAdvisor` class (lines ~190–223).
   - Clear Python cache:
     ```bash
     del /s *.pyc
     rmdir /s /q __pycache__
     ```
   - Restart Flask: `python app.py`.
3. **Topic Switching**:
   - Verify `determine_query_category` in `app.py` uses session history (see previous fixes).
   - Update `/process_speech` to append `last_query` for vague inputs like "tell me more."
4. **Service Failures**:
   - Check API keys in `.env`.
   - Review `logs/` and `financial_agent.log` for errors.
   - Restart services: `docker-compose down && docker-compose up -d`.

### Debugging Tips
- Add logging in `app.py` (line ~257):
  ```python
  logger.info(f"Received speech: {speech}, Session ID: {session_id}")
  ```
- Test endpoints with curl:
  ```bash
  curl -X POST -d "SpeechResult=How do I file taxes?&CallSid=test123" http://localhost:5000/process_speech
  ```
- Monitor Docker resource usage:
  ```bash
  docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
  ```

## 🌟 Key Innovations

### Multilingual Processing
- **AI4Bharat Integration**: Uses IndicConformer for speech recognition, IndicTrans2 for translation, and IndicTTS for natural audio responses in 11+ Indian languages.
- **Hybrid Intent System**: Combines Gemini Pro, Groq, and Ollama for robust intent analysis with 99% uptime.
- **Multi-Tier Translation**: Hierarchical fallback (IndicTrans2 → NLLB → Google Translate) ensures accurate financial term translation.

### Financial Analytics
- **Markowitz Optimization**: Tailored for Indian markets with RBI/SEBI-compliant parameters, using real-time yfinance data.
- **Multi-Armed Bandit Budgeting**: Adaptive 50/30/20 rule with epsilon-greedy strategy (ε=0.1) that learns from user feedback.
- **K-Means Clustering**: Classifies users into 5 investment personas (e.g., "Young Aggressive Saver") for personalized advice.
- **RAG System**: Queries 50+ financial documents with AI4Bharat embeddings for precise, regulatory-compliant answers.
- **Portfolio Drift Detection**: Real-time monitoring with 5% threshold and tax-efficient rebalancing.
- **Anomaly Detection**: ML-based expense analysis with early warnings for unusual spending patterns.

### Infrastructure
- **Microservices Architecture**: Docker-optimized FastAPI and Flask services with layer caching and volume mounts.
- **Performance Optimization**: Achieves <3s voice processing, <0.1s portfolio calculations, and <0.5s RAG queries.
- **Testing Suite**: 100% endpoint coverage with Postman and curl-based validation.

## 📋 API Documentation

### API Gateway (Port 8080)
- **GET /health**: System status.
  - Output: `{"gateway": "healthy", "multilingual_service": "healthy", "finance_service": "healthy"}`
- **GET /services**: Lists available services.
  - Output: `{"services": {"multilingual_service": "http://localhost:8000", "finance_service": "http://localhost:8001"}}`
- **POST /process_request**: Universal query handler.
  - Input: `{"text": str, "user_language": str, "intent": str (optional)}`
  - Output: `{"response": str, "service_used": str, "confidence": float}`

### FastAPI 1: Multilingual Service (Port 8000)
- **POST /process_voice**: Process audio input.
  - Input: `multipart/form-data` with `file` (WAV/MP3, <10MB) and `language` (optional).
  - Output: `{"transcription": str, "translation": str, "intent": str, "response": str, "processing_time": float}`
- **POST /translate**: Translate text.
  - Input: `{"text": str, "source_language": str, "target_language": str}`
  - Output: `{"translated_text": str, "confidence_score": float, "processing_time": float}`
- **POST /understand_intent**: Analyze query intent.
  - Input: `{"text": str, "user_language": str}`
  - Output: `{"intent": str, "entities": dict, "confidence": float, "suggested_action": str}`
- **POST /get_audio_response**: Generate TTS audio.
  - Input: `{"text": str, "language": str}`
  - Output: WAV audio stream.

### FastAPI 2: Finance Service (Port 8001)
- **POST /portfolio_optimization**: Optimize portfolio.
  - Input: `{"investment_amount": float, "risk_tolerance": str ("conservative"/"moderate"/"aggressive"), "investment_horizon": int, "preferences": dict}`
  - Output: `{"persona": str, "allocation": dict, "expected_return": float, "risk_score": float, "processing_time": float}`
- **POST /get_portfolio_allocation**: Detailed portfolio strategy.
  - Input: `{"age": int, "income": float, "savings": float, "dependents": int, "risk_tolerance": int (1-5), "goal_type": str, "time_horizon": int}`
  - Output: `{"persona": str, "allocation": dict, "allocation_amounts": dict, "expected_return": float, "risk_score": float}`
- **POST /check_rebalancing**: Portfolio drift analysis.
  - Input: `{"profile": dict, "current_allocation": dict, "threshold": float (default 0.05)}`
  - Output: `{"drift_detected": bool, "recommendations": list, "transaction_costs": float}`
- **POST /optimize_budget**: Adaptive budget allocation.
  - Input: `{"profile": dict, "spending_data": list, "feedback": dict, "preferences": dict}`
  - Output: `{"adaptive_allocation": dict, "bandit_state": dict, "recommendations": list, "confidence_score": float}`
- **POST /calculate_health_score**: Financial health assessment.
  - Input: `{"age": int, "income": float, "savings": float, "dependents": int, "risk_tolerance": int}`
  - Output: `{"health_score": int (0-100), "recommendations": list}`
- **POST /detect_anomalies**: Expense anomaly detection.
  - Input: `[{"amount": float, "category": str, "date": str}]`
  - Output: `{"anomalies": list, "confidence_scores": list}`
- **POST /rag_query**: Query financial knowledge base.
  - Input: `{"query": str, "top_k": int (default 5)}`
  - Output: `{"answer": str, "relevant_documents": list, "confidence_score": float}`
- **GET /knowledge_base_stats**: Knowledge base metrics.
  - Output: `{"total_documents": int, "total_chunks": int, "categories": dict, "last_updated": str}`

### Flask: Voice Service (Port 5000)
- **POST /voice**: Initiate Twilio voice call.
  - Output: TwiML response to gather speech.
- **POST /process_speech**: Process speech input.
  - Input: `{"SpeechResult": str, "CallSid": str}`
  - Output: TwiML with AI-generated response and follow-up prompt.

## 🔒 Security & Compliance
- **Data Privacy**: No persistent storage of sensitive user data; session data cleared after 1 hour.
- **Compliance**: Integrates RBI, SEBI, and IRDAI guidelines into RAG responses.
- **Security**: HTTPS required in production; CORS configured for frontend; fraud detection via anomaly analysis.

## 🛠️ Deployment Details

### Docker Configuration
- **Multi-Stage Builds**:
  - Stage 1: Cache dependencies (`requirements.txt`).
  - Stage 2: Download AI4Bharat models.
  - Stage 3: Copy application code for hot-reloading.
- **Volume Mounts**:
  - `./chroma_financial_db:/app/chroma_db`: Persistent ChromaDB storage.
  - `./models:/app/models`: AI model caching.
  - `./logs:/app/logs`: Application logs.
- **Resource Requirements**:
  - Multilingual Service: 4GB RAM, 2 CPU cores, 2GB storage.
  - Finance Service: 2GB RAM, 1 CPU core, 1GB storage.

### Production Deployment
```bash
# Build and start
docker-compose up -d --build
# Scale services
docker-compose up -d --scale finance-service=3 --scale multilingual-service=2
# Monitor logs
docker-compose logs -f
```

### Development Mode
```bash
# Clear cache
del /s *.pyc
rmdir /s /q __pycache__
# Start services
python app2.py  # Finance Service
python app1.py  # Multilingual Service
python app.py   # Voice Service
```

## 🙏 Acknowledgments
- **AI4Bharat**: For IndicConformer, IndicTrans2, and IndicTTS models.
- **FastAPI & Flask Communities**: For robust web frameworks.
- **Twilio**: For voice call integration.
- **ChromaDB**: For vector database support.
- **Indian Regulatory Bodies**: RBI, SEBI, IRDAI for financial guidelines.

## 📜 License
MIT License