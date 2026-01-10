"""
TAMS Backend - Phase 2: Functional Authentication and RBAC.
This module implements User, Patient, and Doctor models with authentication.
"""
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Database Configuration (SQLite for development/staging)
# In production, this would point to an Amazon RDS instance
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tams.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

db = SQLAlchemy(app)

# --- DATABASE MODELS ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'patient' or 'doctor'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class PatientProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    medical_history = db.Column(db.Text)

class DoctorProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    specialty = db.Column(db.String(100))
    license_number = db.Column(db.String(50))

# Initialize Database
with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/api/health')
def health():
    return jsonify({"status": "Healthy - Database Active", "region": "Kenya-East"})

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
    data = request.get_json()
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"error": "User already exists"}), 400
    
    new_user = User(username=data.get('username'), role=data.get('role'))
    new_user.set_password(data.get('password'))
    db.session.add(new_user)
    db.session.commit()
    
    # Create corresponding profile
    if new_user.role == 'patient':
        profile = PatientProfile(user_id=new_user.id)
    else:
        profile = DoctorProfile(user_id=new_user.id)
    
    db.session.add(profile)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)