"""
TAMS Backend - Production Grade (Phase 3)
Features: Role-Based Access, Writable Fargate Pathing, Enhanced Logging, 
and Persistence for Vitals & Prescriptions.
"""
import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# 1. SETUP LOGGING
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 2. INFRASTRUCTURE CONFIGURATION
# Auto-detects writable /tmp directory for AWS Fargate compatibility 
if os.path.exists('/tmp'):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/tams.db'
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tams.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-99')

db = SQLAlchemy(app)

# 3. DATABASE MODELS
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'patient' or 'doctor'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# --- NEW CLINICAL DATA MODELS ---
class Vitals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    heart_rate = db.Column(db.String(10), nullable=False)
    temperature = db.Column(db.String(10), nullable=False)

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    patient_name = db.Column(db.String(100), nullable=False)
    medication_details = db.Column(db.Text, nullable=False)

class PatientProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100), default="New Patient")

class DoctorProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    specialty = db.Column(db.String(100), default="General Practice")

# 4. SAFE INITIALIZATION
with app.app_context():
    try:
        db.create_all()
        logger.info("Database initialized successfully at %s", app.config['SQLALCHEMY_DATABASE_URI'])
        db_status = "Active"
    except Exception as e:
        logger.error("Database initialization failed: %s", str(e))
        db_status = f"Error: {str(e)}"

# 5. API ROUTES
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": f"Healthy - Database {db_status}",
        "environment": "Production" if os.path.exists('/tmp') else "Development",
        "region": "Kenya-East"
    })

# --- NEW CLINICAL ROUTES ---
@app.route('/api/vitals', methods=['POST'])
def save_vitals():
    try:
        data = request.get_json()
        new_vitals = Vitals(
            patient_id=data.get('user_id'),
            heart_rate=data.get('heartRate'),
            temperature=data.get('temp')
        )
        db.session.add(new_vitals)
        db.session.commit()
        logger.info("Vitals logged for patient ID: %s", data.get('user_id'))
        return jsonify({"message": "Vitals logged successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/prescriptions', methods=['POST'])
def save_prescription():
    try:
        data = request.get_json()
        new_presc = Prescription(
            doctor_id=data.get('user_id'),
            patient_name=data.get('patientName'),
            medication_details=data.get('meds')
        )
        db.session.add(new_presc)
        db.session.commit()
        logger.info("Prescription issued by doctor ID: %s", data.get('user_id'))
        return jsonify({"message": "Prescription issued successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        return jsonify({
            "message": "Login successful",
            "role": user.role,
            "username": user.username,
            "id": user.id
        }), 200
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
        
        if new_user.role == 'patient':
            profile = PatientProfile(user_id=new_user.id)
        else:
            profile = DoctorProfile(user_id=new_user.id)
        
        db.session.add(profile)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# 6. PRODUCTION ENTRY POINT
if __name__ == '__main__':
    # host='0.0.0.0' is mandatory for Docker/AWS connectivity 
    app.run(host='0.0.0.0', port=5000, debug=False)