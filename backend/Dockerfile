# ===== STAGE 1: Builder =====
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies (if required by your Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends gcc

COPY requirements.txt ./
RUN pip install --user --no-cache-dir -r requirements.txt

# ===== STAGE 2: Production =====
FROM python:3.11-slim

WORKDIR /app

ENV PATH=/root/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY --from=builder /root/.local /root/.local

COPY app ./app
COPY .env .env

EXPOSE 8000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=8s --start-period=30s \ 
  CMD curl --fail http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
