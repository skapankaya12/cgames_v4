import React from 'react';
import { useTranslation } from 'react-i18next';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoLoaded: boolean;
  videoError: boolean;
  isVideoPlaying: boolean;
  handleVideoLoad: () => void;
  handleVideoError: () => void;
  handleVideoClick: () => void;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoRef,
  videoLoaded,
  videoError,
  isVideoPlaying,
  handleVideoLoad,
  handleVideoError,
  handleVideoClick
}) => {
  const { t } = useTranslation('common');
  return (
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
          <p>{t('validation.videoLoadFailed')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            {t('buttons.retry')}
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
  );
}; 