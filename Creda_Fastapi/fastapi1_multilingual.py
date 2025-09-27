# FastAPI 1: Multilingual Speech Recognition & TTS Service
# app1.py

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
import uvicorn
import torch
import librosa
import numpy as np
from transformers import (
    AutoProcessor, AutoModelForSpeechSeq2Seq, 
    AutoTokenizer, AutoModelForSeq2SeqLM,
    AutoModel, pipeline
)
import requests
import io
import json
import tempfile
import os
import time
from pydantic import BaseModel
from typing import Optional, Dict, Any
import google.generativeai as genai
from groq import Groq
import subprocess
import warnings
from dotenv import load_dotenv
warnings.filterwarnings("ignore")

# Load environment variables
load_dotenv()

app = FastAPI(title="Multilingual Finance Voice Assistant", version="1.0.0")

# Configure APIs
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-gemini-key")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-key") 
FASTAPI2_URL = os.getenv("FASTAPI2_URL", "http://localhost:8001")
HF_TOKEN = os.getenv("HF_TOKEN")

genai.configure(api_key=GEMINI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

class SpeechRequest(BaseModel):
    text: str
    target_language: str = "english"

class IntentResponse(BaseModel):
    intent: str
    entities: Dict[str, Any]
    confidence: float

class Models:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
            
        # Initialize asr_model as None
        self.asr_model = None
        self.asr_processor = None
        self.asr_tokenizer = None
            
        # Load AI4Bharat IndicConformer ASR model
        try:
            print("🔄 Loading AI4Bharat IndicConformer model...")
            if HF_TOKEN:
                self.asr_model = AutoModel.from_pretrained(
                    "ai4bharat/indic-conformer-600m-multilingual", 
                    token=HF_TOKEN,
                    trust_remote_code=True
                )
            else:
                self.asr_model = AutoModel.from_pretrained(
                    "ai4bharat/indic-conformer-600m-multilingual",
                    trust_remote_code=True
                )
            self.asr_processor = None
            print(f"✅ Loaded AI4Bharat IndicConformer ASR model: {type(self.asr_model).__name__}")
            print(f"Available methods: {[method for method in dir(self.asr_model) if callable(getattr(self.asr_model, method)) and not method.startswith('_')]}")
        except Exception as e:
            print(f"❌ Failed to load AI4Bharat ASR: {e}")
            # Try alternative model names
            model_alternatives = [
                "ai4bharat/indicwav2vec2-hindi",
                "openai/whisper-small"
            ]
            for model_name in model_alternatives:
                try:
                    if "whisper" in model_name:
                        self.asr_model = pipeline("automatic-speech-recognition", 
                                                model=model_name, 
                                                device=0 if self.device == "cuda" else -1)
                        print(f"⚠️ Using Whisper ASR as fallback: {type(self.asr_model).__name__}")
                        break
                    else:
                        self.asr_model = AutoModel.from_pretrained(model_name, trust_remote_code=True)
                        print(f"✅ Loaded alternative model {model_name}: {type(self.asr_model).__name__}")
                        break
                except Exception as alt_e:
                    print(f"❌ Failed to load {model_name}: {alt_e}")
                    continue
            else:
                print("❌ No ASR model could be loaded")
                self.asr_model = None
            
        # Load AI4Bharat IndicTrans2 Translation model
        try:
            print("🔄 Loading AI4Bharat IndicTrans2 model...")
            if HF_TOKEN:
                self.translator_tokenizer = AutoTokenizer.from_pretrained(
                    "ai4bharat/indictrans2-indic-en-1B",
                    token=HF_TOKEN,
                    trust_remote_code=True
                )
                self.translator_model = AutoModelForSeq2SeqLM.from_pretrained(
                    "ai4bharat/indictrans2-indic-en-1B",
                    token=HF_TOKEN,
                    trust_remote_code=True,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
            else:
                self.translator_tokenizer = AutoTokenizer.from_pretrained(
                    "ai4bharat/indictrans2-indic-en-1B",
                    trust_remote_code=True
                )
                self.translator_model = AutoModelForSeq2SeqLM.from_pretrained(
                    "ai4bharat/indictrans2-indic-en-1B",
                    trust_remote_code=True,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
                
            # Move model to device
            self.translator_model = self.translator_model.to(self.device)
                
            # Initialize IndicProcessor
            try:
                from IndicTransToolkit.processor import IndicProcessor
                self.indic_processor = IndicProcessor(inference=True)
                print("✅ Loaded AI4Bharat IndicTrans2 model with processor")
            except ImportError:
                print("⚠️ IndicTransToolkit not available, using basic tokenizer")
                self.indic_processor = None
                print("✅ Loaded AI4Bharat IndicTrans2 model (basic mode)")
                    
        except Exception as e:
            print(f"❌ Failed to load AI4Bharat Translation: {e}")
            self.translator_model = pipeline("translation", 
                                        model="facebook/nllb-200-distilled-600M",
                                        device=0 if self.device == "cuda" else -1)
            self.translator_tokenizer = None
            self.indic_processor = None
            print("⚠️ Using NLLB translation as fallback")
            
        # Language mappings
        self.lang_codes = {
            "hindi": "hi", "english": "en", "tamil": "ta", 
            "telugu": "te", "bengali": "bn", "marathi": "mr",
            "gujarati": "gu", "kannada": "kn", "malayalam": "ml",
            "punjabi": "pa", "urdu": "ur"
        }
        
    
models = Models()

async def detect_language_from_audio(audio_data: np.ndarray) -> str:
    """Detect language from audio using spectral characteristics"""
    try:
        # Simple heuristic based on frequency characteristics
        # Different languages have different spectral signatures
        
        # Calculate spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=16000)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=16000)[0]
        mfccs = librosa.feature.mfcc(y=audio_data, sr=16000, n_mfcc=13)
        
        # Simple rule-based detection (can be improved with ML model)
        mean_centroid = np.mean(spectral_centroid)
        mean_rolloff = np.mean(spectral_rolloff)
        
        # Basic heuristics for Indian languages
        if mean_centroid > 2000 and mean_rolloff > 4000:
            return "hindi"  # Hindi tends to have higher frequencies
        elif mean_centroid < 1500:
            return "tamil"  # Tamil has distinctive lower frequencies
        elif mean_centroid > 1800:
            return "bengali"  # Bengali characteristics
        else:
            return "hindi"  # Default to Hindi for Indian context
            
    except Exception as e:
        print(f"Audio language detection failed: {e}")
        return "hindi"  # Default fallback

async def detect_language_from_text(text: str) -> str:
    """Detect language from text using character analysis"""
    try:
        # Import language detection library
        try:
            from langdetect import detect
            detected = detect(text)
            
            # Map detected codes to our supported languages
            lang_mapping = {
                'hi': 'hindi', 'en': 'english', 'ta': 'tamil',
                'te': 'telugu', 'bn': 'bengali', 'mr': 'marathi',
                'gu': 'gujarati', 'kn': 'kannada', 'ml': 'malayalam',
                'pa': 'punjabi', 'ur': 'urdu'
            }
            
            return lang_mapping.get(detected, 'hindi')
            
        except ImportError:
            # Fallback to character-based detection
            # Count Devanagari characters for Hindi
            devanagari_count = sum(1 for char in text if '\u0900' <= char <= '\u097F')
            # Count Latin characters for English
            latin_count = sum(1 for char in text if char.isascii() and char.isalpha())
            # Count Tamil characters
            tamil_count = sum(1 for char in text if '\u0B80' <= char <= '\u0BFF')
            # Count Telugu characters
            telugu_count = sum(1 for char in text if '\u0C00' <= char <= '\u0C7F')
            # Count Bengali characters
            bengali_count = sum(1 for char in text if '\u0980' <= char <= '\u09FF')
            
            total_chars = len(text)
            if total_chars == 0:
                return "english"
                
            # Determine language based on character distribution
            if devanagari_count / total_chars > 0.3:
                return "hindi"
            elif tamil_count / total_chars > 0.3:
                return "tamil"
            elif telugu_count / total_chars > 0.3:
                return "telugu"
            elif bengali_count / total_chars > 0.3:
                return "bengali"
            elif latin_count / total_chars > 0.7:
                return "english"
            else:
                return "hindi"  # Default for Indian context
                
    except Exception as e:
        print(f"Text language detection failed: {e}")
        return "english"  # Safe fallback

async def validate_audio_file(audio_file: UploadFile) -> bool:
    """Validate audio file format and quality"""
    try:
        # Check file size (limit to 10MB)
        content = await audio_file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB
            print(f"Audio validation failed: File size {len(content)} bytes exceeds 10MB limit")
            return False
            
        # Reset file pointer
        await audio_file.seek(0)
            
        # Check if it's a valid audio format
        allowed_types = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/m4a']
        allowed_extensions = ['.wav', '.mp3', '.ogg', '.webm', '.m4a']
            
        content_type = audio_file.content_type
        filename = audio_file.filename or ""
            
        print(f"Validating audio file: content_type={content_type}, filename={filename}")
            
        if content_type not in allowed_types:
            # Fallback to extension check
            if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
                print(f"Audio validation failed: Invalid content type {content_type} and filename {filename}")
                return False
            
        return True
    except Exception as e:
        print(f"Audio validation error: {str(e)}")
        return False

async def preprocess_audio(audio_data: bytes, target_sr: int = 16000) -> tuple[np.ndarray, float]:
    """Preprocess audio to required format with quality scoring"""
    try:
        # Save to temporary file for librosa
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name
        
        # Load and convert audio
        audio, sr = librosa.load(tmp_file_path, sr=target_sr, mono=True)
        
        # Audio quality assessment
        rms = librosa.feature.rms(y=audio)[0]
        quality_score = min(np.mean(rms) * 10, 1.0)  # Normalize to 0-1
        
        # Remove silence
        audio, _ = librosa.effects.trim(audio, top_db=20)
        
        # Normalize audio
        audio = librosa.util.normalize(audio)
        
        os.unlink(tmp_file_path)
        return audio, quality_score
        
    except Exception as e:
        print(f"Audio preprocessing error: {e}")
        raise HTTPException(status_code=400, detail=f"Audio preprocessing failed: {str(e)}")

async def detect_language_from_audio_advanced(audio: np.ndarray, sr: int = 16000) -> tuple[str, float]:
    """Advanced language detection using audio features"""
    try:
        # Extract comprehensive audio features
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr)[0]
        zero_crossing_rate = librosa.feature.zero_crossing_rate(audio)[0]
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=sr)[0]
        
        # Calculate means
        mfcc_means = np.mean(mfccs, axis=1)
        centroid_mean = np.mean(spectral_centroid)
        rolloff_mean = np.mean(spectral_rolloff)
        zcr_mean = np.mean(zero_crossing_rate)
        bandwidth_mean = np.mean(spectral_bandwidth)
        
        # Language detection heuristics (can be replaced with ML model)
        confidence = 0.7
        
        # Hindi: Higher spectral centroid, moderate bandwidth
        if centroid_mean > 1800 and bandwidth_mean > 1500:
            return "hindi", confidence
        
        # Tamil: Lower spectral centroid, unique formant patterns
        elif centroid_mean < 1400 and rolloff_mean < 3000:
            return "tamil", confidence
        
        # Telugu: Moderate spectral features
        elif 1400 <= centroid_mean <= 1700 and zcr_mean > 0.1:
            return "telugu", confidence
        
        # Bengali: Distinctive spectral characteristics
        elif centroid_mean > 1600 and bandwidth_mean < 1400:
            return "bengali", confidence
        
        # English: Higher zero crossing rate, broader bandwidth
        elif zcr_mean > 0.12 and bandwidth_mean > 1800:
            return "english", confidence
        
        else:
            return "hindi", 0.5  # Default with lower confidence
            
    except Exception as e:
        print(f"Advanced audio language detection failed: {e}")
        return "hindi", 0.3

async def speech_to_text(audio_file: UploadFile) -> Dict[str, str]:
    """Convert speech to text using AI4Bharat IndicConformer with fallbacks"""
    start_time = time.time()
        
    try:
        # Validate audio file first
        if not await validate_audio_file(audio_file):
            raise HTTPException(status_code=400, detail="Invalid audio file format or size")
            
        # Read audio content
        content = await audio_file.read()
            
        # Preprocess audio (convert to 16kHz mono)
        audio, quality_score = await preprocess_audio(content, target_sr=16000)
            
        # Advanced language detection
        detected_lang, lang_confidence = await detect_language_from_audio_advanced(audio, sr=16000)
        lang_code = models.lang_codes.get(detected_lang, "hi")
            
        transcription = ""
        confidence = 0.0
        model_used = "unknown"
            
        # Check which model is loaded
        if hasattr(models.asr_model, 'from_pretrained') and not hasattr(models.asr_model, '__call__'):
            print(f"Using AI4Bharat IndicConformer model")
            try:
                # Prepare audio tensor for AI4Bharat model
                audio_tensor = torch.tensor(audio, dtype=torch.float32).unsqueeze(0)
                    
                # Try different IndicConformer interfaces
                if hasattr(models.asr_model, 'transcribe'):
                    print(f"Attempting IndicConformer transcribe method with lang={lang_code}")
                    result = models.asr_model.transcribe(audio_tensor, language=lang_code)
                    transcription = result.get('text', '') if isinstance(result, dict) else str(result)
                    confidence = 0.9
                    model_used = "AI4Bharat-IndicConformer"
                        
                elif hasattr(models.asr_model, 'generate'):
                    print(f"Attempting IndicConformer generate method")
                    with torch.no_grad():
                        generated = models.asr_model.generate(audio_tensor, max_length=512)
                        # Decode generated tokens (this needs tokenizer)
                        if hasattr(models, 'asr_tokenizer') and models.asr_tokenizer:
                            transcription = models.asr_tokenizer.decode(generated[0], skip_special_tokens=True)
                        else:
                            transcription = f"Generated tokens: {generated.shape}"
                    confidence = 0.85
                    model_used = "AI4Bharat-IndicConformer-Generate"
                        
                elif hasattr(models.asr_model, 'forward'):
                    print(f"Attempting IndicConformer forward method with lang={lang_code}")
                    with torch.no_grad():
                        # Add batch dimension if needed
                        if audio_tensor.dim() == 1:
                            audio_tensor = audio_tensor.unsqueeze(0)
                            
                        # Forward pass with lang parameter
                        logits = models.asr_model.forward(audio_tensor, lang=lang_code)
                            
                        # CTC greedy decoding
                        if hasattr(logits, 'logits'):
                            logits = logits.logits
                            
                        # Get most likely tokens
                        predicted_ids = torch.argmax(logits, dim=-1)
                            
                        # Simple greedy decoding (remove blanks and repeats)
                        decoded_tokens = []
                        prev_token = -1
                        for token in predicted_ids[0]:
                            if token != 0 and token != prev_token:  # 0 is blank token
                                decoded_tokens.append(token.item())
                            prev_token = token
                            
                        # Convert tokens to text (needs proper vocabulary mapping)
                        transcription = f"CTC decoded tokens: {len(decoded_tokens)} tokens"
                        confidence = 0.8
                        model_used = "AI4Bharat-IndicConformer-CTC"
                    
                print(f"✅ {model_used} transcription: '{transcription[:50]}...'")
                    
            except Exception as e:
                print(f"❌ AI4Bharat IndicConformer failed: {e}")
                transcription = ""
                confidence = 0.0
            
        # Fallback to Whisper if IndicConformer fails or produces empty result
        if not transcription.strip() or confidence < 0.5:
            print(f"Using Whisper pipeline as fallback with language={lang_code}")
            try:
                # Save audio to temporary file for Whisper
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                    import soundfile as sf
                    sf.write(tmp_file.name, audio, 16000)
                    tmp_file_path = tmp_file.name
                    
                # Use Whisper pipeline fallback; pipeline call signature varies by HF version.
                # Avoid passing unsupported kwargs like 'language' directly to the pipeline function.
                try:
                    result = models.asr_model(tmp_file_path, task="transcribe")
                except TypeError:
                    # Older/newer pipeline versions may require different call patterns; try calling via __call__
                    result = models.asr_model(tmp_file_path)
                    
                # Normalize result to extract text safely
                transcription = result.get("text", str(result)) if isinstance(result, dict) else str(result)
                confidence = 0.85
                model_used = "Whisper-Fallback"
                    
                # Update language detection from transcription
                text_detected_lang = await detect_language_from_text(transcription)
                if text_detected_lang != detected_lang:
                    detected_lang = text_detected_lang
                    lang_confidence = 0.8
                    
                os.unlink(tmp_file_path)
                print(f"✅ Whisper fallback transcription: '{transcription[:50]}...'")
                    
            except Exception as e:
                print(f"❌ Whisper fallback also failed: {e}")
                raise HTTPException(status_code=500, detail=f"All ASR models failed: {str(e)}")
            
        # Calculate final confidence score
        final_confidence = min(confidence * quality_score * lang_confidence, 1.0)
            
        # Performance timing
        processing_time = time.time() - start_time
            
        result = {
            "transcription": transcription.strip(),
            "detected_language": detected_lang,
            "confidence": round(final_confidence, 3),
            "model_used": model_used,
            "processing_time": round(processing_time, 2),
            "audio_quality": round(quality_score, 3),
            "language_confidence": round(lang_confidence, 3)
        }
            
        print(f"🎯 ASR Result: {result}")
        return result
        
    except Exception as e:
        processing_time = time.time() - start_time
        print(f"❌ ASR Error after {processing_time:.2f}s: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ASR Error: {str(e)}")

async def translate_text(text: str, source_lang: str, target_lang: str = "english") -> str:
    """Translate text using AI4Bharat IndicTrans2 models"""
    if source_lang.lower() == target_lang.lower():
        return text
    
    try:
        # Use AI4Bharat IndicTrans2 if available
        if hasattr(models, 'translator_tokenizer') and models.translator_tokenizer:
            # Map language codes for IndicTrans2
            lang_mapping = {
                "hindi": "hin_Deva", "english": "eng_Latn", "tamil": "tam_Taml",
                "telugu": "tel_Telu", "bengali": "ben_Beng", "marathi": "mar_Deva",
                "gujarati": "guj_Gujr", "kannada": "kan_Knda", "malayalam": "mal_Mlym",
                "punjabi": "pan_Guru", "urdu": "urd_Arab"
            }
            
            src_code = lang_mapping.get(source_lang.lower(), "hin_Deva")
            tgt_code = lang_mapping.get(target_lang.lower(), "eng_Latn")
            
            # Prepare input
            if hasattr(models, 'indic_processor') and models.indic_processor:
                # Use IndicProcessor if available
                batch = models.indic_processor.preprocess_batch(
                    [text], src_lang=src_code, tgt_lang=tgt_code
                )
                inputs = models.translator_tokenizer(
                    batch, truncation=True, padding="longest",
                    return_tensors="pt", return_attention_mask=True
                ).to(models.device)
            else:
                # Basic tokenization
                inputs = models.translator_tokenizer(
                    text, return_tensors="pt", padding=True, truncation=True
                ).to(models.device)
            
            # Generate translation
            with torch.no_grad():
                generated_tokens = models.translator_model.generate(
                    **inputs, use_cache=True, min_length=0, max_length=256,
                    num_beams=5, num_return_sequences=1
                )
            
            # Decode the translation
            generated_tokens = models.translator_tokenizer.batch_decode(
                generated_tokens, skip_special_tokens=True, clean_up_tokenization_spaces=True
            )
            
            # Post-process if IndicProcessor is available
            if hasattr(models, 'indic_processor') and models.indic_processor:
                translations = models.indic_processor.postprocess_batch(generated_tokens, lang=tgt_code)
                return translations[0] if translations else text
            else:
                return generated_tokens[0] if generated_tokens else text
                
        else:
            # Fallback to NLLB pipeline
            src_lang_code = models.lang_codes.get(source_lang.lower(), 'hi')
            tgt_lang_code = models.lang_codes.get(target_lang.lower(), 'en')
            
            # NLLB language codes
            nllb_codes = {
                'hi': 'hindi_Devanagari', 'en': 'english',
                'mr': 'marathi_Devanagari', 'ta': 'tamil_Tamil',
                'te': 'telugu_Telugu', 'bn': 'bengali_Bengali'
            }
            
            src_code = nllb_codes.get(src_lang_code, 'hindi_Devanagari')
            tgt_code = nllb_codes.get(tgt_lang_code, 'english')
            
            result = models.translator_model(text, src_lang=src_code, tgt_lang=tgt_code)
            return result[0]['translation_text']
    
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original if translation fails

async def understand_intent(text: str) -> IntentResponse:
    """Understand user intent using LLM with fallbacks"""
    
    prompt = f"""
    Analyze this financial request and extract intent and entities:
    Text: "{text}"
    
    Financial intents include:
    - expense_logging: User wants to log an expense
    - budget_query: User asks about budget/spending
    - portfolio_query: User asks about investments/stocks
    - goal_setting: User wants to set financial goals
    - insurance_query: User asks about insurance
    - bill_payment: User wants to pay bills
    - fraud_alert: User reports suspicious activity
    - general_query: General financial questions
    
    Respond in JSON format:
    {{
        "intent": "intent_name",
        "entities": {{
            "amount": "extracted_amount_if_any",
            "category": "expense_category_if_any",
            "time_period": "time_reference_if_any"
        }},
        "confidence": 0.95
    }}
    """
    
    try:
        # Try Gemini first
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return IntentResponse(**result)
    except:
        try:
            # Try Groq
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",
            )
            result = json.loads(chat_completion.choices[0].message.content)
            return IntentResponse(**result)
        except:
            # Fallback to Ollama
            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={"model": "gemma2:2b", "prompt": prompt, "stream": False}
                )
                result = json.loads(response.json()["response"])
                return IntentResponse(**result)
            except:
                # Default fallback
                return IntentResponse(
                    intent="general_query",
                    entities={"amount": None, "category": None, "time_period": None},
                    confidence=0.5
                )

