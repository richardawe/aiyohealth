import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import 'magnific-popup';

const Hero = () => {
  useEffect(() => {
    $('.popup-video').magnificPopup({
      type: 'iframe',
    });
  }, []);

  return (
    <div className="hero bg-section dark-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="hero-content">
              <div className="section-title">
                <h3 className="wow fadeInUp">Welcome to Aiyo Health</h3>
                <h1 className="text-anime-style-3" data-cursor="-opaque">Empower Women For Better Health</h1>
                <p className="wow fadeInUp" data-wow-delay="0.2s">
                The overarching mission of Aiyo Health is to help women detect the risk of cervical cancer as early as possible, to ensure they can live long and fulfilling lives with the people they love.
                </p>
              </div>
              <div className="hero-body wow fadeInUp" data-wow-delay="0.4s">
                <div className="hero-btn">
                  <Link to="/login" className="btn-default btn-highlighted">Portal</Link>
                </div>
                <div className="video-play-button">
                  <p>Watch Video</p>
                  <a href="https://www.youtube.com/watch?v=Y-x0efG1seA" className="popup-video" data-cursor-text="Play">
                    <i className="fa-solid fa-play"></i>
                  </a>
                </div>
              </div>
              <div className="hero-review-box wow fadeInUp" data-wow-delay="0.6s">
                <ul>
                  <li><img src="/images/icon-google.svg" alt="Google icon" /></li>
                  <li>4.5</li>
                  <li>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star-half-stroke"></i>
                  </li>
                  <li>(1000+ review)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-image">
              <img src="/images/Image_1.jpg" alt="Hero image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;