import os
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util



app = Flask(__name__)


# Load lightweight SentenceTransformer model for plagiarism detection
similarity_model = SentenceTransformer("sentence-transformers/paraphrase-MiniLM-L6-v2")

# Set up OpenAI client for Hugging Face router
HF_TOKEN = os.environ.get("HF_TOKEN")
openai_client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)




# Semantic similarity using SentenceTransformer
def compute_similarity(sentences1, sentences2):
    try:
        embeddings1 = similarity_model.encode(sentences1, convert_to_tensor=True)
        embeddings2 = similarity_model.encode(sentences2, convert_to_tensor=True)
        cosine_scores = util.cos_sim(embeddings1, embeddings2)
        # Return as nested lists for JSON serialization
        return cosine_scores.cpu().tolist()
    except Exception as e:
        raise Exception(f"Similarity error: {str(e)}")



# New endpoint for semantic similarity
@app.route('/similarity', methods=['POST'])
def similarity():
    data = request.get_json()
    sentences1 = data.get('sentences1', [])
    sentences2 = data.get('sentences2', [])
    if not sentences1 or not sentences2:
        return jsonify({'error': 'sentences1 and sentences2 are required'}), 400
    try:
        scores = compute_similarity(sentences1, sentences2)
        return jsonify({'scores': scores})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


# New endpoint for chat completion using Kimi-K2-Instruct
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({'error': 'message is required'}), 400
    try:
        completion = openai_client.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct:novita",
            messages=[
                {"role": "user", "content": user_message}
            ],
        )
        reply = completion.choices[0].message.content if completion.choices and completion.choices[0].message else ""
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500