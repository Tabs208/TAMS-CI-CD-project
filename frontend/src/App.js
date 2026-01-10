import React, { useState, useEffect } from 'react';

// --- MAIN APP COMPONENT ---
function App() {
  const [user, setUser] = useState(null); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [backendStatus, setBackendStatus] = useState("Checking...");

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'patient' 
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus("Offline"));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Processing..."); // Visual feedback
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          // MODIFICATION: Throw the actual error sent by Flask
          throw new Error(data.error || 'Server Error');
        }
        return data;
      })
      .then(data => {
        if (isRegistering) {
          setMessage("Registration successful! Please login.");
          setIsRegistering(false);
          setFormData({ ...formData, password: '' }); // Clear password
        } else {
          setUser(data); 
          setMessage('');
        }
      })
      .catch(err => {
        // MODIFICATION: Display the REAL error (e.g., "Internal Server Error")
        setMessage(err.message);
      });
  };

  const handleLogout = () => {
    setUser(null);
    setFormData({ username: '', password: '', role: 'patient' });
    setMessage('');
  };

  return (
    <div className="TAMS-App" style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', maxWidth: '500px', margin: '50px auto', textAlign: 'center', border: 'none', borderRadius: '15px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '5px' }}>TAMS Telehealth</h1>
      <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', backgroundColor: backendStatus.includes('Healthy') ? '#e8f5e9' : '#ffebee', color: backendStatus.includes('Healthy') ? '#2e7d32' : '#c62828', fontSize: '11px', fontWeight: 'bold', marginBottom: '20px' }}>
        ● System: {backendStatus}
      </div>
      <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '20px' }} />

      {!user ? (
        <div className="auth-container">
          <h2 style={{ color: '#34495e' }}>{isRegistering ? 'Create Account' : 'Secure Login'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input name="username" placeholder="Username" onChange={handleInputChange} value={formData.username} required style={inputStyle} />
            <input name="password" type="password" placeholder="Password" onChange={handleInputChange} value={formData.password} required style={inputStyle} />
            
            {isRegistering && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '5px' }}>Register as:</label>
                <select name="role" onChange={handleInputChange} value={formData.role} style={inputStyle}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Medical Doctor</option>
                </select>
              </div>
            )}
            
            <button type="submit" style={btnStyle}>{isRegistering ? 'Register Account' : 'Sign In'}</button>
          </form>
          
          <p onClick={() => { setIsRegistering(!isRegistering); setMessage(''); }} style={{ color: '#3498db', cursor: 'pointer', marginTop: '20px', fontSize: '14px' }}>
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register here'}
          </p>
          
          {message && (
            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '5px', backgroundColor: message.includes('successful') ? '#e8f5e9' : '#fdeded', color: message.includes('successful') ? '#2e7d32' : '#c62828', fontSize: '13px' }}>
              {message}
            </div>
          )}
        </div>
      ) : (
        <div className="dashboard-container">
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', padding: '5px 10px' }}>Logout</button>
          </div>
          {user.role === 'doctor' ? <DoctorDashboard user={user} /> : <PatientDashboard user={user} />}
        </div>
      )}
    </div>
  );
}

// --- DASHBOARD COMPONENTS ---

const PatientDashboard = ({ user }) => (
  <div style={{ backgroundColor: '#f0f7ff', padding: '25px', borderRadius: '12px', textAlign: 'left', borderLeft: '5px solid #2196f3' }}>
    <h2 style={{ margin: '0 0 10px 0', color: '#0d47a1' }}>Welcome, {user.username}</h2>
    <span style={{ fontSize: '12px', backgroundColor: '#bbdefb', padding: '2px 8px', borderRadius: '10px', color: '#0d47a1', fontWeight: 'bold' }}>PATIENT PORTAL</span>
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ color: '#1565c0', marginBottom: '10px' }}>Health Services</h4>
      <ul style={{ paddingLeft: '20px', color: '#455a64', lineHeight: '1.8' }}>
        <li>Schedule Virtual Consultation</li>
        <li>My Electronic Health Records (EHR)</li>
        <li>Prescription Refills</li>
      </ul>
    </div>
  </div>
);

const DoctorDashboard = ({ user }) => (
  <div style={{ backgroundColor: '#f1fdf4', padding: '25px', borderRadius: '12px', textAlign: 'left', borderLeft: '5px solid #4caf50' }}>
    <h2 style={{ margin: '0 0 10px 0', color: '#1b5e20' }}>Welcome, Dr. {user.username}</h2>
    <span style={{ fontSize: '12px', backgroundColor: '#c8e6c9', padding: '2px 8px', borderRadius: '10px', color: '#1b5e20', fontWeight: 'bold' }}>PHYSICIAN PORTAL</span>
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ color: '#2e7d32', marginBottom: '10px' }}>Clinical Tools</h4>
      <ul style={{ paddingLeft: '20px', color: '#37474f', lineHeight: '1.8' }}>
        <li>Patient Triage Queue</li>
        <li>Manage Appointments</li>
        <li>Clinical Documentation</li>
      </ul>
    </div>
  </div>
);

// Styles
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
const btnStyle = { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', transition: 'background 0.3s' };

export default App;