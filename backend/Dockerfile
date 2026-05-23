FROM python:3.12-slim

WORKDIR /app

# Install dependencies first for Docker layer caching optimization
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start server binding to all interfaces for container accessibility
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port $PORT"

