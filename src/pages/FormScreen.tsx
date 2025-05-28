import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormScreen.css';

interface User {
  firstName: string;
  lastName: string;
  company: string;
}

type FormStep = 'welcome' | 'rules' | 'form';

const FormScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [user, setUser] = useState<User>({ firstName: '', lastName: '', company: '' });
  const [error, setError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

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
    navigate('/test/1');
  };

  const handleBack = () => {
    if (currentStep === 'welcome') {
      navigate('/');
    } else if (currentStep === 'rules') {
      setCurrentStep('welcome');
    } else if (currentStep === 'form') {
      setCurrentStep('rules');
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 'welcome') {
      setCurrentStep('rules');
    } else if (currentStep === 'rules') {
      setCurrentStep('form');
    }
  };

  const renderWelcomeStep = () => (
    <div className="step-content welcome-step">
      <div className="step-header">
        <h2 className="step-title">Hoş geldin!</h2>
        <div className="step-indicator">
          <span className="step-number">1</span>
          <span className="step-total">/ 3</span>
        </div>
      </div>
      
      <div className="mission-content">
        
        <h3 className="mission-title">Göreve Atandın: Galaksiler Arası Teslimat Kaptanısın</h3>
        <div className="mission-description">
          <p>Bu kritik enerji çekirdeği, galaksi ittifakının enerji dengesini koruyacak ve evrenin geleceğini belirleyecek. Görevin: çekirdeği Nova Terminali'ne tam zamanında, eksiksiz ve doğru alıcıya ulaştırmak.</p>
          <p>Yolculuk yaklaşık 8-10 dakika sürecek. Verdiğin her karar; liderlik tarzını, karakterini ve reflekslerini test edecek ve seni yeni bir senaryoya yönlendirecek.</p>
        </div>
        
        <div className="mission-highlight">
          <strong>Bu bir test değil!</strong> Her tercih kaptanlık tarzının yansımasıdır. Hazırsan, kaptan koltuğuna geç ve maceranı başlat.
        </div>
      </div>

      <button onClick={handleNext} className="next-button">
        Devam Et
        <span className="button-arrow">→</span>
      </button>
    </div>
  );

  const renderRulesStep = () => (
    <div className="step-content rules-step">
      <div className="step-header">
        <h2 className="step-title">Kurallar & Talimatlar</h2>
        <div className="step-indicator">
          <span className="step-number">2</span>
          <span className="step-total">/ 3</span>
        </div>
      </div>
      
      <div className="rules-content">
        <div className="rule-item">
          <div className="rule-icon">
            <img 
              src="oneselection.png" 
              alt="One Selection" 
              className="rule-icon-image"
              onError={(e) => console.error('Failed to load image:', e)} 
            />
          </div>
          <div className="rule-text">
            <strong>Her sahnede yalnızca bir seçim yapacaksın</strong>
            <p>Dikkatli düşün ve en iyi seni yansıtan seçimi yap</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">
            <img 
              src="changeanswer.png" 
              alt="Change Answer" 
              className="rule-icon-image"
              onError={(e) => console.error('Failed to load image:', e)}
            />
          </div>
          <div className="rule-text">
            <strong>Cevabını değiştirebilirsin</strong>
            <p>"Geri" butonuna basarak önceki seçimini gözden geçirebilirsin</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">
            <img 
              src="norightwrong.png" 
              alt="No Right Wrong" 
              className="rule-icon-image"
              onError={(e) => console.error('Failed to load image:', e)}
            />
          </div>
          <div className="rule-text">
            <strong>Doğru ya da yanlış cevap yok</strong>
            <p>Sistem senin yetkinliklerini ve davranış reflekslerini analiz eder</p>
          </div>
        </div>
        
        <div className="privacy-notice">
          
          <p>Verdiğin cevaplar analiz için kaydedilecek ve gizli tutulacaktır.</p>
        </div>
      </div>

      <button onClick={handleNext} className="next-button">
        Anladım, Devam Et
        <span className="button-arrow">→</span>
      </button>
    </div>
  );

  const renderFormStep = () => (
    <div className="step-content form-step">
      <div className="step-header">
        <h2 className="step-title">Bilgilerini Gir</h2>
        <div className="step-indicator">
          <span className="step-number">3</span>
          <span className="step-total">/ 3</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="user-form">
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
  );

  return (
    <div className="dialog-game-container">
      <div className="background-image"></div>
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="wizard-container">
            <div className="wizard-box">
              <button 
                onClick={handleBack}
                className="back-button"
              >
                ← Geri
              </button>
              
              {currentStep === 'welcome' && renderWelcomeStep()}
              {currentStep === 'rules' && renderRulesStep()}
              {currentStep === 'form' && renderFormStep()}
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