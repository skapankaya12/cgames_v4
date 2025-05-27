import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IdentityScreen.css';

const IdentityScreen = () => {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Video autoplay failed:', error);
      });
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
  };

  const handleStartGame = () => {
    navigate('/form');
  };

  return (
    <div className="dialog-game-container">
      <video 
        ref={videoRef}
        className={`background-video ${videoLoaded ? 'loaded' : ''}`}
        src="/videoidentityscreen.mp4"
        playsInline
        muted
        loop
        autoPlay
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      >
        Your browser does not support the video tag.
      </video>
      
      {!videoLoaded && !videoError && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {videoError && (
        <div className="video-error">
          <p>Video yüklenemedi</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Yeniden Dene
          </button>
        </div>
      )}

      <div className="hero-section">
        <div className="hero-content">
          <div className="start-game-container">
            <button
              onClick={handleStartGame}
              className="start-game-button"
            >
              Oyuna Başla
            </button>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">İsmimiz inşallah 2025. All rights reserved</p>
      </div>
    </div>
  );
};

export default IdentityScreen; 