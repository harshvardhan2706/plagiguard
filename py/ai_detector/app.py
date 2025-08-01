import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

HF_API_TOKEN = os.environ.get("HF_API_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

def query_huggingface(sentences):
    response = requests.post(API_URL, headers=headers, json={"inputs": sentences})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Hugging Face API error: {response.text}")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text1 = data.get('text1', '')
    text2 = data.get('text2', '')
    if not text1 or not text2:
        return jsonify({'error': 'Both text1 and text2 are required'}), 400
    try:
        embeddings = query_huggingface([text1, text2])
        # Cosine similarity calculation
        from numpy import dot
        from numpy.linalg import norm
        similarity = dot(embeddings[0], embeddings[1]) / (norm(embeddings[0]) * norm(embeddings[1]))
        return jsonify({'similarity_score': float(similarity)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
