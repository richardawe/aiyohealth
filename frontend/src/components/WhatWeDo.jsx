import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import AOS from 'aos';
import 'aos/dist/aos.css';

export const WhatWeDo = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="what-we-do">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-4 col-md-6">
            <div className="what-we-image-1">
              <img src="/images/Image_3.png" alt="Illustration of women’s health tools" />
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="what-we-content">
              <div className="section-title">
                <h3 data-aos="fade-up">What We Do</h3>
                <h2 className="text-anime-style-3" data-cursor="-opaque">Empowering Early Detection and Care</h2>
                <p data-aos="fade-up" data-aos-delay="200">
                Aiyo Health blends the accessibility of smartphone technology, the sophistication of artificial intelligence, and the power of cloud computing to enable women to conduct personalized cervical cancer risk assessments and learn about corresponding prevention and treatment guidelines. 
                </p>
              </div>
              <div className="about-experience-list" data-aos="fade-up" data-aos-delay="400">
                <ul>
                  <li>Personalized Screening Plans</li>
                  <li>Track Symptoms with Ease</li>
                  <li>Access Expert Health Resources</li>
                </ul>
              </div>
              <div className="what-we-btn" data-aos="fade-up" data-aos-delay="600">
                <Link to="/health-resources" className="btn-default">Learn More</Link>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="what-we-image-2">
              <figure className="image-anime">
                <img src="/images/what-we-image-2.jpg" alt="Healthcare professional supporting women’s wellness" />
              </figure>
              <div className="experirnce-box">
                <h2>
                  <CountUp start={0} end={10} duration={1} />+
                </h2>
                <p>Years of Impact in Women’s Health</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};