import React, { useState, useEffect } from 'react';

// --- MAIN APP COMPONENT ---
function App() {
  const [user, setUser] = useState(null); // Stores logged-in user: {id, username, role}
  const [isRegistering, setIsRegistering] = useState(false); // Toggle Login/Register
  const [backendStatus, setBackendStatus] = useState("Checking...");

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'patient' // Default role
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
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => {
        if (!res.ok) throw new Error(isRegistering ? 'User already exists' : 'Invalid credentials');
        return res.json();
      })
      .then(data => {
        if (isRegistering) {
          setMessage("Registration successful! Please login.");
          setIsRegistering(false);
        } else {
          setUser(data); // data contains {username, role, id}
          setMessage('');
        }
      })
      .catch(err => setMessage(err.message));
  };

  const handleLogout = () => {
    setUser(null);
    setFormData({ username: '', password: '', role: 'patient' });
  };

  return (
    <div className="TAMS-App" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '50px auto', textAlign: 'center', border: '1px solid #ddd', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1>TAMS Telehealth</h1>
      <p style={{ color: 'gray', fontSize: '12px' }}>System Status: {backendStatus}</p>
      <hr />

      {!user ? (
        <div className="auth-container">
          <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input name="username" placeholder="Username" onChange={handleInputChange} value={formData.username} required style={inputStyle} />
            <input name="password" type="password" placeholder="Password" onChange={handleInputChange} value={formData.password} required style={inputStyle} />
            
            {isRegistering && (
              <select name="role" onChange={handleInputChange} value={formData.role} style={inputStyle}>
                <option value="patient">I am a Patient</option>
                <option value="doctor">I am a Doctor</option>
              </select>
            )}
            
            <button type="submit" style={btnStyle}>{isRegistering ? 'Sign Up' : 'Login'}</button>
          </form>
          
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#007bff', cursor: 'pointer', marginTop: '15px' }}>
            {isRegistering ? 'Already have an account? Login' : 'New user? Register here'}
          </p>
          {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
        </div>
      ) : (
        <div className="dashboard-container">
          <div style={{ textAlign: 'right' }}><button onClick={handleLogout}>Logout</button></div>
          {user.role === 'doctor' ? <DoctorDashboard user={user} /> : <PatientDashboard user={user} />}
        </div>
      )}
    </div>
  );
}

// --- DASHBOARD COMPONENTS ---

const PatientDashboard = ({ user }) => (
  <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
    <h2>Welcome, {user.username}</h2>
    <p><strong>Role:</strong> Patient</p>
    <div style={{ background: 'white', padding: '15px', textAlign: 'left' }}>
      <h4>Your TAMS Services:</h4>
      <ul>
        <li>View Medical History</li>
        <li>Book Appointment with Doctor</li>
        <li>Access Test Results</li>
      </ul>
    </div>
  </div>
);

const DoctorDashboard = ({ user }) => (
  <div style={{ backgroundColor: '#f1f8e9', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
    <h2>Welcome, Dr. {user.username}</h2>
    <p><strong>Role:</strong> Medical Professional</p>
    <div style={{ background: 'white', padding: '15px', textAlign: 'left' }}>
      <h4>Doctor Tools:</h4>
      <ul>
        <li>View Patient Schedule</li>
        <li>Update Patient Profiles</li>
        <li>Digital Prescriptions</li>
      </ul>
    </div>
  </div>
);

// Styles
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btnStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

export default App;