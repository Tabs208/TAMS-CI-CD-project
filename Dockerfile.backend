# Dockerfile.backend

# Use a specific Python version as the base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the requirements file and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY backend/ .

# Expose the port (Flask default)
EXPOSE 5000

# Command to run the application (using gunicorn for production readiness)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]