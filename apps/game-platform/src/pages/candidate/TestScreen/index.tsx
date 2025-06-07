import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { questions } from '../../../data/questions';
import InteractionTracker from '../../../services/InteractionTracker';
import { useTestState } from './hooks/useTestState';
import { useVideoManager } from './hooks/useVideoManager';
import { TestProgress } from './components/TestProgress';
import { VideoDisplay } from './components/VideoDisplay';
import { TestNarration } from './components/TestNarration';
import { TestOptions } from './components/TestOptions';
import { ForwardingMessage } from './components/ForwardingMessage';
import { CompletionScreen } from './components/CompletionScreen';
import '../../../styles/TestScreen.css';

const TestScreen = () => {
  const navigate = useNavigate();
  const { questionNumber } = useParams<{ questionNumber: string }>();
  
  // Initialize interaction tracker
  const trackerRef = useRef<InteractionTracker | null>(null);
  const API_URL = `https://script.google.com/macros/s/AKfycbzMTWueAS7y8b_Us7FoA2joYyaAim_KsGL9YlaGd0LfJNuUFPczGJfA4kBP6wUrT7J0/exec`;

  const {
    testState,
    showForwardingLine,
    isTransitioning,
    error,
    narrationText,
    currentQuestion,
    progress,
    handleAnswer,
    handlePrevious,
    setError
  } = useTestState(questions, questionNumber, navigate, trackerRef);

  const {
    videoRef,
    videoLoaded,
    videoError,
    isVideoPlaying,
    handleVideoLoad,
    handleVideoError,
    handleVideoClick
  } = useVideoManager(testState, currentQuestion);

  // Initialize tracker on component mount
  useEffect(() => {
    if (!trackerRef.current) {
      trackerRef.current = new InteractionTracker(API_URL);
    }
  }, [API_URL]);

  // If test is complete, show completion screen
  if (testState.isComplete) {
    return (
      <CompletionScreen
        videoRef={videoRef}
        videoLoaded={videoLoaded}
        videoError={videoError}
        isVideoPlaying={isVideoPlaying}
        handleVideoLoad={handleVideoLoad}
        handleVideoError={handleVideoError}
        handleVideoClick={handleVideoClick}
      />
    );
  }

  return (
    <div className="dialog-game-container">
      <VideoDisplay
        videoRef={videoRef}
        videoLoaded={videoLoaded}
        videoError={videoError}
        isVideoPlaying={isVideoPlaying}
        handleVideoLoad={handleVideoLoad}
        handleVideoError={handleVideoError}
        handleVideoClick={handleVideoClick}
      />
      
      <div className="dialog-ui">
        <TestProgress
          progress={progress}
          currentQuestion={testState.currentQuestion}
          totalQuestions={questions.length}
          isTransitioning={isTransitioning}
          onPrevious={handlePrevious}
        />
        
        <TestNarration
          currentQuestion={currentQuestion}
          narrationText={narrationText}
        />
        
        <TestOptions
          currentQuestion={currentQuestion}
          answers={testState.answers}
          isTransitioning={isTransitioning}
          error={error}
          onAnswer={handleAnswer}
        />
        
        {showForwardingLine && (
          <ForwardingMessage
            currentQuestion={currentQuestion}
            isTransitioning={isTransitioning}
            isLastQuestion={testState.currentQuestion === questions.length - 1}
          />
        )}
      </div>
      
      <div className="game-footer">
        <p className="footer-text">İsmimiz inşallah 2025. All rights reserved</p>
      </div>
    </div>
  );
};

export default TestScreen; 