import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/IdentityScreen.css';

interface User {
  firstName: string;
  lastName: string;
  company: string;
}

const IdentityScreen2 = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ firstName: '', lastName: '', company: '' });
  const [error, setError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.firstName.trim() || !user.lastName.trim() || !user.company.trim()) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }
    if (!consentChecked) {
      setError('Teste başlamak için onay vermeniz gerekmektedir.');
      return;
    }
    sessionStorage.setItem('user2', JSON.stringify(user));
    navigate('/game2/test');
  };

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
    <div className="dialog-game-container">
      <video 
        ref={videoRef}
        className={`background-video ${videoLoaded ? 'loaded' : ''}`}
        src="/identityscreen.mp4"
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
          <div className="signup-container">
            <div className="signup-box">
              <h2 className="welcome-title">Hoş geldin!</h2>
              <div className="mission-text">
                <div className="coming-soon-banner">
                  <h3>🚀 Coming Soon</h3>
                  <p>Game 2 is currently under development. New challenges and scenarios are being prepared for you!</p>
                </div>
                <p>İkinci galaktik görevin yakında hazır olacak.</p>
                <p>Yeni senaryolar, farklı kararlar ve daha da zorlu liderlik testleri seni bekliyor.</p>
                <p>Bu oyun da aynı yapıda olacak: kimlik girişi, test soruları ve sonuçlar.</p>
                
                <div className="rules-section">
                  <p><strong>Yakında:</strong></p>
                  <p>• Yeni galaktik senaryolar</p>
                  <p>• Farklı liderlik zorlukları</p>
                  <p>• Gelişmiş analiz sistemi</p>
                  <p>• Karşılaştırmalı sonuçlar</p>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName2" className="form-label">İsim</label>
                  <input
                    id="firstName2"
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    placeholder="İsminizi girin"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName2" className="form-label">Soyisim</label>
                  <input
                    id="lastName2"
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    placeholder="Soyisminizi girin"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company2" className="form-label">Şirket</label>
                  <input
                    id="company2"
                    type="text"
                    value={user.company}
                    onChange={(e) => setUser({ ...user, company: e.target.value })}
                    placeholder="Şirketinizi girin"
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                
                <div className="consent-section">
                  <div className="consent-checkbox">
                    <input
                      type="checkbox"
                      id="consent2"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="consent-input"
                    />
                    <label htmlFor="consent2" className="consent-label">
                      <span className="checkbox-custom"></span>
                      <span className="consent-text">Onaylıyorum</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="start-button"
                  disabled={!user.firstName.trim() || !user.lastName.trim() || !user.company.trim() || !consentChecked}
                >
                  Demo Yolculuğa Başla
                </button>
              </form>
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

export default IdentityScreen2; 