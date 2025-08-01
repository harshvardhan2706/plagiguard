import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

HF_API_TOKEN = os.environ.get("HF_API_TOKEN")  # Set this in Railway environment variables
API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased"

headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

def query_huggingface(text):
    response = requests.post(API_URL, headers=headers, json={"inputs": text})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Hugging Face API error: {response.text}")

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