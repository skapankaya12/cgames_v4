import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IdentityScreen.css';

interface User {
  firstName: string;
  lastName: string;
  company: string;
}

const IdentityScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ firstName: '', lastName: '', company: '' });
  const [error, setError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.firstName.trim() || !user.lastName.trim() || !user.company.trim()) {
      setError('Lütfen tüm alanları doldurunuz.');
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
              <div className="mission-text">
                <p>Galaksiler arası teslimat kaptanısın. Görevin, yüksek riskli bir enerji çekirdeğini Nova Terminali'ne zamanında, hasarsız ve doğru kişiye ulaştırmak.</p>
                <p>Yol boyunca karşılaşacağın krizlerde vereceğin kararlar, liderlik tarzını ve iş yapma reflekslerini ortaya çıkaracak.</p>
                <p>Her karar bir tercih, her tercih bir sonuç.</p>
                <p className="ready-text">Hazır mısın? Teslimat başlıyor.</p>
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
                <button
                  type="submit"
                  className="start-button"
                  disabled={!user.firstName.trim() || !user.lastName.trim() || !user.company.trim()}
                >
                  Yolculuğa Başla
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

export default IdentityScreen; 