import os
from huggingface_hub import InferenceClient
from flask import Flask, request, jsonify

app = Flask(__name__)


# Use HF_TOKEN as the environment variable name
HF_TOKEN = os.environ.get("HF_TOKEN")  # Set this in Railway environment variables
client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN,
)


# Use fill-mask pipeline for demonstration (adjust as needed for your use case)
def query_huggingface(text):
    # The model must support fill-mask (e.g., distilbert-base-uncased)
    try:
        result = client.fill_mask(
            text,
            model="distilbert-base-uncased",
        )
        return result
    except Exception as e:
        raise Exception(f"Hugging Face Hub error: {str(e)}")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    try:
        result = query_huggingface(text)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)