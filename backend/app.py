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
    # Line 22: Ensure NO trailing whitespace here.
    app.run(debug=True)
# Line 24: This must be the final, clean, blank line in the file.
