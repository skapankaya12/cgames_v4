import React from 'react';

interface CompletionScreenProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoLoaded: boolean;
  videoError: boolean;
  isVideoPlaying: boolean;
  handleVideoLoad: () => void;
  handleVideoError: () => void;
  handleVideoClick: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  videoRef,
  videoLoaded,
  videoError,
  isVideoPlaying,
  handleVideoLoad,
  handleVideoError,
  handleVideoClick
}) => {
  return (
    <div className="dialog-game-container completion-transition">
      <div className="fullscreen-video">
        <video 
          ref={videoRef}
          className={`background-video ${videoLoaded ? 'loaded' : ''}`}
          playsInline
          onClick={handleVideoClick}
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
        
        <div className={`video-overlay ${isVideoPlaying ? 'playing' : ''}`}>
          <div className="play-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <path d={isVideoPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="dialog-ui completion-fade">
        <div className="dialog-completion-center">
          <div className="dialog-box completion-box-center">
            <div className="dialog-content">
              <h2 style={{ color: '#00bfff', marginBottom: '20px', fontSize: '1.5rem' }}>
                🎉 Tebrikler, Kaptan!
              </h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
                Teslimat görevini başarıyla tamamladınız.
              </p>
              <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                Sonuçlarınız hazırlanıyor...
              </p>
              <div className="loading-spinner" style={{ marginTop: '20px' }}></div>
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