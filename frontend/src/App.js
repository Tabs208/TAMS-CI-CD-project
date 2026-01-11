import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [formData, setFormData] = useState({ username: '', password: '', role: 'patient' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("Backend Offline");
        }
        return res.json();
      })
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus("Offline"));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Processing...");
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Received non-JSON response:", text);
          throw new Error(`Server Error: ${res.status}. Expected JSON but got HTML.`);
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
      })
      .then(data => {
        if (isRegistering) {
          setMessage("Registration successful! Please login.");
          setIsRegistering(false);
        } else {
          setUser(data);
          setMessage('');
        }
      })
      .catch(err => setMessage(err.message));
  };

  const handleLogout = () => { setUser(null); setFormData({ username: '', password: '', role: 'patient' }); setMessage(''); };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', maxWidth: '500px', margin: '50px auto', textAlign: 'center', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '15px' }}>
      <h1>TAMS Telehealth</h1>
      <div style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: backendStatus.includes('Healthy') ? '#e8f5e9' : '#ffebee', color: backendStatus.includes('Healthy') ? '#2e7d32' : '#c62828', fontSize: '11px', fontWeight: 'bold' }}>
        ● System: {backendStatus}
      </div>
      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />

      {!user ? (
        <div>
          <h2>{isRegistering ? 'Create Account' : 'Secure Login'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input name="username" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} value={formData.username} required style={inputStyle} />
            <input name="password" type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} value={formData.password} required style={inputStyle} />
            {isRegistering && (
              <select name="role" onChange={(e) => setFormData({...formData, role: e.target.value})} value={formData.role} style={inputStyle}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            )}
            <button type="submit" style={btnStyle}>{isRegistering ? 'Register' : 'Sign In'}</button>
          </form>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#3498db', cursor: 'pointer', marginTop: '20px' }}>
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register here'}
          </p>
          {message && <div style={{ color: message.includes('success') ? 'green' : 'red', fontSize: '13px' }}>{message}</div>}
        </div>
      ) : (
        <div>
          <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
          {user.role === 'doctor' ? <DoctorDashboard user={user} /> : <PatientDashboard user={user} />}
        </div>
      )}
    </div>
  );
}

const PatientDashboard = ({ user }) => ( <div style={{ textAlign: 'left', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '10px' }}><h2>Welcome, {user.username}</h2><p>Patient Portal Active</p></div> );
const DoctorDashboard = ({ user }) => ( <div style={{ textAlign: 'left', padding: '20px', backgroundColor: '#f1fdf4', borderRadius: '10px' }}><h2>Welcome, Dr. {user.username}</h2><p>Physician Portal Active</p></div> );
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', width: '100%', boxSizing: 'border-box' };
const btnStyle = { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

export default App;