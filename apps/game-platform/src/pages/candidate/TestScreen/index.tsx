import { useEffect, useRef, useState } from 'react';
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
import { SectionOnboarding } from './components/SectionOnboarding';
import { SectionEndText } from './components/SectionEndText';
import '@cgames/ui-kit/styles/TestScreen.css';
import '@cgames/ui-kit/styles/SectionScreens.css';

const TestScreen = () => {
  const navigate = useNavigate();
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const { t, i18n } = useTranslation('common');
  
  // Section flow states
  const [showSectionOnboarding, setShowSectionOnboarding] = useState(false);
  const [showSectionEnd, setShowSectionEnd] = useState(false);
  const [currentSection, setCurrentSection] = useState<any>(null);
  
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

  // Section management logic
  useEffect(() => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    const section = getSectionByQuestionId(questionId);
    
    if (!section) return;

    // Check if we're starting a new section
    const isFirstQuestionOfSection = questionId === section.questionRange.start;
    const isLastQuestionOfSection = questionId === section.questionRange.end;
    
    // Get stored section progress from sessionStorage
    const completedSections = JSON.parse(sessionStorage.getItem('completedSections') || '[]');
    const currentSectionKey = `section_${section.id}_onboarding`;
    const hasSeenOnboarding = completedSections.includes(currentSectionKey);

    // Check if we're coming from a direct navigation (skip onboarding in this case)
    const skipOnboarding = sessionStorage.getItem('skipNextOnboarding') === 'true';
    if (skipOnboarding) {
      sessionStorage.removeItem('skipNextOnboarding');
      setShowSectionOnboarding(false);
      setShowSectionEnd(false);
      setCurrentSection(null);
      return;
    }

    // Show section onboarding for first question if not seen before and only for section 1
    // For other sections, only show if we naturally progressed there (not from direct navigation)
    if (isFirstQuestionOfSection && !hasSeenOnboarding && section.id === 1) {
      setCurrentSection(section);
      setShowSectionOnboarding(true);
      setShowSectionEnd(false);
      return;
    }

    // Check if we just completed a section (after answering the last question)
    if (isLastQuestionOfSection && testState.answers[questionId]) {
      const sectionEndKey = `section_${section.id}_end`;
      const hasSeenSectionEnd = completedSections.includes(sectionEndKey);
      
      if (!hasSeenSectionEnd) {
        setCurrentSection(section);
        setShowSectionEnd(true);
        setShowSectionOnboarding(false);
        return;
      }
    }

    // Normal test flow
    setShowSectionOnboarding(false);
    setShowSectionEnd(false);
    setCurrentSection(null);
  }, [currentQuestion, testState.answers]);

  // Handle section onboarding continue
  const handleSectionOnboardingContinue = () => {
    if (currentSection) {
      const completedSections = JSON.parse(sessionStorage.getItem('completedSections') || '[]');
      const currentSectionKey = `section_${currentSection.id}_onboarding`;
      
      if (!completedSections.includes(currentSectionKey)) {
        completedSections.push(currentSectionKey);
        sessionStorage.setItem('completedSections', JSON.stringify(completedSections));
      }
    }
    
    setShowSectionOnboarding(false);
    setCurrentSection(null);
  };

  // Handle section end continue
  const handleSectionEndContinue = () => {
    if (currentSection) {
      const completedSections = JSON.parse(sessionStorage.getItem('completedSections') || '[]');
      const sectionEndKey = `section_${currentSection.id}_end`;
      
      if (!completedSections.includes(sectionEndKey)) {
        completedSections.push(sectionEndKey);
        sessionStorage.setItem('completedSections', JSON.stringify(completedSections));
      }

      // If this was the last section, go to completion
      if (currentSection.id === 4) {
        // The test should be complete, let the normal flow handle it
        setShowSectionEnd(false);
        setCurrentSection(null);
        return;
      }
    }
    
    setShowSectionEnd(false);
    setCurrentSection(null);

    // For sections 1-3, navigate to the next question after a short delay
    if (currentSection && currentSection.id < 4) {
      const nextQuestionId = currentSection.questionRange.end + 1;
      // Set flag to skip onboarding for the next section
      sessionStorage.setItem('skipNextOnboarding', 'true');
      setTimeout(() => {
        navigate(`/candidate/test/${nextQuestionId}`);
      }, 100);
    }
  };

  // Show section onboarding if needed
  if (showSectionOnboarding && currentSection) {
    return (
      <SectionOnboarding
        section={currentSection}
        onContinue={handleSectionOnboardingContinue}
      />
    );
  }

  // Show section end text if needed
  if (showSectionEnd && currentSection) {
    return (
      <SectionEndText
        section={currentSection}
        onContinue={handleSectionEndContinue}
        isLastSection={currentSection.id === 4}
      />
    );
  }

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