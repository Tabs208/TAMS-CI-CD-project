import React, { useState, useEffect } from 'react';

function App() {
  // 1. Create a state variable to hold the data from the backend
  const [backendStatus, setBackendStatus] = useState("Connecting to API...");

  // 2. Use useEffect to run the fetch command as soon as the page loads
  useEffect(() => {
    // We use a relative path '/api/health' because the AWS Load Balancer 
    // routes everything starting with /api to the Flask backend.
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Set the state to the message we get from Flask
        setBackendStatus(data.status); 
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setBackendStatus("Backend Offline");
      });
  }, []);

  return (
    <div className="TAMS-App">
      <h1>TAMS Telehealth Appointment System</h1>
      <p>Frontend placeholder running successfully.</p>
      
      {/* 3. This is the functional part: showing real data from the backend */}
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>System Integration Status:</h3>
        <p>Backend Connection: <strong>{backendStatus}</strong></p>
      </div>
    </div>
  );
}

export default App;