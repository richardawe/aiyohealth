import React, { useEffect } from 'react';
import YouTube from 'react-youtube';
import $ from 'jquery';
import 'magnific-popup';
import AOS from 'aos';
import 'aos/dist/aos.css';

export const IntroVideo = () => {
  useEffect(() => {
    $('.popup-video').magnificPopup({
      type: 'iframe',
    });

    AOS.init();
  }, []);

  const opts = {
    playerVars: {
      autoplay: 1,
      mute: 1,
      loop: 1,
      playlist: 'Y-x0efG1seA',
    },
  };

  return (
    <div className="intro-video bg-section" data-aos="fade-up">
      <div className="container-fluid">
        <div className="row no-gutters">
          <div className="col-lg-12">
            <div className="intro-video-box">
              <div className="intro-bg-video">
                <YouTube videoId="Y-x0efG1seA" opts={opts} />
              </div>
              <div className="video-play-button">
                <a href="https://www.youtube.com/watch?v=Y-x0efG1seA" className="popup-video" data-cursor-text="Play">Play</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};