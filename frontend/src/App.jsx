import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import { routes } from './routes';
import { Onboarding } from './components/Onboarding';
import { SplashScreen } from './components/SplashScreen';

export const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 1.2s then app, then hide splash and onboarding
    setTimeout(() => {
      setShowSplash(false);
      setShowOnboarding(false);
    }, 1200);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <AuthProvider>
      <Routes>
        {routes.map((route, index) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </AuthProvider>
  );
};