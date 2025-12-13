# backend/app.py
from flask import Flask

# Initialize the Flask application
app = Flask(__name__)

# Define a simple route for a health check
@app.route('/')
def hello_world():
    return 'TAMS Backend Health Check: OK'

if __name__ == '__main__':
    app.run(debug=True)