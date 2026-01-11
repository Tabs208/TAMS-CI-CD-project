import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [formData, setFormData] = useState({ username: '', password: '', role: 'patient' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus("Offline"));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server Error');
        return data;
      })
      .then(data => {
        if (isRegistering) {
          setMessage("Registered! Please login.");
          setIsRegistering(false);
        } else {
          setUser(data);
          setMessage('');
        }
      })
      .catch(err => setMessage(err.message));
  };

  return (
    <div style={{ fontFamily: 'Segoe UI', maxWidth: '600px', margin: '50px auto', textAlign: 'center', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '15px', backgroundColor: '#fff' }}>
      <h1>TAMS Telehealth</h1>
      <div style={{ backgroundColor: backendStatus.includes('Healthy') ? '#e8f5e9' : '#ffebee', padding: '5px', borderRadius: '20px', fontSize: '11px', marginBottom: '20px' }}>
        ● System: {backendStatus}
      </div>
      {!user ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2>{isRegistering ? 'Create Account' : 'Secure Login'}</h2>
          <input name="username" placeholder="Username" style={inputStyle} onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input name="password" type="password" placeholder="Password" style={inputStyle} onChange={e => setFormData({...formData, password: e.target.value})} required />
          {isRegistering && (
            <select name="role" style={inputStyle} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="patient">Patient</option>
              <option value="doctor">Medical Doctor</option>
            </select>
          )}
          <button type="submit" style={btnStyle}>{isRegistering ? 'Register' : 'Sign In'}</button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', color: '#3498db' }}>
            {isRegistering ? 'Login here' : 'Need an account? Register here'}
          </p>
          {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
        </form>
      ) : (
        <div>
          <button onClick={() => setUser(null)} style={{ float: 'right' }}>Logout</button>
          {user.role === 'doctor' ? <DoctorDashboard user={user} /> : <PatientDashboard user={user} />}
        </div>
      )}
    </div>
  );
}

const PatientDashboard = ({ user }) => {
  const [vitals, setVitals] = useState({ heartRate: '', temp: '' });
  const logVitals = () => {
    fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vitals, user_id: user.id }),
    }).then(() => alert("Vitals Saved Successfully"));
  };
  return (
    <div style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '10px', marginTop: '20px', textAlign: 'left' }}>
      <h3 style={{ color: '#0d47a1' }}>Patient Portal: {user.username}</h3>
      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
        <h4>Log Daily Vitals</h4>
        <input placeholder="Heart Rate (BPM)" style={miniInputStyle} onChange={e => setVitals({...vitals, heartRate: e.target.value})} />
        <input placeholder="Temp (°C)" style={miniInputStyle} onChange={e => setVitals({...vitals, temp: e.target.value})} />
        <button onClick={logVitals} style={{...btnStyle, padding: '8px'}}>Save Vitals</button>
      </div>
    </div>
  );
};

const DoctorDashboard = ({ user }) => {
  const [presc, setPresc] = useState({ patientName: '', meds: '' });
  const issueMeds = () => {
    fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...presc, user_id: user.id }),
    }).then(() => alert("Prescription Issued Successfully"));
  };
  return (
    <div style={{ backgroundColor: '#f1fdf4', padding: '20px', borderRadius: '10px', marginTop: '20px', textAlign: 'left' }}>
      <h3 style={{ color: '#1b5e20' }}>Doctor Portal: Dr. {user.username}</h3>
      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
        <h4>Issue Digital Prescription</h4>
        <input placeholder="Patient Name" style={miniInputStyle} onChange={e => setPresc({...presc, patientName: e.target.value})} />
        <textarea placeholder="Medication Details" style={miniInputStyle} onChange={e => setPresc({...presc, meds: e.target.value})} />
        <button onClick={issueMeds} style={{...btnStyle, backgroundColor: '#4caf50', padding: '8px'}}>Issue Prescription</button>
      </div>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', width: '100%', boxSizing: 'border-box' };
const miniInputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #eee', width: '100%', marginBottom: '10px', boxSizing: 'border-box' };
const btnStyle = { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: 'white', fontWeight: 'bold', cursor: 'pointer', width: '100%' };

export default App;