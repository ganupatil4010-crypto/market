import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section id="home" className="page active-page">
      <div className="hero">
        <h2>गाँव की ताज़ी किराना, अब आपके द्वार</h2>
        <p>हमारे ऑनलाइन स्टोर से मंगाएँ और फटाफट डिलीवरी पाएँ। सैकड़ों उत्पाद उपलब्ध।</p>
        <Link to="/products" className="btn">अभी खरीदें →</Link>
      </div>
      <div className="features">
        <div className="feature-card">
          <i className="fas fa-truck"></i>
          <h3>मुफ्त डिलीवरी</h3>
          <p>गाँव में 500₹ से ऊपर ऑर्डर पर नि:शुल्क</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-whatsapp"></i>
          <h3>व्हाट्सएप ऑर्डर</h3>
          <p>सीधा हमारे नंबर पर पहुंचेगा आपका ऑर्डर</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-leaf"></i>
          <h3>ताज़ा सामान</h3>
          <p>रोज़ाना नई सप्लाई, गाँव की गुणवत्ता</p>
        </div>
      </div>
    </section>
  );
};

export default Home;
