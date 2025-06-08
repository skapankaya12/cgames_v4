import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@cgames/ui-kit/styles/TestScreen.css';

const TestScreen2 = () => {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user data exists
    const storedUser = sessionStorage.getItem('user2');
    if (!storedUser) {
      navigate('/candidate/game2');
      return;
    }
  }, [navigate]);

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

  const handleBackToIdentity = () => {
    navigate('/candidate/game2');
  };

  const handleGoToResults = () => {
    // Set dummy answers for demo
    const demoAnswers = { 1: 'demo', 2: 'demo' };
    sessionStorage.setItem('answers2', JSON.stringify(demoAnswers));
    navigate('/candidate/ending', { state: { fromGame2: true } });
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

      <div className="dialog-container">
        <div className="dialog-content">
          <div className="dialog-header">
            <div className="progress-container">
              <div className="progress-info">
                <span className="progress-text">Game 2 - Demo Mode</span>
              </div>
            </div>
          </div>

          <div className="dialog-story">
            <div className="dialog-box story-box">
              <div className="dialog-content">
                <div className="coming-soon-content">
                  <h2>🚀 Game 2 - Coming Soon</h2>
                  <div className="demo-message">
                    <h3>Bu bir demo sayfasıdır</h3>
                    <p>Game 2'nin test soruları henüz hazırlanmaktadır. Şu anda sadece yapının nasıl çalışacağını görebilirsiniz.</p>
                    
                    <div className="features-preview">
                      <h4>Yakında gelecek özellikler:</h4>
                      <ul>
                        <li>🌌 Yeni galaktik senaryolar</li>
                        <li>🎯 Farklı liderlik zorlukları</li>
                        <li>📊 Gelişmiş analiz sistemi</li>
                        <li>🔄 Karşılaştırmalı sonuçlar</li>
                        <li>⚡ Dinamik soru yapısı</li>
                      </ul>
                    </div>

                    <div className="demo-navigation">
                      <p>Demo sonuçları görmek için "Demo Sonuçları" butonuna tıklayabilirsiniz.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dialog-navigation">
            <button 
              className="nav-button back-button"
              onClick={handleBackToIdentity}
            >
              ← Geri
            </button>
            <button 
              className="nav-button next-button"
              onClick={handleGoToResults}
            >
              Demo Sonuçları →
            </button>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">Cognitive Games. All rights reserved</p>
      </div>
    </div>
  );
};

export default TestScreen2; 