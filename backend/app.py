# backend/app.py

"""
TAMS Backend Placeholder Application Module.

This module contains a basic Flask application to satisfy CI requirements.
"""
from flask import Flask

# Initialize the Flask application
app = Flask(__name__)

# Define a simple route for a health check
@app.route('/')
def hello_world():
    """
    Returns a simple health check message for the root URL.
    """
    return 'TAMS Backend Health Check: OK'

if __name__ == '__main__':
    
    app.run(debug=True)
    # Ensure there is a blank line immediately above this comment!