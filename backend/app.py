"""
TAMS Backend Functional Application Module.
This module integrates with the React frontend via path-based routing.
"""
from flask import Flask, jsonify
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)

# Enable CORS so the React frontend can safely communicate with this API
CORS(app)

@app.route('/')
def hello_world():
    """
    Root health check for the backend service.
    """
    return 'TAMS Backend Health Check: OK'

@app.route('/api/health')
def health_check():
    """
    Returns a JSON status message to the React frontend.
    The '/api' prefix matches the ALB path-based routing configuration.
    """
    return jsonify({
        "status": "Healthy - Connected to Flask API",
        "region": "Kenya-East",
        "service": "TAMS-Telehealth-Core"
    })

if __name__ == '__main__':
    # Listen on 0.0.0.0 so the Docker container can be reached within AWS
    app.run(host='0.0.0.0', port=5000, debug=True)
