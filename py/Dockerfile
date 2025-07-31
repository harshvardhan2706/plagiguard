FROM python:3.9-slim

# Set work directory
WORKDIR /app

# Install only required build tools, then remove them after pip install
COPY requirements.txt ./
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy only necessary source files (avoid .git, datasets, etc.)
COPY . .

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "ai_detector.app:app"]
