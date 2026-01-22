# Use a specific Python version as the base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# 1. Copy the requirements file from the local directory
# We removed "backend/" because the context is already ./backend
COPY requirements.txt .

# 2. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy the rest of the application code
COPY . .

# 4. Expose the port (must match app.py)
EXPOSE 5000

# 5. Command to run the application using Gunicorn
# This is the industry standard for production Flask apps
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]