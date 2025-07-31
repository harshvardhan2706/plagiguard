from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
import time
from functools import wraps

# Configuration
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds
REQUEST_TIMEOUT = 30  # seconds

app = Flask(__name__)

def retry_on_failure(max_retries=MAX_RETRIES, delay=RETRY_DELAY):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = str(e)
                    if attempt < max_retries - 1:  # Don't sleep on last attempt
                        time.sleep(delay)
            raise Exception(f"Failed after {max_retries} attempts. Last error: {last_error}")
        return wrapper
    return decorator

def load_model_with_retry():
    for attempt in range(MAX_RETRIES):
        try:
            print(f"Attempting to load model (attempt {attempt + 1}/{MAX_RETRIES})...")
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
            print("Model loaded successfully!")
            return tokenizer, model
        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                raise Exception(f"Failed to load model after {MAX_RETRIES} attempts: {str(e)}")
            print(f"Failed to load model (attempt {attempt + 1}): {str(e)}")
            time.sleep(RETRY_DELAY)

# Load the model and tokenizer
MODEL_NAME = "distilbert-base-uncased"  # Lighter DistilBERT model for smaller image size
try:
    tokenizer, model = load_model_with_retry()
except Exception as e:
    print(f"Fatal error loading model: {str(e)}")
    exit(1)

@retry_on_failure()
def analyze_text(text):
    try:
        # Tokenize and prepare input
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        
        # Get model prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]
            ai_score = float(probabilities[1])  # Example: 2nd class is "AI-generated"
            return ai_score
    except Exception as e:
        raise Exception(f"Error analyzing text: {str(e)}")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    try:
        ai_score = analyze_text(text)
        return jsonify({'ai_score': ai_score, 'ai_generated': ai_score > 0.5})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
