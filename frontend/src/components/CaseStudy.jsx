import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const CaseStudy = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  const caseStudies = [
    { title: 'Early Detection Saved My Life', image: '/images/case-study-image-1.jpg', alt: 'Woman smiling after early detection success' },
    { title: 'Empowered Through Education', image: '/images/case-study-image-2.jpg', alt: 'Woman reading educational health resources' },
    { title: 'Timely Screening, Better Outcomes', image: '/images/case-study-image-3.jpg', alt: 'Woman consulting with a healthcare professional' },
    { title: 'Taking Control with Symptom Tracking', image: '/images/case-study-image-4.jpg', alt: 'Woman tracking symptoms on the app' },
  ];

  return (
    <div className="case-study">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="case-study-content">
              <div className="section-title">
                <h3 data-aos="fade-up">Success Stories</h3>
                <h2 className="text-anime-style-3" data-cursor="-opaque">Inspiring Health Transformations</h2>
                <p data-aos="fade-up" data-aos-delay="200">
                  Explore real stories of women who have taken control of their health, achieved early detection, and improved their well-being through our app’s tools and resources.
                </p>
              </div>
              <div className="case-study-btn" data-aos="fade-up" data-aos-delay="400">
                <Link to="/health-resources" className="btn-default">All Success Stories</Link>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="row">
              {caseStudies.map((study, index) => (
                <div className="col-md-6" key={index}>
                  <div className={`case-study-item`} data-aos="fade-up" data-aos-delay={`${200 * index}`}>
                    <div className="case-study-image">
                      <Link to="/health-resources" data-cursor-text="View">
                        <figure className="image-anime">
                          <img src={study.image} alt={study.alt} />
                        </figure>
                      </Link>
                    </div>
                    <div className="case-study-body">
                      <div className="case-study-item-content">
                        <h3><Link to="/health-resources">{study.title}</Link></h3>
                      </div>
                      <div className="case-study-readmore-btn">
                        <Link to="/health-resources" className="readmore-btn">
                          <img src="/images/arrow-white.svg" alt="Arrow icon for read more" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudy;