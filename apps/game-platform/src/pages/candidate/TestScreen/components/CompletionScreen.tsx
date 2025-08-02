import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameFlow } from '../../../../contexts/GameFlowContext';

interface CompletionScreenProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoLoaded: boolean;
  videoError: boolean;
  isVideoPlaying: boolean;
  handleVideoLoad: () => void;
  handleVideoError: () => void;
  handleVideoClick: () => void;
  testResults?: any; // Results from the test
}

export const CompletionScreen = ({
  videoRef,
  videoLoaded,
  videoError,
  isVideoPlaying,
  handleVideoLoad,
  handleVideoError,
  handleVideoClick,
  testResults
}: CompletionScreenProps) => {
  const { t } = useTranslation('common');
  const { goToNextStep, submitResults, isResultsSubmitted } = useGameFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-submit results when component mounts
  useEffect(() => {
    if (testResults && !isResultsSubmitted && !isSubmitting) {
      handleSubmitResults();
    }
  }, [testResults, isResultsSubmitted, isSubmitting]);

  const handleSubmitResults = async () => {
    if (!testResults || isSubmitting || isResultsSubmitted) return;

    console.log('📊 [CompletionScreen] Submitting test results...');
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitResults(testResults);
      console.log('✅ [CompletionScreen] Results submitted successfully');
      
      // Wait a moment then proceed to next step (ending screen)
      setTimeout(() => {
        goToNextStep();
      }, 2000);
      
    } catch (error) {
      console.error('❌ [CompletionScreen] Error submitting results:', error);
      setSubmitError(t('test.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (isResultsSubmitted) {
      goToNextStep();
    } else if (!isSubmitting) {
      // Retry submission if it failed
      handleSubmitResults();
    }
  };

  return (
    <div className="dialog-game-container">
        <video 
          ref={videoRef}
          className={`background-video ${videoLoaded ? 'loaded' : ''}`}
        src="/ending screen.mp4"
          playsInline
        muted
        loop={false}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        onClick={handleVideoClick}
        >
          Your browser does not support the video tag.
        </video>
        
        {!videoLoaded && !videoError && (
          <div className="video-loading">
            <div className="loading-spinner"></div>
          <p>{t('test.loadingCompletion')}</p>
          </div>
        )}
        
      <div className="dialog-ui">
        <div className="completion-content">
          <div className="completion-header">
            <div className="success-icon">
              <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="25" fill="#10B981"/>
                <path d="M16 25L22 31L34 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="completion-title">{t('test.missionComplete')}</h2>
            <p className="completion-subtitle">{t('test.analysisInProgress')}</p>
          </div>

          {/* Submission Status */}
          <div className="submission-status">
            {isSubmitting && (
              <div className="status-item submitting">
                <div className="status-spinner"></div>
                <span>{t('test.submittingResults')}</span>
              </div>
            )}

            {isResultsSubmitted && (
              <div className="status-item success">
                <span className="status-icon">✅</span>
                <span>{t('test.resultsSubmitted')}</span>
          </div>
        )}
        
            {submitError && (
              <div className="status-item error">
                <span className="status-icon">❌</span>
                <span>{submitError}</span>
              </div>
            )}
          </div>

          {/* Progress Information */}
          <div className="progress-info">
            <div className="progress-step completed">
              <span className="step-icon">✅</span>
              <span className="step-text">{t('test.questionsCompleted')}</span>
        </div>
            
            <div className={`progress-step ${isSubmitting ? 'active' : isResultsSubmitted ? 'completed' : 'pending'}`}>
              <span className="step-icon">
                {isSubmitting ? '⏳' : isResultsSubmitted ? '✅' : '⚪'}
              </span>
              <span className="step-text">{t('test.dataProcessing')}</span>
      </div>
      
            <div className={`progress-step ${isResultsSubmitted ? 'active' : 'pending'}`}>
              <span className="step-icon">
                {isResultsSubmitted ? '🎯' : '⚪'}
              </span>
              <span className="step-text">{t('test.generatingResults')}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="completion-actions">
            {isResultsSubmitted ? (
              <button 
                className="continue-btn success"
                onClick={handleContinue}
              >
                <span className="button-icon">🎉</span>
                {t('test.viewResults')}
              </button>
            ) : submitError ? (
              <button 
                className="continue-btn retry"
                onClick={handleContinue}
                disabled={isSubmitting}
              >
                <span className="button-icon">🔄</span>
                {t('test.retrySubmission')}
              </button>
            ) : (
              <div className="waiting-message">
                <p>{t('test.pleaseWait')}</p>
                <div className="waiting-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="completion-footer">
            <p className="info-text">
              {t('test.completionInfo')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="game-footer">
        <p className="footer-text">{t('app.copyright')}</p>
      </div>
    </div>
  );
}; 