import React, { useState } from 'react';
import '../assets/css/auth.css';

const slides = [
  {
    title: 'Welcome to Aiyo Care',
    description: 'Empowering early detection of cervical cancer for women’s health.',
    image: '/images/logo.png',
  },
  {
    title: 'Personalized Screening',
    description: 'Get recommendations tailored to your health profile and history.',
    image: '/images/appointment-image.png',
  },
  {
    title: 'Track Your Progress',
    description: 'Easily view your screening history and health resources.',
    image: '/images/case-study-image-1.jpg',
  },
  {
    title: 'Get Started!',
    description: 'Let’s begin your journey to better health.',
    image: '/images/hero-bg-shape.svg',
  },
];

export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('aiyo_onboarding_complete', '1');
      if (onComplete) onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('aiyo_onboarding_complete', '1');
    if (onComplete) onComplete();
  };

  return (
    <div className="onboarding-container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--secondary-color)' }}>
      <div className="onboarding-logo mb-4">
        <img src={slides[step].image} alt="Onboarding" style={{ maxWidth: 150, maxHeight: 120, objectFit: 'contain' }} />
      </div>
      <h2 style={{ fontFamily: 'var(--accent-font)', color: 'var(--primary-color)' }}>{slides[step].title}</h2>
      <p style={{ color: 'var(--text-color)', fontSize: 18, margin: '20px 0 30px' }}>{slides[step].description}</p>
      <div className="d-flex gap-2">
        {step < slides.length - 1 && (
          <button className="btn btn-outline-secondary me-2" onClick={handleSkip}>Skip</button>
        )}
        <button className="btn-default" onClick={handleNext}>
          {step === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
      <div className="onboarding-progress mt-4">
        {slides.map((_, i) => (
          <span key={i} style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: i === step ? 'var(--primary-color)' : 'var(--divider-color)',
            margin: '0 4px',
          }} />
        ))}
      </div>
    </div>
  );
};
