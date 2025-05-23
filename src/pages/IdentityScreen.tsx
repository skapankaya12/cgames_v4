import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IdentityScreen.css';

interface User {
  firstName: string;
  lastName: string;
}

const IdentityScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ firstName: '', lastName: '' });
  const [error, setError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const welcomeText = "Galaksiler arası teslimat kaptanısın. Görevin, yüksek riskli bir enerji çekirdeğini Nova Terminali'ne zamanında, hasarsız ve doğru kişiye ulaştırmak. Yol boyunca vereceğin kararlar, liderlik tarzını ve reflekslerini ortaya çıkaracak. Hazır mısın? Teslimat başlıyor.";

  // Initialize and play welcome video
  useEffect(() => {
    if (videoRef.current) {
      setVideoLoaded(false);
      setVideoError(false);
      
      // Set the source directly in JavaScript
      try {
        // Use a relative URL with the import.meta.env.BASE_URL prefix
        const videoPath = `${import.meta.env.BASE_URL}scenes/welcomescreen.mp4`;
        console.log('Loading video from:', videoPath);
        
        videoRef.current.src = videoPath;
        videoRef.current.load();
        
        // Add a small delay before trying to play to ensure the video has loaded properly
        const playVideoTimer = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsVideoPlaying(true);
                setVideoLoaded(true); // Set loaded state when play starts successfully
                console.log('Video playing successfully');
              })
              .catch(err => {
                console.error('Video play error:', err);
                // Only set error if there's actually a problem with the source
                if (err.name !== 'NotAllowedError') {
                  setVideoError(true);
                  console.error('Video error details:', err.message);
                }
              });
          }
        }, 500); // Increased delay for better loading
        
        // Cleanup on unmount
        return () => {
          clearTimeout(playVideoTimer);
          
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = '';
            videoRef.current.load();
          }
        };
      } catch (error) {
        console.error('Video setup error:', error);
        setVideoError(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.firstName.trim() || !user.lastName.trim()) {
      setError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    sessionStorage.setItem('user', JSON.stringify(user));
    navigate('/test');
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false); // Clear any error state when the video loads successfully
  };

  const handleVideoError = () => {
    console.error('Welcome video failed to load');
    setVideoError(true);
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsVideoPlaying(true))
          .catch(err => console.error('Error playing video:', err));
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  return (
    <div className="dialog-game-container">
      {/* Fullscreen Video Background */}
      <div className="fullscreen-video">
        <video 
          ref={videoRef}
          className={`background-video ${videoLoaded ? 'loaded' : ''}`}
          playsInline
          muted
          loop
          onClick={handleVideoClick}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        >
          {/* Source is set via JavaScript for better control */}
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
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Yeniden Dene
            </button>
          </div>
        )}
      </div>

      {/* Dialog UI Overlay */}
      <div className="dialog-ui">
        {/* Progress HUD Header */}
        <div className="progress-hud">
          <div className="header-content">
            <div className="welcome-header-title">🛸 Hoş Geldiniz, Kaptan!</div>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="dialog-content">
          {/* Scene Narration */}
          <div className="dialog-narration">
            <div className="dialog-box narration-box">
              <div className="dialog-content">
                <p>{welcomeText}</p>
              </div>
            </div>
          </div>

          {/* Dialog Options - Welcome Form */}
          <div className="dialog-options">
            <div className="options-box">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    id="firstName"
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    placeholder="İsim"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    id="lastName"
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    placeholder="Soyisim"
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button
                  type="submit"
                  className="start-button"
                  disabled={!user.firstName.trim() || !user.lastName.trim()}
                >
                  BAŞLA ▶
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityScreen; 