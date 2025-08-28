import React, { useState, useEffect } from 'react';

export const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate a 2-second loading time

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) {
    return null; // Hide the preloader once loading is complete
  }

  return (
    <div className="preloader">
      <div className="loading-container">
        <div className="loading"></div>
        <div id="loading-icon">
          <img src="/images/loader.svg" alt="Loading" />
        </div>
      </div>
    </div>
  );
};