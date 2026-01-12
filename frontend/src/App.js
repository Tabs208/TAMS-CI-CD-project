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
          // Setting user here with the database-confirmed role
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
            {isRegistering ? 'Already have an account? Login here' : 'Need an account? Register here'}
          </p>
          {message && <p style={{ color: 'red' }}>{message}</p>}
        </form>
      ) : (
        <div>
          <button onClick={() => setUser(null)} style={{ float: 'right', padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc' }}>Logout</button>
          {user.role === 'doctor' ? <DoctorDashboard user={user} /> : <PatientDashboard user={user} />}
        </div>
      )}
    </div>
  );
}

const PatientDashboard = ({ user }) => {
  const [vitals, setVitals] = useState({ heartRate: '', temp: '' });
  const [symptomText, setSymptomText] = useState("");
  const [searchParams, setSearchParams] = useState({ specialty: '', location: '' });
  const [searchResults, setSearchResults] = useState([]);

  const logVitals = () => {
    fetch('/api/vitals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...vitals, user_id: user.id }) }).then(() => alert("Vitals Saved"));
  };

  const shareSymptoms = () => {
    fetch('/api/symptoms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, description: symptomText }) }).then(() => alert("Symptoms Shared"));
  };

  const findSpecialist = () => {
    fetch(`/api/search/specialists?specialty=${searchParams.specialty}&location=${searchParams.location}`).then(res => res.json()).then(data => setSearchResults(data));
  };

  return (
    <div style={{ textAlign: 'left', marginTop: '20px' }}>
      <h2 style={{ color: '#0d47a1' }}>Patient Portal: {user.username}</h2>
      <div style={cardStyle}>
        <h4>Log Daily Vitals</h4>
        <input placeholder="Heart Rate (BPM)" style={miniInputStyle} onChange={e => setVitals({...vitals, heartRate: e.target.value})} />
        <input placeholder="Temp (°C)" style={miniInputStyle} onChange={e => setVitals({...vitals, temp: e.target.value})} />
        <button onClick={logVitals} style={miniBtnStyle}>Save Vitals</button>
      </div>
      <div style={cardStyle}>
        <h4>Describe Symptoms</h4>
        <textarea style={{ width: '100%', height: '50px' }} onChange={(e) => setSymptomText(e.target.value)} />
        <button onClick={shareSymptoms} style={miniBtnStyle}>Send to Doctor</button>
      </div>
      <div style={cardStyle}>
        <h4>Find a Specialist</h4>
        <input placeholder="Specialty" style={miniInputStyle} onChange={e => setSearchParams({...searchParams, specialty: e.target.value})} />
        <input placeholder="Location" style={miniInputStyle} onChange={e => setSearchParams({...searchParams, location: e.target.value})} />
        <button onClick={findSpecialist} style={{...miniBtnStyle, backgroundColor: '#3498db'}}>Search</button>
        <ul>{searchResults.map((doc, i) => <li key={i}>{doc.name} - {doc.specialty} ({doc.location})</li>)}</ul>
      </div>
    </div>
  );
};

const DoctorDashboard = ({ user }) => {
  const [presc, setPresc] = useState({ patientName: '', meds: '' });
  const issueMeds = () => {
    fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...presc, user_id: user.id }) }).then(() => alert("Issued"));
  };
  return (
    <div style={{ textAlign: 'left', marginTop: '20px' }}>
      <h3>Doctor Portal: Dr. {user.username}</h3>
      <div style={cardStyle}>
        <h4>Issue Prescription</h4>
        <input placeholder="Patient Name" style={miniInputStyle} onChange={e => setPresc({...presc, patientName: e.target.value})} />
        <textarea style={{ width: '100%', height: '50px' }} onChange={e => setPresc({...presc, meds: e.target.value})} />
        <button onClick={issueMeds} style={{...miniBtnStyle, backgroundColor: '#4caf50'}}>Issue</button>
      </div>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', width: '100%', boxSizing: 'border-box' };
const miniInputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #eee', width: '100%', marginBottom: '10px', boxSizing: 'border-box' };
const btnStyle = { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: 'white', fontWeight: 'bold', cursor: 'pointer', width: '100%' };
const miniBtnStyle = { ...btnStyle, padding: '8px', fontSize: '14px' };
const cardStyle = { background: 'white', padding: '15px', borderRadius: '12px', marginTop: '20px', borderLeft: '4px solid #2196f3' };

export default App;