import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTranslatedQuestions } from '../../../utils/questionsUtils';
import { getSectionByQuestionId } from '../../../data/sections';
import InteractionTracker from '@cgames/services/InteractionTracker';
import { useTestState } from './hooks/useTestState';
import { useVideoManager } from './hooks/useVideoManager';
import { TestProgress } from './components/TestProgress';
import { VideoDisplay } from './components/VideoDisplay';
import { TestNarration } from './components/TestNarration';
import { TestOptions } from './components/TestOptions';
import { ForwardingMessage } from './components/ForwardingMessage';
import { CompletionScreen } from './components/CompletionScreen';
import '@cgames/ui-kit/styles/TestScreen.css';
import '@cgames/ui-kit/styles/SectionScreens.css';

const TestScreen = () => {
  const navigate = useNavigate();
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const { t, i18n } = useTranslation('common');
  
  
  // Get translated questions - this will update when language changes
  const questions = getTranslatedQuestions();
  
  // Safety check - ensure we have questions loaded
  if (!questions || questions.length === 0) {
    console.warn('Questions not loaded yet, showing loading state');
    return (
      <div className="dialog-game-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }
  
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
    handlePrevious
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

  // Force re-render when language changes to update questions
  useEffect(() => {
    // This effect will run when i18n.language changes
    console.log('Language changed to:', i18n.language);
    console.log('Questions after language change:', questions.length, 'questions loaded');
    console.log('Current question:', currentQuestion?.id, currentQuestion?.text?.substring(0, 50) + '...');
  }, [i18n.language, questions, currentQuestion]);

  // Section management logic - redirect to proper section screens
  useEffect(() => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    const section = getSectionByQuestionId(questionId);
    
    if (!section) {
      console.log(`[TestScreen] No section found for question ${questionId}`);
      return;
    }

    // Check if we're starting a new section
    const isFirstQuestionOfSection = questionId === section.questionRange.start;
    const isLastQuestionOfSection = questionId === section.questionRange.end;
    
    // Get stored section progress from sessionStorage
    const completedSections = JSON.parse(sessionStorage.getItem('completedSections') || '[]');
    const currentSectionKey = `section_${section.id}_onboarding`;
    const hasSeenOnboarding = completedSections.includes(currentSectionKey);

    console.log(`[TestScreen] Question ${questionId}, Section ${section.id}, First: ${isFirstQuestionOfSection}, Last: ${isLastQuestionOfSection}, HasOnboarding: ${hasSeenOnboarding}, HasAnswer: ${!!testState.answers[questionId]}`);

    // Redirect to section onboarding for first question if not seen before
    if (isFirstQuestionOfSection && !hasSeenOnboarding) {
      console.log(`[TestScreen] Redirecting to onboarding for section ${section.id}`);
      navigate(`/candidate/test/section/${section.id}/onboarding`);
      return;
    }

    // Check if we just completed a section (after answering the last question)
    if (isLastQuestionOfSection && testState.answers[questionId]) {
      const sectionEndKey = `section_${section.id}_end`;
      const hasSeenSectionEnd = completedSections.includes(sectionEndKey);
      
      if (!hasSeenSectionEnd) {
        console.log(`[TestScreen] Redirecting to end screen for section ${section.id}`);
        // Store test answers in session storage for the section ending screen
        sessionStorage.setItem('testAnswers', JSON.stringify(testState.answers));
        navigate(`/candidate/test/section/${section.id}/ending`);
        return;
      }
    }
  }, [currentQuestion, testState.answers, navigate]);



  // If test is complete, show completion screen
  if (testState.isComplete) {
    // Prepare test results for submission
    const testResults = {
      answers: testState.answers,
      timeSpent: testState.timeSpent || null,
      totalQuestions: questions.length,
      completedQuestions: Object.keys(testState.answers).length,
      gameMetadata: {
        questionIds: questions.map(q => q.id),
        language: i18n.language,
        startTime: testState.startTime,
        endTime: new Date().toISOString()
      }
    };

    return (
      <CompletionScreen
        videoRef={videoRef}
        videoLoaded={videoLoaded}
        videoError={videoError}
        handleVideoLoad={handleVideoLoad}
        handleVideoError={handleVideoError}
        handleVideoClick={handleVideoClick}
        testResults={testResults}
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
            selectedOption={testState.answers[currentQuestion.id]}
          />
        )}
      </div>
      
      <div className="game-footer">
        <p className="footer-text">{t('app.copyright')}</p>
      </div>
    </div>
  );
};

export default TestScreen; 