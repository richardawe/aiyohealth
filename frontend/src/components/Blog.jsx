import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Blog = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  const posts = [
    { title: 'Top 5 Tips for Early Cervical Cancer Detection', image: '/images/post-1.jpg', alt: 'Woman learning about early detection tips' },
    { title: 'Myths and Facts About Cervical Cancer', image: '/images/post-2.jpg', alt: 'Illustration of Cervical cancer myths and facts' },
    { title: 'What to Know Before Your First Screening', image: '/images/post-3.jpg', alt: 'Woman preparing for a health consultation' },
  ];

  return (
    <div className="our-blog" data-aos="fade-up">
      <div className="container">
        <div className="row section-row align-items-center">
          <div className="col-lg-12">
            <div className="section-title section-title-center">
              <h3 data-aos="fade-up">Latest Blog</h3>
              <h2 className="text-anime-style-3" data-cursor="-opaque">Insights on Cervical Cancer Prevention</h2>
            </div>
          </div>
        </div>
        <div className="row">
          {posts.map((post, index) => (
            <div className="col-lg-4 col-md-6" key={index} data-aos="fade-up" data-aos-delay={`${200 * (index + 1)}`}>
              <div className="post-item">
                <div className="post-featured-image">
                  <a href="/health-resources" data-cursor-text="View">
                    <figure className="image-anime">
                      <img src={post.image} alt={post.alt} />
                    </figure>
                  </a>
                </div>
                <div className="post-item-body">
                  <div className="post-item-content">
                    <h2><a href="/health-resources">{post.title}</a></h2>
                  </div>
                  <div className="post-item-btn">
                    <a href="/health-resources" className="readmore-btn">
                      <img src="/images/arrow-white.svg" alt="Arrow icon for read more" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;