FROM python:3.9-slim

# Install distutils and gcc for building some Python packages
RUN apt-get update && apt-get install -y python3-distutils gcc && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 5000
CMD ["python", "ai_detector/app.py"]
