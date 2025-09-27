# FinVoice API Gateway
# Intelligent routing layer for FastAPI microservices

from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import asyncio
import json
import os
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import time
from datetime import datetime
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FinVoice API Gateway",
    description="Intelligent routing layer for multilingual finance services",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
FASTAPI1_URL = os.getenv("FASTAPI1_URL", "http://localhost:8000")  # Multilingual service
FASTAPI2_URL = os.getenv("FASTAPI2_URL", "http://localhost:8001")  # Finance service
GATEWAY_PORT = int(os.getenv("GATEWAY_PORT", "8080"))

# Security
security = HTTPBearer(auto_error=False)

# Service health status
service_health = {
    "multilingual": {"status": "unknown", "last_check": None},
    "finance": {"status": "unknown", "last_check": None}
}
# Conversation state management for Indian financial context
conversation_states = {}

class IndianFinancialContext:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.region = "north"  # default
        self.language_preference = "hindi"
        self.financial_profile = {}
        self.recent_queries = []
        self.scheme_interests = []
        
    def update_context(self, query: str, response: dict):
        self.recent_queries.append({
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "intent": response.get("intent", "unknown")
        })
        
        # Keep only last 5 queries
        if len(self.recent_queries) > 5:
            self.recent_queries.pop(0)
# Request models
class QueryRequest(BaseModel):
    query: str
    language: Optional[str] = "english"
    user_id: Optional[str] = None

class PortfolioRequest(BaseModel):
    investment_amount: float
    risk_tolerance: str
    investment_horizon: int
    preferences: Optional[Dict] = None

class VoiceProcessRequest(BaseModel):
    language: Optional[str] = "hindi"
    response_language: Optional[str] = "hindi"

class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str

# Response models
class GatewayResponse(BaseModel):
    success: bool
    data: Any
    service: str
    timestamp: str
    processing_time: float

class HealthResponse(BaseModel):
    gateway_status: str
    services: Dict[str, Dict]
    timestamp: str

