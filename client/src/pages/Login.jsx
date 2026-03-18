import React, { useState } from 'react';
import axios from 'axios';

// Ensure this matches your backend URL structure if different
const API_URL = 'http://localhost:5000/api/users';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('user');
  
  // User Login States
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: Name/Returning
  const [returningUserMsg, setReturningUserMsg] = useState('');
  const [userError, setUserError] = useState('');

  // Owner Login States
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerError, setOwnerError] = useState('');

  const handleUserPhoneSubmit = async () => {
    setUserError('');
    if (!/^\d{10}$/.test(phone)) {
      setUserError('कृपया सही 10 अंकों का मोबाइल नंबर डालें!');
      return;
    }

    try {
      // First try to login with just the phone to see if they exist
      const res = await axios.post(`${API_URL}/login`, { phone, name: 'temp' });
      // If our backend logic says returning user
      if (res.data.msg === 'Returning user') {
        setReturningUserMsg(`🎉 ${res.data.user.name} जी, आपको पहचान लिया!`);
        setName(res.data.user.name); // Store their name
        setStep(2); // Returning user step
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.isNew) {
        setStep(3); // Registration step
      } else {
        setUserError('Something went wrong. Try again.');
      }
    }
  };

  const handleUserRegistrationSubmit = async () => {
    setUserError('');
    if (!name.trim()) {
      setUserError('कृपया अपना नाम डालें!');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/login`, { phone, name });
      alert(`✅ ${res.data.user.name} जी, रजिस्ट्रेशन सफल! आपका स्वागत है।`);
      onLogin({ name: res.data.user.name, phone: res.data.user.phone, role: 'user' });
    } catch (err) {
      setUserError('Registration failed.');
    }
  };

  const handleReturningUserLogin = () => {
    alert(`✅ ${name} जी, स्वागत है! अब खरीदारी करें।`);
    onLogin({ name, phone, role: 'user' });
  };

  const handleOwnerSubmit = async () => {
    setOwnerError('');
    try {
      const res = await axios.post(`${API_URL}/owner-login`, { 
        username: ownerUsername, 
        password: ownerPassword 
      });
      if (res.data.success) {
        alert('👑 ओनर लॉगिन सफल! अब आप कीमतें अपडेट कर सकते हैं, नए उत्पाद जोड़ सकते हैं और उत्पाद हटा सकते हैं।');
        onLogin({ name: 'Owner', role: 'owner' });
      }
    } catch (err) {
      setOwnerError('गलत यूजरनेम या पासवर्ड!');
    }
  };

  const resetPhoneStep = () => {
    setStep(1);
    setPhone('');
    setName('');
    setUserError('');
  };

  return (
    <section id="login" className="page active-page">
      <div className="login-wrapper">
        <div className="login-tabs">
          <button 
            type="button"
            className={`login-tab-btn ${activeTab === 'user' ? 'active' : ''}`} 
            onClick={() => setActiveTab('user')}
          >
            👤 यूजर लॉगिन
          </button>
          <button 
            type="button"
            className={`login-tab-btn ${activeTab === 'owner' ? 'active' : ''}`} 
            onClick={() => setActiveTab('owner')}
          >
            👑 ओनर लॉगिन
          </button>
        </div>

        {activeTab === 'user' && (
          <div className="login-tab-content active">
            <h2>👋 स्वागत है!</h2>
            
            {step === 1 && (
              <div id="phoneStep">
                <input 
                  type="tel" 
                  placeholder="मोबाइल नंबर (10 अंक)" 
                  maxLength="10" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserPhoneSubmit()}
                />
                <button className="login-submit-btn user-btn" onClick={handleUserPhoneSubmit}>
                  🔍 आगे बढ़ें
                </button>
              </div>
            )}

            {step === 3 && (
              <div id="registerFields">
                <p style={{ color: '#2874f0', fontSize: '1rem', marginBottom: '0.5rem' }}>✨ नए यूजर! अपना नाम डालें:</p>
                <input 
                  type="text" 
                  placeholder="आपका नाम" 
                  autoComplete="off" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserRegistrationSubmit()}
                />
                <button className="login-submit-btn user-btn" onClick={handleUserRegistrationSubmit}>
                  📝 रजिस्टर करें
                </button>
                <button onClick={resetPhoneStep} style={{ width: '100%', background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  ← वापस जाएं
                </button>
              </div>
            )}

            {step === 2 && (
              <div id="returningUserDiv" style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ color: '#25a244', fontSize: '1.1rem', fontWeight: 700 }}>
                  {returningUserMsg}
                </p>
                <button className="login-submit-btn user-btn" onClick={handleReturningUserLogin}>
                  ✅ लॉगिन करें
                </button>
                <button onClick={resetPhoneStep} style={{ width: '100%', background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  ← वापस जाएं
                </button>
              </div>
            )}

            {userError && <div className="error-message" style={{ display: 'block' }}>{userError}</div>}
            <p className="login-info-note">पहले मोबाइल नंबर डालें — नए हैं तो रजिस्टर होंगे।</p>
          </div>
        )}

        {activeTab === 'owner' && (
          <div className="login-tab-content active">
            <h2>🔐 ओनर लॉगिन</h2>
            <input 
              type="text" 
              placeholder="यूजरनेम" 
              autoComplete="off" 
              value={ownerUsername}
              onChange={(e) => setOwnerUsername(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="पासवर्ड" 
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleOwnerSubmit()}
            />
            <button type="button" className="login-submit-btn" onClick={handleOwnerSubmit}>लॉगिन करें</button>
            <p className="login-hint" style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem', textAlign: 'center' }}>
              सूचना: ओनर लॉगिन के लिए अपने क्रेडेंशियल्स का उपयोग करें।
            </p>
            {ownerError && <div className="error-message" style={{ display: 'block' }}>{ownerError}</div>}
          </div>
        )}
      </div>
    </section>
  );
};

export default Login;
