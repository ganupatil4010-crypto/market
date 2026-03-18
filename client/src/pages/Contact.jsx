import React, { useState, useEffect } from 'react';

const Contact = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('9876543210');

  useEffect(() => {
    const savedNum = localStorage.getItem('whatsappNumber');
    if (savedNum) {
      setWhatsappNumber(savedNum);
    }
  }, []);

  const formatNumber = (num) => {
    return '+91 ' + num.replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  return (
    <section id="contact" className="page active-page">
      <div className="contact-card">
        <h2>संपर्क करें</h2>
        <div className="contact-details">
          <p><i className="fas fa-store"></i> गाँव किराना स्टोर, मुख्य बाज़ार, सुखपाली</p>
          <p><i className="fas fa-phone-alt"></i> +91 98765 43210</p>
          <p>
            <i className="fab fa-whatsapp"></i> 
            <span id="displayWhatsApp"> {formatNumber(whatsappNumber)}</span> (ऑर्डर के लिए)
          </p>
          <p><i className="fas fa-clock"></i> सुबह 8 से रात 9 बजे तक</p>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <p>हमें संदेश भेजें : <strong>gramkirana@example.com</strong></p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
