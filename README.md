# TAMS Telehealth:Bridging the Rural Healthcare Divide
## Project Motivation
In rural Kenya, accessing specialized medical care is often a "nightmare" due to extreme travel distances and a lack of local specialists. The Telehealth Appointment Management System (TAMS) was developed to eliminate these barriers by providing a digital bridge between rural patients and urban-centered medical expertise. Inspired by the digital transformation accelerated by COVID-19, this system is designed for multi-generational usability, supporting remote consultations through vital signs logging and symptom sharing in both English and Swahili.
#  The CI/CD Pipeline Architecture
This project implements a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline to ensure the platform remains resilient, secure, and highly available for critical medical use.

## Pipeline Stages
Continuous Integration (CI): Upon every code push to the development branch, GitHub Actions automatically triggers a build process. This involves setting up isolated runners to compile the React frontend and build the Flask backend Docker images.

Quality Gates: The pipeline verifies all software dependencies and syntax to prevent broken code from reaching the production environment.

Continuous Deployment (CD): Verified images are pushed to Amazon ECR and deployed to AWS Fargate using a "rolling update" strategy. This ensures the system remains "Healthy" and accessible even during the deployment of new features.

Persistence Layer: Clinical data is persisted in a serverless environment using a localized SQLite volume at /tmp/tams.db, ensuring that patient vitals and prescriptions are never lost during container restarts.
#  How to Navigate the Repository
## Project Structure
frontend/: The React.js user interface featuring role-based dashboards tailored for Patients (vitals/symptoms) and Doctors (prescriptions).

backend/: The Flask REST API and SQLAlchemy models managing the database logic and specialist directories.

.github/workflows/: The YAML configuration files that orchestrate the entire automated CI/CD lifecycle.

# Toolset
Orchestration: GitHub Actions.

Containerization: Docker.

Cloud Hosting: AWS Fargate (Serverless ECS).

Monitoring: Amazon CloudWatch for real-time application and deployment logs.

# Testing and Validation
System Health: Check the status bar on the home page. It must show "● System: Healthy - Database Active" to confirm the backend and database are synchronized.

Specialist Search: Test the rural accessibility feature by searching for a "Specialty" in a specific Kenyan "Location" (e.g., Kisumu).

Symptom Sharing: Use the clinical symptom logger to share signs with a physician asynchronously, simulating a remote consultation.

Role Enforcement: Log in with different credentials to verify that the system correctly routes Patients and Doctors to their specific clinical dashboards.
