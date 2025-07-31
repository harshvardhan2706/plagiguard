FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN apt-get update && apt-get install -y python3-distutils gcc \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove gcc python3-distutils \
    && rm -rf /var/lib/apt/lists/*

COPY . .
EXPOSE 5000
CMD ["python", "ai_detector/app.py"]
