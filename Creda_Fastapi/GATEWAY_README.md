# 🎯 FinVoice API Gateway

**Intelligent routing layer for FinVoice microservices** - Routes requests between multilingual and finance services with automatic failover and load balancing.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│  API Gateway     │───▶│ FastAPI Service │
│  (Ngrok, Web)   │    │  (Port 8080)     │    │   (Port 8000)   │
└─────────────────┘    │                  │    │   Multilingual  │
                       │ Intelligent      │    └─────────────────┘
                       │ Routing Logic    │           
                       │                  │    ┌─────────────────┐
                       │ Health Checks    │───▶│ FastAPI Service │
                       │ Load Balancing   │    │   (Port 8001)   │
                       │ Auto Failover    │    │    Finance      │
                       └──────────────────┘    └─────────────────┘
```

## 🚀 Features

### 🧠 Intelligent Routing
- **Content-based routing**: Analyzes request content to route to appropriate service
- **Endpoint mapping**: Direct routing for known endpoints
- **Fallback logic**: Automatically retries on other service if primary fails
- **Universal endpoint**: `/query` route with smart service selection

### 🏥 Health Management
- **Real-time health checks**: Monitors both services continuously
- **Service discovery**: Automatic detection of available services
- **Health status API**: `/health` endpoint for monitoring
- **Graceful degradation**: Continues working even if one service is down

### 🔧 Production Ready
- **CORS enabled**: Ready for web application integration
- **Error handling**: Comprehensive error responses with proper HTTP codes
- **Logging**: Detailed request/response logging
- **Metrics**: Processing time tracking for performance monitoring

## 📡 API Endpoints

### Gateway Management
- `GET /` - Gateway information and service status
- `GET /health` - Comprehensive health check
- `GET /services` - List all available services and endpoints

### Voice & Language Processing (→ FastAPI 1)
- `POST /process_voice` - Voice file processing
- `POST /get_audio_response` - Audio response generation
- `POST /translate` - Text translation
- `POST /understand_intent` - Intent classification
- `POST /process_multilingual_query` - Multilingual text processing

### Finance & Portfolio (→ FastAPI 2)
- `POST /process_request` - Finance query processing
- `POST /portfolio_optimization` - Portfolio optimization
- `POST /rag_query` - RAG-based financial queries
- `GET /knowledge_base_stats` - Knowledge base statistics
- `POST /calculate_health_score` - Portfolio health analysis

### Universal
- `POST /query` - **Smart routing endpoint** - analyzes content and routes automatically

## 🛠️ Setup & Usage

### 1. Prerequisites
Make sure both services are running:
```bash
# Terminal 1: Start multilingual service
cd fastapi2
python fastapi1_multilingual.py

# Terminal 2: Start finance service  
cd fastapi2
python fastapi2_finance.py
```

### 2. Configure Environment
```bash
# Copy environment template
copy .env.gateway .env

# Edit .env with your settings:
FASTAPI1_URL=http://localhost:8000
FASTAPI2_URL=http://localhost:8001
GATEWAY_PORT=8080
```

### 3. Start Gateway
```bash
# Option 1: Use startup script
start_gateway.bat

# Option 2: Direct python
python app.py
```

### 4. Test Gateway
```bash
# Run test suite
python test_gateway.py

# Or test manually
curl http://localhost:8080/health
```

## 🌐 Ngrok Deployment

Perfect for exposing your local services to the internet:

```bash
# 1. Start all services (multilingual, finance, gateway)
start_gateway.bat

# 2. In new terminal, start ngrok
ngrok http 8080

# 3. Use the provided ngrok URL
# Example: https://abc123.ngrok.io
```

Your clients can now access all FinVoice features through the single ngrok URL!

## 🔄 Routing Logic

### Automatic Service Detection
```python
# Finance keywords trigger finance service routing
finance_keywords = [
    "portfolio", "investment", "stock", "mutual fund", 
    "risk", "return", "allocation", "budget", "financial"
]

# Voice/language keywords trigger multilingual service
voice_keywords = [
    "translate", "speech", "voice", "audio", "language"
]
```

### Endpoint Mapping
- **Voice routes** → FastAPI 1 (port 8000)
- **Finance routes** → FastAPI 2 (port 8001) 
- **Unknown routes** → Intelligent content analysis

### Fallback Strategy
1. **Primary routing** based on content/endpoint
2. **Fallback** to other service if primary fails
3. **Error response** only if both services fail

## 📊 Request/Response Format

### Standard Gateway Response
```json
{
  "success": true,
  "data": { ... },
  "service": "finance",
  "timestamp": "2025-09-26T21:30:00Z",
  "processing_time": 1.23
}
```

### Health Check Response
```json
{
  "gateway_status": "healthy",
  "services": {
    "multilingual": {
      "status": "healthy",
      "last_check": "2025-09-26T21:30:00Z"
    },
    "finance": {
      "status": "healthy", 
      "last_check": "2025-09-26T21:30:00Z"
    }
  },
  "timestamp": "2025-09-26T21:30:00Z"
}
```

## 🧪 Testing Examples

### Test Universal Query
```bash
# Finance query (should route to finance service)
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"query": "I want to invest 50000 in mutual funds", "language": "english"}'

# General query (should route to multilingual service)
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello, how are you?", "language": "hindi"}'
```

### Test Translation
```bash
curl -X POST http://localhost:8080/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Stock market", "source_language": "english", "target_language": "hindi"}'
```

### Test RAG Query
```bash
curl -X POST http://localhost:8080/rag_query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are SEBI guidelines?", "top_k": 5}'
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Service URLs
FASTAPI1_URL=http://localhost:8000    # Multilingual service
FASTAPI2_URL=http://localhost:8001    # Finance service
GATEWAY_PORT=8080                     # Gateway port

# Timeouts and limits
TIMEOUT_SECONDS=30                    # Request timeout
MAX_WORKERS=4                         # Concurrent requests

# Logging
LOG_LEVEL=INFO                        # Log level
```

## 🎉 Benefits

### For Development
- ✅ **Single endpoint** for all services
- ✅ **Easy testing** with comprehensive test suite
- ✅ **Health monitoring** for debugging
- ✅ **Detailed logging** for troubleshooting

### For Production
- ✅ **High availability** with automatic failover
- ✅ **Load balancing** across services  
- ✅ **Performance metrics** tracking
- ✅ **CORS support** for web applications

### For Deployment
- ✅ **Ngrok ready** - single tunnel for all services
- ✅ **Docker friendly** - can be containerized
- ✅ **Cloud ready** - deploy to any cloud platform
- ✅ **Scalable** - add more services easily

## 🚀 Ready to Use!

Your API Gateway is production-ready and perfect for:
- **Mobile apps** connecting to FinVoice
- **Web applications** with CORS support
- **Third-party integrations** via single API
- **Development testing** with ngrok tunneling

**Start the gateway and expose your entire FinVoice ecosystem through one powerful endpoint!** 🎯