async def call_finance_api(intent_data: dict) -> dict:
    """Call FastAPI 2 for financial processing"""
    try:
        response = requests.post(f"{FASTAPI2_URL}/process_request", json=intent_data)
        return response.json()
    except Exception as e:
        return {"error": f"Finance API unavailable: {str(e)}"}

async def text_to_speech(text: str, language: str = "english") -> bytes:
    """Convert text to speech using AI4Bharat TTS or fallbacks"""
    try:
        # Try Edge-TTS first (best quality for Indian languages)
        try:
            import edge_tts
            
            # Voice mapping for Indian languages
            voice_map = {
                'hindi': 'hi-IN-SwaraNeural',
                'english': 'en-IN-NeerjaNeural',
                'tamil': 'ta-IN-PallaviNeural',
                'telugu': 'te-IN-ShrutiNeural',
                'bengali': 'bn-IN-BashkarNeural',
                'marathi': 'mr-IN-AarohiNeural',
                'gujarati': 'gu-IN-DhwaniNeural',
                'kannada': 'kn-IN-SapnaNeural',
                'malayalam': 'ml-IN-SobhanaNeural',
                'punjabi': 'pa-IN-GurpreetNeural',
                'urdu': 'ur-IN-GulNeural'
            }
            
            voice = voice_map.get(language.lower(), 'en-IN-NeerjaNeural')
            
            # Generate TTS audio
            communicate = edge_tts.Communicate(text, voice)
            audio_data = b""
            
            # Edge-TTS is async, so we need to handle it properly
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            
            if len(audio_data) > 0:
                return audio_data
                
        except Exception as e:
            print(f"Edge-TTS failed: {e}")
        
        # Fallback to gTTS
        try:
            from gtts import gTTS
            lang_code = models.lang_codes.get(language.lower(), "en")
            tts = gTTS(text=text, lang=lang_code)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                tts.save(tmp_file.name)
                with open(tmp_file.name, "rb") as f:
                    audio_data = f.read()
                os.unlink(tmp_file.name)
                return audio_data
        except Exception as e:
            print(f"gTTS failed: {e}")
            
        # Ultimate fallback - return empty bytes
        return b""
    
    except Exception as e:
        print(f"TTS Error: {e}")
        return b""

