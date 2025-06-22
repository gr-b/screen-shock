# Multi-stage Dockerfile for Railway deployment
# This should be run from the project root: docker build -f backend/Dockerfile .

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend build
WORKDIR /app

# Copy entire frontend directory
COPY frontend/ ./frontend/

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN ls -la && npm install && NODE_ENV=production npm run build

# Stage 2: Python backend with static file serving
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Copy built frontend files from previous stage
# Copy index.html to static directory
COPY --from=frontend-builder /app/frontend/build/index.html ./static/
# Copy static assets (CSS, JS) to static directory
COPY --from=frontend-builder /app/frontend/build/static ./static/static

# Create a non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port (Railway will set PORT env var)
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start command - Railway will set PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}