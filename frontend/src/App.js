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
      <div style={{ backgroundColor: backendStatus.includes('Healthy') ? '#e8f5e9' : '#ffebee', padding: '5px', borderRadius: '20px', fontSize: '11px' }}>
        ● System: {backendStatus}
      </div>
      {!user ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <input name="username" placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input name="password" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          {isRegistering && (
            <select name="role" onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          )}
          <button type="submit">{isRegistering ? 'Register' : 'Sign In'}</button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', color: 'blue' }}>
            {isRegistering ? 'Login here' : 'Register here'}
          </p>
          {message && <p>{message}</p>}
        </form>
      ) : (
        <div>
          <button onClick={() => setUser(null)}>Logout</button>
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
    }).then(() => alert("Vitals Saved"));
  };
  return (
    <div style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
      <h3>Patient: {user.username}</h3>
      <input placeholder="Heart Rate" onChange={e => setVitals({...vitals, heart_rate: e.target.value})} />
      <input placeholder="Temp" onChange={e => setVitals({...vitals, temperature: e.target.value})} />
      <button onClick={logVitals}>Save Vitals</button>
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
    }).then(() => alert("Prescription Issued"));
  };
  return (
    <div style={{ backgroundColor: '#f1fdf4', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
      <h3>Doctor: {user.username}</h3>
      <input placeholder="Patient Name" onChange={e => setPresc({...presc, patientName: e.target.value})} />
      <textarea placeholder="Medications" onChange={e => setPresc({...presc, meds: e.target.value})} />
      <button onClick={issueMeds}>Issue Prescription</button>
    </div>
  );
};

export default App;