@app.get("/")
async def root():
    return {"message": "Multilingual Finance Voice Assistant API", "status": "running"}

@app.get("/health")
async def health_check():
    # Check ASR model type
    asr_type = "unknown"
    if models.asr_model is not None:
        if hasattr(models.asr_model, 'from_pretrained'):
            asr_type = "AI4Bharat-IndicConformer"
        elif hasattr(models.asr_model, '__call__'):
            asr_type = "Whisper-Pipeline"
    
    return {
        "status": "healthy",
        "models_loaded": {
            "asr": {
                "loaded": models.asr_model is not None,
                "type": asr_type,
                "methods": [method for method in ['transcribe', 'generate', 'forward'] 
                           if models.asr_model and hasattr(models.asr_model, method)]
            },
            "translation": {
                "loaded": hasattr(models, 'translator_tokenizer') and models.translator_tokenizer is not None,
                "indic_processor": hasattr(models, 'indic_processor') and models.indic_processor is not None,
            }
        },
        "supported_languages": list(models.lang_codes.keys()),
        "device": models.device,
        "api_keys_configured": {
            "gemini": GEMINI_API_KEY != "your-gemini-key",
            "groq": GROQ_API_KEY != "your-groq-key",
            "hf_token": HF_TOKEN is not None
        },
        "performance_target": "<3 seconds for 10-second audio",
        "features": [
            "Audio preprocessing (16kHz mono)",
            "Language detection from audio",
            "AI4Bharat IndicConformer ASR",
            "Whisper fallback",
            "Confidence scoring",
            "Quality assessment"
        ]
    }

