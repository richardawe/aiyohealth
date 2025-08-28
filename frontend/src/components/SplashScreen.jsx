import React, { useEffect } from 'react';
import '../assets/css/auth.css';

export const SplashScreen = () => {
  useEffect(() => {
    // Optionally, add a timeout or loading logic
  }, []);
  return (
    <div className="preloader" style={{ background: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/images/logo.png" alt="Aiyo Logo" style={{ maxWidth: 150, maxHeight: 50, objectFit: 'contain' }} />
    </div>
  );
};