# Utility functions
async def check_service_health(service_url: str, service_name: str) -> bool:
    """Check if a service is healthy"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{service_url}/health")
            is_healthy = response.status_code == 200
            service_health[service_name] = {
                "status": "healthy" if is_healthy else "unhealthy",
                "last_check": datetime.now().isoformat()
            }
            return is_healthy
    except Exception as e:
        logger.error(f"Health check failed for {service_name}: {e}")
        service_health[service_name] = {
            "status": "unhealthy",
            "last_check": datetime.now().isoformat(),
            "error": str(e)
        }
        return False

async def route_request(service_url: str, endpoint: str, method: str = "POST", 
                       data: Any = None, files: Dict = None, params: Dict = None) -> Dict:
    """Route request to appropriate service"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{service_url}{endpoint}"
            
            # Debug logging
            logger.info(f"Routing {method} request to {url}")
            logger.info(f"Data: {data}")
            logger.info(f"Params: {params}")
            
            if method.upper() == "GET":
                response = await client.get(url, params=params)
            elif method.upper() == "POST":
                if files:
                    # For file uploads, use form data
                    response = await client.post(url, data=data or {}, files=files, params=params)
                elif params and not data:
                    # For query parameters only, use params
                    response = await client.post(url, params=params)
                else:
                    # For JSON data, use json (default case)
                    response = await client.post(url, json=data)
            else:
                raise HTTPException(status_code=405, detail="Method not allowed")
            
            logger.info(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 422:
                error_detail = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                logger.error(f"Validation error for {endpoint}: {error_detail}")
                raise HTTPException(status_code=422, detail=f"Validation error: {error_detail}")
            else:
                logger.error(f"Service error for {endpoint}: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail=response.text)
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Service timeout")
    except httpx.ConnectError:
        logger.error(f"Cannot connect to service: {service_url}")
        raise HTTPException(status_code=503, detail="Service unavailable")
    except Exception as e:
        logger.error(f"Routing error for {endpoint}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal routing error: {str(e)}")

def determine_service_route(endpoint: str, request_data: Any = None) -> tuple:
    """Intelligent routing logic"""
    # Voice and language processing routes -> FastAPI 1
    voice_routes = [
        "/process_voice", "/get_audio_response", "/translate", 
        "/understand_intent", "/process_multilingual_query", "/test_asr"
    ]
    
    # Finance and portfolio routes -> FastAPI 2
    finance_routes = [
        "/process_request", "/get_portfolio_allocation", "/check_rebalancing",
        "/calculate_health_score", "/detect_anomalies", "/rag_query",
        "/knowledge_base_stats", "/portfolio_optimization", "/optimize_budget"
    ]
    
    if endpoint in voice_routes:
        return FASTAPI1_URL, "multilingual"
    elif endpoint in finance_routes:
        return FASTAPI2_URL, "finance"
    else:
        # Intelligent content-based routing
        if request_data:
            content = str(request_data).lower()
            finance_keywords = [
                "portfolio", "investment", "stock", "mutual fund", "risk", "return",
                "allocation", "budget", "financial", "market", "equity", "debt"
            ]
            if any(keyword in content for keyword in finance_keywords):
                return FASTAPI2_URL, "finance"
        
        # Default to multilingual service for unknown routes
        return FASTAPI1_URL, "multilingual"

# Gateway endpoints

@app.get("/")
async def gateway_home():
    """Gateway home endpoint"""
    return {
        "service": "FinVoice API Gateway",
        "version": "1.0.0",
        "description": "Intelligent routing for multilingual finance services",
        "services": {
            "multilingual": FASTAPI1_URL,
            "finance": FASTAPI2_URL
        },
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse)
async def gateway_health():
    """Comprehensive health check"""
    # Check both services
    multilingual_healthy = await check_service_health(FASTAPI1_URL, "multilingual")
    finance_healthy = await check_service_health(FASTAPI2_URL, "finance")
    
    gateway_status = "healthy" if multilingual_healthy and finance_healthy else "degraded"
    
    return HealthResponse(
        gateway_status=gateway_status,
        services=service_health,
        timestamp=datetime.now().isoformat()
    )

@app.get("/services")
async def list_services():
    """List all available services and their endpoints"""
    return {
        "multilingual_service": {
            "url": FASTAPI1_URL,
            "endpoints": [
                "/process_voice", "/get_audio_response", "/translate",
                "/understand_intent", "/process_multilingual_query", "/test_asr"
            ]
        },
        "finance_service": {
            "url": FASTAPI2_URL,
            "endpoints": [
                "/process_request", "/get_portfolio_allocation", "/check_rebalancing",
                "/calculate_health_score", "/detect_anomalies", "/rag_query",
                "/knowledge_base_stats", "/portfolio_optimization", "/optimize_budget"
            ]
        }
    }

# Voice and Language Processing Routes

@app.post("/process_voice")
async def process_voice_request(audio: UploadFile = File(...), language: str = "hindi"):
    """
    Main endpoint: Process voice input and return voice response
    
    Input: Audio file (WAV/MP3) and optional language parameter
    Output: JSON with response text and audio file
    """
    start_time = time.time()
    try:
        # Read uploaded content and forward to multilingual service
        content = await audio.read()
        files = {
            "audio": (audio.filename or "audio", content, audio.content_type or "application/octet-stream")
        }
        data = {"language": language}

        # Proxy the request to FastAPI1 (multilingual service)
        result = await route_request(FASTAPI1_URL, "/process_voice", "POST", data=data, files=files)

        return GatewayResponse(
            success=True,
            data=result,
            service="multilingual",
            timestamp=datetime.now().isoformat(),
            processing_time=time.time() - start_time
        )
    except HTTPException:
        # Re-raise HTTP exceptions from route_request so FastAPI returns proper status codes
        raise
    except Exception as e:
        logger.error(f"Error in /process_voice proxy: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/get_audio_response")
async def get_audio_response(request_data: dict):
    """Route audio response generation to multilingual service"""
    start_time = time.time()
    
    result = await route_request(FASTAPI1_URL, "/get_audio_response", "POST", data=request_data)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="multilingual",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

@app.post("/translate")
async def translate(request: TranslationRequest):
    """Route translation to multilingual service"""
    start_time = time.time()
    
    # Use POST with JSON body instead of query parameters
    data = {
        "text": request.text,
        "source_language": request.source_language,
        "target_language": request.target_language
    }
    
    result = await route_request(FASTAPI1_URL, "/translate", "POST", data=data)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="multilingual",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

@app.post("/understand_intent")
async def understand_intent(request_data: dict):
    """Route intent understanding to multilingual service"""
    start_time = time.time()
    
    result = await route_request(FASTAPI1_URL, "/understand_intent", "POST", data=request_data)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="multilingual",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

@app.post("/process_multilingual_query")
async def process_multilingual_query(request: QueryRequest):
    """Route multilingual query processing"""
    start_time = time.time()
    
    multilingual_data = {
        "text": request.query,
        "language": request.language,
        "user_id": request.user_id,
        "auto_detect": True
    }
    result = await route_request(FASTAPI1_URL, "/process_multilingual_query", "POST", data=multilingual_data)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="multilingual",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

# Finance and Portfolio Routes

@app.post("/process_request")
async def process_finance_request(request: QueryRequest):
    """Enhanced finance request processing with Indian context"""
    start_time = time.time()
    
    try:
        # Get or create user context
        user_context = conversation_states.get(request.user_id, IndianFinancialContext(request.user_id))
        conversation_states[request.user_id] = user_context
        
        # Enhanced finance data with Indian context
        finance_data = {
            "text": request.query,  # Change from "query" to "text"
            "intent": "general_query",
            "entities": {},
            "user_language": request.language or "hindi",
            "user_id": request.user_id,
            "indian_context": {
                "region": user_context.region,
                "recent_queries": user_context.recent_queries,
                "scheme_interests": user_context.scheme_interests
            }
        }
        
        # Try finance service with enhanced context
        result = await route_request(FASTAPI2_URL, "/process_request", "POST", data=finance_data)
        
        # Update user context
        user_context.update_context(request.query, result)
        
        service_used = "finance-enhanced"
        
    except HTTPException as e:
        logger.warning(f"Enhanced finance service failed: {e}")
        # Fallback to basic processing
        try:
            basic_data = {
                "text": request.query,
                "auto_detect": True,
                "language": request.language
            }
            result = await route_request(FASTAPI1_URL, "/process_multilingual_query", "POST", data=basic_data)
            service_used = "multilingual (fallback)"
        except HTTPException as fallback_error:
            logger.error(f"Both services failed: {fallback_error}")
            raise e
    
    return GatewayResponse(
        success=True,
        data=result,
        service=service_used,
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )
    
@app.post("/portfolio_optimization")
async def portfolio_optimization(request: PortfolioRequest):
    """Route portfolio optimization to finance service"""
    start_time = time.time()
    
    # Ensure preferences is not None
    preferences = request.preferences or {}
    
    # Convert risk tolerance string to integer (1-5 scale)
    risk_tolerance_map = {
        "conservative": 2,
        "moderate": 3,
        "balanced": 3,
        "aggressive": 4,
        "high": 5,
        "low": 1
    }
    risk_tolerance_int = risk_tolerance_map.get(request.risk_tolerance.lower(), 3)  # Default to moderate (3)
    
    # Create proper UserProfile structure for FastAPI2
    user_profile = {
        "age": preferences.get("age", 30),
        "income": preferences.get("income", max(request.investment_amount * 2, 50000)),  # Ensure reasonable income
        "savings": request.investment_amount,
        "dependents": preferences.get("dependents", 1),
        "risk_tolerance": risk_tolerance_int,  # Convert to integer as expected by the service
        "goal_type": preferences.get("goal_type", "investment"),
        "time_horizon": request.investment_horizon,
        "esg_preference": preferences.get("esg_preference", "moderate")
    }
    
    # Debug logging
    logger.info(f"Original request: {request.dict()}")
    logger.info(f"Mapped user profile: {user_profile}")
    
    # Wrap user profile in the expected format for the finance service
    request_data = {
        "profile": user_profile,
        "goals": ["investment"],
        "time_horizon_years": request.investment_horizon
    }
    
    logger.info(f"Final request data: {request_data}")
    
    result = await route_request(FASTAPI2_URL, "/portfolio_optimization", "POST", data=request_data)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="finance",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

@app.post("/rag_query")
async def rag_query(request_data: dict):
    """Route RAG queries to finance service"""
    start_time = time.time()
    
    # Handle both dict and string inputs
    if isinstance(request_data, dict):
        query_text = request_data.get("query", str(request_data))
        top_k = request_data.get("top_k", 5)
    else:
        query_text = str(request_data)
        top_k = 5
    
    # Convert to query parameters for FastAPI2 compatibility
    params = {
        "query": query_text,
        "top_k": top_k
    }
    
    result = await route_request(FASTAPI2_URL, "/rag_query", "POST", params=params)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="finance",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

@app.get("/knowledge_base_stats")
async def knowledge_base_stats():
    """Route knowledge base stats to finance service"""
    start_time = time.time()
    
    result = await route_request(FASTAPI2_URL, "/knowledge_base_stats", "GET")
    
    return GatewayResponse(
        success=True,
        data=result,
        service="finance",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

# Intelligent Universal Endpoint
@app.post("/query")
async def universal_query(request: QueryRequest):
    """Universal query endpoint with intelligent routing"""
    start_time = time.time()
    
    service_url, service_name = determine_service_route("/query", request.dict())
    
    try:
        if service_name == "finance":
            # Format for finance service
            finance_data = {
                "text": request.query,  # Use "text" not "query"
                "intent": "general_query",
                "entities": {},
                "user_language": request.language or "english"
            }
            result = await route_request(service_url, "/process_request", "POST", data=finance_data)
        else:
            # Format for multilingual service
            multilingual_data = {
                "text": request.query,
                "auto_detect": True,
                "language": request.language
            }
            result = await route_request(service_url, "/process_multilingual_query", "POST", data=multilingual_data)
        
        return GatewayResponse(
            success=True,
            data=result,
            service=service_name,
            timestamp=datetime.now().isoformat(),
            processing_time=time.time() - start_time
        )
    except HTTPException as e:
        # Fallback to other service if primary fails
        fallback_url = FASTAPI1_URL if service_name == "finance" else FASTAPI2_URL
        fallback_service = "multilingual" if service_name == "finance" else "finance"
        fallback_endpoint = "/process_multilingual_query" if service_name == "finance" else "/process_request"
        
        try:
            result = await route_request(fallback_url, fallback_endpoint, "POST", data=request.dict())
            
            return GatewayResponse(
                success=True,
                data=result,
                service=f"{fallback_service} (fallback)",
                timestamp=datetime.now().isoformat(),
                processing_time=time.time() - start_time
            )
        except:
            raise e

# Special endpoint for raw string RAG queries
@app.post("/rag_query_text")
async def rag_query_text(request: Request):
    """Route raw text RAG queries to finance service"""
    start_time = time.time()
    
    # Handle both JSON string and raw text input
    try:
        content_type = request.headers.get('content-type', '')
        if 'application/json' in content_type:
            # Handle JSON string input
            raw_data = await request.json()
            if isinstance(raw_data, str):
                query = raw_data
            else:
                # If it's an object, assume it has a query field
                query = raw_data.get('query', str(raw_data))
        else:
            # Handle raw text input
            query = (await request.body()).decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid input format: {str(e)}")
    
    params = {
        "query": query,
        "top_k": 5
    }
    
    result = await route_request(FASTAPI2_URL, "/rag_query", "POST", params=params)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="finance",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

# Additional portfolio endpoint that accepts UserProfile directly
@app.post("/get_portfolio_allocation")
async def get_portfolio_allocation(user_profile: dict):
    """Route portfolio allocation directly to finance service"""
    start_time = time.time()
    
    result = await route_request(FASTAPI2_URL, "/get_portfolio_allocation", "POST", data=user_profile)
    
    return GatewayResponse(
        success=True,
        data=result,
        service="finance",
        timestamp=datetime.now().isoformat(),
        processing_time=time.time() - start_time
    )

# Dynamic routing for any endpoint

@app.api_route("/{endpoint:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def dynamic_route(endpoint: str, request: Request):
    """Dynamic routing for any endpoint"""
    start_time = time.time()
    
    method = request.method
    
    # Get request data
    if method in ["POST", "PUT"]:
        try:
            request_data = await request.json()
        except:
            request_data = None
    else:
        request_data = dict(request.query_params)
    
    # Determine service
    service_url, service_name = determine_service_route(f"/{endpoint}", request_data)
    
    try:
        result = await route_request(service_url, f"/{endpoint}", method, data=request_data)
        
        return GatewayResponse(
            success=True,
            data=result,
            service=service_name,
            timestamp=datetime.now().isoformat(),
            processing_time=time.time() - start_time
        )
    except HTTPException as e:
        # Don't re-raise as 500, preserve original error
        logger.error(f"Dynamic routing failed for /{endpoint}: {e}")
        raise e  # This maintains the original status code
# Startup and shutdown events

@app.on_event("startup")
async def startup_event():
    """Initialize gateway on startup"""
    logger.info("🚀 FinVoice API Gateway starting up...")
    
    # Initial health checks
    await check_service_health(FASTAPI1_URL, "multilingual")
    await check_service_health(FASTAPI2_URL, "finance")
    
    logger.info(f"✅ Gateway ready on port {GATEWAY_PORT}")
    logger.info(f"📡 Multilingual Service: {FASTAPI1_URL}")
    logger.info(f"💰 Finance Service: {FASTAPI2_URL}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 FinVoice API Gateway shutting down...")

# Error handlers

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.now().isoformat(),
            "path": request.url.path
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat(),
            "path": request.url.path
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=GATEWAY_PORT,
        reload=True,
        log_level="info"
    )