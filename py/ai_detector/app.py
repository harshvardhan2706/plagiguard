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
MODEL_NAME = "roberta-base-openai-detector"
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
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)
            ai_score = probabilities[0][1].item()  # Probability of AI-generated text
        
        return {
            "ai_generated": ai_score > 0.7,  # Threshold can be adjusted
            "ai_score": ai_score,
            "status": "success"
        }
    except Exception as e:
        raise Exception(f"Error analyzing text: {str(e)}")

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Missing 'text' field in request body",
                "status": "error"
            }), 400
            
        text = data['text']
        if not isinstance(text, str) or not text.strip():
            return jsonify({
                "error": "Text must be a non-empty string",
                "status": "error"
            }), 400

        result = analyze_text(text)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)