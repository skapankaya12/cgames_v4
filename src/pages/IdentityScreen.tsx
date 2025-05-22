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
  const [narrationText, setNarrationText] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Welcome text to be displayed with typewriter effect
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

  // Replace typewriter effect with immediate text display
  useEffect(() => {
    // Display full text immediately
    setNarrationText(welcomeText);
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
    <div className="full-page-container">
      <div className="welcome-screen">
        <div className="video-scene">
          <video 
            ref={videoRef}
            className={`scene-video ${videoLoaded ? 'loaded' : ''}`}
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
                onClick={() => window.location.reload()}
                style={{ 
                  marginTop: '10px', 
                  padding: '5px 10px', 
                  background: '#4e5eff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Yeniden Dene
              </button>
            </div>
          )}
          <div className={`video-overlay ${isVideoPlaying ? 'playing' : ''}`}>
            <div className="play-icon">
              <svg viewBox="0 0 24 24" fill="white">
                <path d={isVideoPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="scene-narration">
          <p>{narrationText}</p>
        </div>
        
        <div className="question-options-container">
          <h1 className="welcome-title">🛸 Hoş Geldiniz, Kaptan!</h1>
          
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
        
        <div className="forwarding-text">
          <p>Yolculuğa hazır mısın?</p>
        </div>
      </div>
    </div>
  );
};

export default IdentityScreen; 