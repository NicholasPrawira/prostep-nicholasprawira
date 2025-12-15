# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for better Docker layer caching)
COPY requirements.txt .

# Install system dependencies required for Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Install PyTorch CPU from official PyTorch index
# This ensures we get the correct wheel for the CPU variant
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will override PORT env var)
EXPOSE 8080

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
