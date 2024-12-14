from flask import Flask, request, jsonify ,render_template
from Test2 import generate_answer # Import your grammar checker model
from flask_cors import CORS
from waitress import serve
from Model2 import Grammer_checker
app = Flask(__name__) 
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS']='Content-Type'
#test
@app.route('/')
def index():
    return render_template('index.html')
#end test
@app.route('/check', methods=['POST','OPTIONS'])
def check_grammar():

     # Handle OPTIONS preflight request
    if request.method == 'OPTIONS':
        # Properly respond to the preflight request
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    if request.method == 'POST':
        data = request.json
        text = data.get('text', '')
        if not text.strip():  # If text is empty or whitespace
            return jsonify({})  # Return an empty JSON response
        corrections = generate_answer(text)  # Call your model to check grammar
        print(corrections)
        return jsonify(corrections)

@app.route('/grammer_only', methods=['POST','OPTIONS'])  
def check_grammar_only():

     # Handle OPTIONS preflight request
    if request.method == 'OPTIONS':
        # Properly respond to the preflight request
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response 
    if request.method == 'POST':
        data = request.json
        text = data.get('text', '')

        corrections = Grammer_checker(text)  # Call your model to check grammar
                # Check if "النص المصحح:" is in the response and extract the text after it if present
        if "النص المصحح:" in corrections:
            corrected_text = corrections.split("النص المصحح:", 1)[-1].strip()
        else:
            corrected_text = corrections  # If not present, return the entire response
        print(corrected_text)
        return jsonify(corrected_text)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    serve(app, host="0.0.0.0", port=8080)