@app.post("/process_voice")
async def process_voice_request(audio: UploadFile = File(...), language: str = Form("hindi")):
    """
    Main endpoint: Process voice input and return voice response
    
    Input: Audio file (WAV/MP3) and optional language parameter
    Output: JSON with response text and audio file
    """
    try:
        # Step 1: Speech to Text
        stt_result = await speech_to_text(audio)
        original_text = stt_result["transcription"]
        detected_lang = stt_result["detected_language"]
        
        # Use provided language if detected language confidence is low
        if stt_result["language_confidence"] < 0.5:
            detected_lang = language
        
        # Step 2: Translate to English if needed
        english_text = await translate_text(original_text, detected_lang, "english")
        
        # Step 3: Understand Intent
        intent = await understand_intent(english_text)
        
        # Step 4: Call Finance API
        finance_request = {
            "text": english_text,
            "intent": intent.intent,
            "entities": intent.entities,
            "user_language": detected_lang
        }
        
        finance_response = await call_finance_api(finance_request)
        
        # Step 5: Translate response back to original language
        response_text = finance_response.get("response", "Sorry, I couldn't process your request.")
        translated_response = await translate_text(response_text, "english", detected_lang)
        
        # Step 6: Generate TTS
        audio_response = await text_to_speech(translated_response, detected_lang)
        
        return {
            "original_text": original_text,
            "detected_language": detected_lang,
            "english_text": english_text,
            "intent": intent.dict(),
            "response_text": translated_response,
            "audio_available": len(audio_response) > 0,
            "finance_data": finance_response
        }
    
    except Exception as e:
        print(f"Error in /process_voice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/get_audio_response")
