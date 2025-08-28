import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AboutUs = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="about-us">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6" data-aos="fade-right">
            <div className="about-us-content">
              <div className="section-title">
                <h3>About Us</h3>
                <h2 className="text-anime-style-3" data-cursor="-opaque">Committed to Women’s Health and Wellness</h2>
                <p>
                Aiyo Health blends the accessibility of smartphone technology, the sophistication of artificial intelligence, and the power of cloud computing to enable women to conduct personalized cervical cancer risk assessments and learn about corresponding prevention and treatment guidelines. 
                </p>
              </div>
              <div className="about-experience-box">
                <div className="about-experience-list" data-aos="fade-up" data-aos-delay="200">
                  <ul>
                    <li>Early Detection, Better Outcomes</li>
                    <li>Personalized Health Insights</li>
                    <li>Trusted Medical Guidance</li>
                  </ul>
                </div>
                <div className="about-experience-image">
                  <figure className="image-anime reveal">
                    <img src="/images/about-experience-image.jpg" alt="Empowering women through health education" />
                  </figure>
                </div>
              </div>
              <div className="about-us-body" data-aos="fade-up" data-aos-delay="400">
                <div className="about-contact-box">
                  <div className="icon-box">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="about-contact-box-content">
                    <p>Need Support?</p>
                    <h3><a href="tel:123456789">(+22) 123 456 789</a></h3>
                  </div>
                </div>
                <div className="about-us-btn">
                  <Link to="/health-resources" className="btn-default">Learn More</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6" data-aos="fade-left">
            <div className="about-us-images">
              <div className="about-img-1">
                <figure className="image-anime reveal">
                  <img src="/images/about-img-1.jpg" alt="Healthcare professional assisting a patient" />
                </figure>
                <div className="company-experience-circle">
                  <img src="/images/experience-circle.svg" alt="Years of experience in women’s health" />
                </div>
              </div>
              <div className="about-img-2">
                <figure className="image-anime reveal">
                  <img src="/images/about-img-2.jpg" alt="Educational resources on Cervical cancer prevention" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;