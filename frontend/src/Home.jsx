import React, { useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import { WhatWeDo } from './components/WhatWeDo';
import { IntroVideo } from './components/IntroVideo';
import CaseStudy from './components/CaseStudy';
import Appointment from './components/Appointment';
import Blog from './components/Blog';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Home = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>Aiyo Care - Welcome</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
          <meta name="description" content="" />
          <meta name="keywords" content="" />
          <meta name="author" content="Awaiken" />
          <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Marcellus&family=Sora:wght@100..800&display=swap"
            rel="stylesheet"
          />
        </Helmet>
        <div>
          
          <Header />
          <Hero />
          
          <WhatWeDo />
         
          
          
          <Footer />
        </div>
      </>
    </HelmetProvider>
  );
};