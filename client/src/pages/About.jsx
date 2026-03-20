import React from 'react';

const About = () => {
  return (
    <section id="about" className="page active-page">
      <div className="about-card">
        <h2>हमारी कहानी</h2>
        <p style={{ fontSize: '1.3rem', lineHeight: 1.6 }}>
          हम गाँव के ही निवासी हैं और पिछले 20 सालों से किराना व्यवसाय कर रहे हैं। अब हमने अपने ग्राहकों की सुविधा के लिए ऑनलाइन सेवा शुरू की है। हर दिन ताज़ा सामान, उचित दर और समय पर डिलीवरी हमारी पहचान है।
          संपक : 9822111304
        </p>
        <p style={{ marginTop: '1.5rem' }}>🙏 गाँव वासियों का प्यार ही हमारी प्रेरणा है।</p>
      </div>
    </section>
  );
};

export default About;
