import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/EndingScreen.css';

const EndingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure smooth entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-navigate to results page after 8 seconds
    const navigationTimer = setTimeout(() => {
      // Check if we came from game2 to navigate to the correct results page
      const isGame2 = location.state?.fromGame2 || false;
      if (isGame2) {
        navigate('/game2/results', { state: location.state });
      } else {
        navigate('/results', { state: location.state });
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(navigationTimer);
    };
  }, [navigate, location.state]);

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

  return (
    <div className={`ending-screen-container ${isVisible ? 'visible' : ''}`}>
      <video 
        ref={videoRef}
        className={`background-video ${videoLoaded ? 'loaded' : ''}`}
        src="/ending screen.mp4"
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
          <p>Loading ending screen...</p>
        </div>
      )}

      {videoError && (
        <div className="video-error">
          <h2>Video Error</h2>
          <p>Failed to load the ending screen video.</p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <p className="progress-text">Preparing your results...</p>
      </div>
    </div>
  );
};

export default EndingScreen; 