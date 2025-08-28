import React from 'react';
import { Helmet } from 'react-helmet';
import { Preloader } from './components/Preloader';
import './assets/css/auth.css'; // Import auth.css

export const ForgotPassword = () => {
  return (
    <>
      <Helmet>
        <title>Forgot Password</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
      </Helmet>
      <Preloader />
      <div className="container">
        <h1>Forgot Password</h1>
        <p>Password reset form goes here.</p>
      </div>
    </>
  );
};