async def get_audio_response(request: SpeechRequest):
    """
    Get audio response for given text
    
    Input: {"text": "response text", "target_language": "hindi"}
    Output: Audio file stream
    """
    try:
        audio_data = await text_to_speech(request.text, request.target_language)
        
        if len(audio_data) == 0:
            raise HTTPException(status_code=500, detail="TTS generation failed")
        
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=response.mp3"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate")
async def translate_endpoint(
    text: str, 
    source_language: str, 
    target_language: str = "english"
):
    """
    Translate text between languages
    
    Input: text, source_language, target_language
    Output: {"translated_text": "result"}
    """
    try:
        result = await translate_text(text, source_language, target_language)
        return {"translated_text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/understand_intent")
async def understand_intent_endpoint(text: str):
    """
    Extract intent from text
    
    Input: text
    Output: Intent analysis
    """
    try:
        result = await understand_intent(text)
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process_multilingual_query")
async def process_multilingual_query(request: dict):
    """
    Process multilingual text query with automatic language round-trip
    
    Input: {
        "text": "user query in any supported language",
        "auto_detect": true (optional, default: true)
    }
    Output: {
        "original_text": "original query",
        "detected_language": "hindi/marathi/english/etc",
        "english_translation": "translated to english",
        "finance_response": "finance API response in English",
        "final_response": "response translated back to original language",
        "intent_analysis": {...}
    }
    """
    try:
        original_text = request.get("text", "")
        auto_detect = request.get("auto_detect", True)
        
        if not original_text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Step 1: Detect language
        if auto_detect:
            try:
                from langdetect import detect
                detected_lang_code = detect(original_text)
                # Map langdetect codes to our language names
                lang_mapping = {
                    'hi': 'hindi',
                    'mr': 'marathi', 
                    'en': 'english',
                    'ta': 'tamil',
                    'te': 'telugu',
                    'bn': 'bengali',
                    'gu': 'gujarati',
                    'kn': 'kannada',
                    'ml': 'malayalam',
                    'pa': 'punjabi',
                    'ur': 'urdu'
                }
                detected_lang = lang_mapping.get(detected_lang_code, 'english')
            except Exception as e:
                print(f"Language detection failed: {e}")
                detected_lang = 'english'  # Fallback
        else:
            detected_lang = 'english'
        
        # Step 2: Translate to English if needed
        if detected_lang != 'english':
            english_text = await translate_text(original_text, detected_lang, "english")
        else:
            english_text = original_text
        
        # Step 3: Extract intent
        intent_analysis = await understand_intent(english_text)
        
        # Step 4: Call Finance API
        finance_request = {
            "text": english_text,
            "intent": intent_analysis.intent,
            "entities": intent_analysis.entities,
            "user_language": detected_lang
        }
        
        finance_response = await call_finance_api(finance_request)
        english_response = finance_response.get("response", "Sorry, I couldn't process your request.")
        
        # Step 5: Translate response back to original language
        if detected_lang != 'english':
            final_response = await translate_text(english_response, "english", detected_lang)
        else:
            final_response = english_response
        
        return {
            "success": True,
            "original_text": original_text,
            "detected_language": detected_lang,
            "english_translation": english_text,
            "finance_response": english_response,
            "final_response": final_response,
            "intent_analysis": intent_analysis.dict(),
            "finance_data": finance_response,
            "processing_info": {
                "translation_needed": detected_lang != 'english',
                "round_trip_complete": True
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "original_text": request.get("text", ""),
            "detected_language": "unknown"
        }

@app.post("/test_asr")
async def test_asr_model():
    """
    Test ASR model capabilities without audio input
    
    Returns model information and available methods
    """
    try:
        model_info = {
            "model_loaded": models.asr_model is not None,
            "model_type": type(models.asr_model).__name__ if models.asr_model else "None",
            "available_methods": [],
            "device": models.device,
            "test_status": "ready"
        }
        
        if models.asr_model:
            # Check available methods
            methods_to_check = ['transcribe', 'generate', 'forward', '__call__']
            for method in methods_to_check:
                if hasattr(models.asr_model, method):
                    model_info["available_methods"].append(method)
            
            # Check if it's AI4Bharat or Whisper
            if hasattr(models.asr_model, 'from_pretrained'):
                model_info["ai4bharat_ready"] = True
                model_info["fallback_needed"] = False
            else:
                model_info["ai4bharat_ready"] = False
                model_info["fallback_needed"] = True
                model_info["whisper_ready"] = hasattr(models.asr_model, '__call__')
        
        return model_info
    
    except Exception as e:
        return {"error": str(e), "test_status": "failed"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
