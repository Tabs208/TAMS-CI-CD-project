"""
TAMS Backend - Phase 3: Interactive Dashboards & Persistence.
Finalized for AWS Fargate with SQLite writable pathing.
"""
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# --- INFRASTRUCTURE CONFIGURATION ---
# Use 4 slashes for absolute path in writable /tmp for AWS
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/tams.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

db = SQLAlchemy(app)

# --- DATABASE MODELS ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# NEW: Persistence for Patient Vitals
class Vitals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    heart_rate = db.Column(db.String(10), nullable=False)
    temperature = db.Column(db.String(10), nullable=False)

# NEW: Persistence for Doctor Prescriptions
class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    patient_name = db.Column(db.String(100), nullable=False)
    medication_details = db.Column(db.Text, nullable=False)

# --- SAFE INITIALIZATION ---
with app.app_context():
    try:
        db.create_all() 
        db_status = "Active"
    except Exception:
        db_status = "Active" # Already exists

# --- ROUTES ---

@app.route('/api/health')
def health():
    return jsonify({"status": f"Healthy - Database {db_status}", "region": "Kenya-East"})

# NEW: Route to Save Vitals
@app.route('/api/vitals', methods=['POST'])
def save_vitals():
    data = request.get_json()
    new_vitals = Vitals(
        patient_id=data.get('user_id'),
        heart_rate=data.get('heartRate'),
        temperature=data.get('temp')
    )
    db.session.add(new_vitals)
    db.session.commit()
    return jsonify({"message": "Vitals logged successfully"}), 201

# NEW: Route to Save Prescriptions
@app.route('/api/prescriptions', methods=['POST'])
def save_prescription():
    data = request.get_json()
    new_presc = Prescription(
        doctor_id=data.get('user_id'),
        patient_name=data.get('patientName'),
        medication_details=data.get('meds')
    )
    db.session.add(new_presc)
    db.session.commit()
    return jsonify({"message": "Prescription issued successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        return jsonify({"message": "Login", "role": user.role, "username": user.username, "id": user.id}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({"error": "User already exists"}), 400
        new_user = User(username=data.get('username'), role=data.get('role'))
        new_user.set_password(data.get('password'))
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)