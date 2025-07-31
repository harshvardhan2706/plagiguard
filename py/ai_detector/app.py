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



# Use sentence-similarity pipeline
def query_huggingface(source_sentence, sentences):
    try:
        result = client.sentence_similarity(
            source_sentence,
            sentences,
            model="sentence-transformers/all-MiniLM-L6-v2",
        )
        return result
    except Exception as e:
        raise Exception(f"Hugging Face Hub error: {str(e)}")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    source_sentence = data.get('source_sentence', '')
    sentences = data.get('sentences', [])
    if not source_sentence or not sentences:
        return jsonify({'error': 'source_sentence and sentences are required'}), 400
    try:
        result = query_huggingface(source_sentence, sentences)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)