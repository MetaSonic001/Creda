# FastAPI 1 - Multilingual Service
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for audio processing (cached layer)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    wget \
    curl \
    build-essential \
    python3-dev \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir --upgrade pip

# Install PyTorch first (separate layer for better caching)
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy and install requirements (only rebuilds if requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create directories for models and data (cached)
RUN mkdir -p /app/models /app/chroma_db /app/logs

# Copy environment files (rarely change)
COPY .env* ./

# Copy application code LAST (most frequently changed)
COPY fastapi1_multilingual.py .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application with reload for development
CMD ["uvicorn", "fastapi1_multilingual:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]