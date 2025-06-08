import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@cgames/ui-kit/styles/ResultsScreen.css';

const ResultsScreen2 = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user2');
    const storedAnswers = sessionStorage.getItem('answers2');

    if (!storedUser || !storedAnswers) {
      console.error('Missing user or answers data for Game 2');
      navigate('/candidate/game2');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Error processing Game 2 data:', error);
      navigate('/candidate/game2');
    }
  }, [navigate]);

  const handleRestart = () => {
    sessionStorage.removeItem('user2');
    sessionStorage.removeItem('answers2');
    navigate('/candidate/game2');
  };

  const handleBackToGame1 = () => {
    navigate('/candidate');
  };

  if (!user) return null;

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
        onLoadedData={() => {
          setVideoLoaded(true);
          setVideoError(false);
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.error('Video autoplay failed:', error);
            });
          }
        }}
        onError={() => {
          console.error('Video failed to load');
          setVideoError(true);
        }}
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
          <div className="results-container">
            <div className="results-box">
              <div className="results-header">
                <h1 className="results-title">Demo Tamamlandı, Kaptan {user.firstName}!</h1>
                <p className="results-subtitle">
                  Game 2 demo versiyonunu deneyimlediğiniz için teşekkürler!
                </p>
              </div>

              <div className="demo-results-content">
                <div className="coming-soon-banner">
                  <h3>🚀 Game 2 - Demo Sonuçları</h3>
                  <p>Bu sadece bir demo gösterimidir. Gerçek sonuçlar Game 2 hazır olduğunda görüntülenecektir.</p>
                </div>

                <div className="demo-features">
                  <h4>Gerçek Game 2'de göreceğiniz özellikler:</h4>
                  
                  <div className="feature-grid">
                    <div className="feature-card">
                      <h5>📊 Detaylı Analiz</h5>
                      <p>Yeni yetkinlik alanları ve daha derinlemesine analiz</p>
                    </div>
                    
                    <div className="feature-card">
                      <h5>🎯 Karşılaştırma</h5>
                      <p>Game 1 ile Game 2 sonuçlarınızı karşılaştırma</p>
                    </div>
                    
                    <div className="feature-card">
                      <h5>📈 Gelişim Takibi</h5>
                      <p>Zaman içindeki liderlik gelişiminizi izleme</p>
                    </div>
                    
                    <div className="feature-card">
                      <h5>🌟 Yeni Senaryolar</h5>
                      <p>Farklı galaktik durumlar ve zorlu kararlar</p>
                    </div>
                  </div>
                </div>

                <div className="demo-message">
                  <p>Game 2 hazır olduğunda, aynı yapıda ancak yeni sorular ve senaryolarla karşınızda olacak.</p>
                  <p>Şimdilik Game 1'i deneyimleyebilir veya bu demo sayfasını yeniden ziyaret edebilirsiniz.</p>
                </div>
              </div>

              <div className="results-actions">
                <button 
                  onClick={handleBackToGame1}
                  className="action-button primary-button"
                >
                  Game 1'e Git
                </button>
                <button 
                  onClick={handleRestart}
                  className="action-button secondary-button"
                >
                  Demo'yu Yeniden Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">Cognitive Games. All rights reserved</p>
      </div>
    </div>
  );
};

export default ResultsScreen2; 