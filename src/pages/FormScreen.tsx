import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormScreen.css';

interface User {
  firstName: string;
  lastName: string;
  company: string;
}

const FormScreen = () => {
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
    sessionStorage.setItem('user', JSON.stringify(user));
    navigate('/test');
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

  const handleBack = () => {
    navigate('/');
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
              <button 
                onClick={handleBack}
                className="back-button"
              >
                ← Geri
              </button>
              <h2 className="welcome-title">Hoş geldin!</h2>
              <div className="mission-text">
                <p>Galaksiler arası teslimat kaptanısın.</p>
                <p>Görevin riskli bir enerji çekirdeğini Nova Terminali'ne zamanında, hasarsız ve doğru kişiye teslim etmek.</p>
                <p>Yol boyunca karşılaşacağın olaylarda verdiğin kararlar, liderlik tarzını, karakterini ve reflekslerini ortaya çıkaracak.</p>
                <p>Bu bir test değil! Her karar bir tercih, her tercih bir sonuç.</p>
                
                <div className="rules-section">
                  <p><strong>Kurallar:</strong></p>
                  <p>• Her sahnede yalnızca bir seçim yapacaksın.</p>
                  <p>• İstersen cevabını ''Geri'' butonuna basarak değiştirebilirsin, en iyi seni yansıtan seçimi bulmaya çalış.</p>
                  <p>• Doğru ya da yanlış cevap yok! Sistem senin yetkinliklerini ve davranış reflekslerini analiz eder.</p>
                  <p> Bu testi başlatarak, verdiğiniz cevapların analiz için kaydedileceğini ve gizli tutulacağını kabul etmiş olursunuz.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">İsim</label>
                  <input
                    id="firstName"
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    placeholder="İsminizi girin"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Soyisim</label>
                  <input
                    id="lastName"
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    placeholder="Soyisminizi girin"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company" className="form-label">Şirket</label>
                  <input
                    id="company"
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
                      id="consent"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="consent-input"
                    />
                    <label htmlFor="consent" className="consent-label">
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
                  Yolculuğa Başla
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">İsmimiz inşallah 2025. All rights reserved</p>
      </div>
    </div>
  );
};

export default FormScreen; 