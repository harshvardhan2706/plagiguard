import os
from flask import Flask, request, jsonify
from sentence_transformers import CrossEncoder


app = Flask(__name__)

# Load CrossEncoder model at startup
cross_encoder_model = CrossEncoder("cross-encoder/stsb-roberta-base")



# Passage ranking using CrossEncoder
def rank_passages(query, passages):
    try:
        scores = cross_encoder_model.predict([(query, passage) for passage in passages])
        return scores.tolist() if hasattr(scores, 'tolist') else list(scores)
    except Exception as e:
        raise Exception(f"CrossEncoder error: {str(e)}")


# New endpoint for passage ranking
@app.route('/rank', methods=['POST'])
def rank():
    data = request.get_json()
    query = data.get('query', '')
    passages = data.get('passages', [])
    if not query or not passages:
        return jsonify({'error': 'query and passages are required'}), 400
    try:
        scores = rank_passages(query, passages)
        return jsonify({'scores': scores})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)