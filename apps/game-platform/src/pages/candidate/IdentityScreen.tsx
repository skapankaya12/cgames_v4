import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameFlow } from '../../contexts/GameFlowContext';
import LanguageSelector from '../../components/LanguageSelector';
import '@cgames/ui-kit/styles/IdentityScreen.css';

const IdentityScreen = () => {
  const { t, i18n } = useTranslation('common');
  const { 
    goToNextStep, 
    detectedCountry, 
    selectedLanguage
  } = useGameFlow();
  
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-detect and set language based on country (silent, non-breaking)
  useEffect(() => {
    if (detectedCountry && selectedLanguage && i18n.language !== selectedLanguage) {
      console.log('🌍 [IdentityScreen] Auto-setting language based on country:', detectedCountry, '→', selectedLanguage);
      i18n.changeLanguage(selectedLanguage);
    }
  }, [detectedCountry, selectedLanguage, i18n]);

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
    // Use GameFlow context for navigation, but fallback to original behavior
    if (goToNextStep) {
      goToNextStep();
    } else {
      // Fallback to original navigation
      window.location.href = '/candidate/form';
    }
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
          <p>{t('validation.videoLoadFailed')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            {t('buttons.retry')}
          </button>
        </div>
      )}

      <div className="hero-section">
        <div className="language-selector-container">
          <LanguageSelector />
        </div>
        <div className="hero-content">
          <div className="start-game-container">
            <button
              onClick={handleStartGame}
              className="start-game-button"
            >
              {t('buttons.startGame')}
            </button>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">{t('app.copyright')}</p>
      </div>
    </div>
  );
};

export default IdentityScreen; 