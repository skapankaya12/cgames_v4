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

    // Show section onboarding for first question if not seen before
    if (isFirstQuestionOfSection && !hasSeenOnboarding) {
      console.log(`[TestScreen] Showing onboarding for section ${section.id}`);
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
        console.log(`[TestScreen] Showing end screen for section ${section.id}`);
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

      console.log(`[TestScreen] Completed onboarding for section ${currentSection.id}, navigating to question ${currentSection.questionRange.start}`);
    }
    
    setShowSectionOnboarding(false);
    setCurrentSection(null);
  };

  // Handle section end continue
  const handleSectionEndContinue = async () => {
    if (currentSection) {
      const completedSections = JSON.parse(sessionStorage.getItem('completedSections') || '[]');
      const sectionEndKey = `section_${currentSection.id}_end`;
      
      if (!completedSections.includes(sectionEndKey)) {
        completedSections.push(sectionEndKey);
        sessionStorage.setItem('completedSections', JSON.stringify(completedSections));
      }

      console.log(`[TestScreen] Completed section ${currentSection.id} end screen`);

      // If this was the last section, submit results and navigate to simple thank you page
      if (currentSection.id === 4) {
        console.log(`[TestScreen] Last section completed, submitting results...`);
        
        try {
          // Get invite data from session storage (same as GameFlowContext)
          const inviteDataStr = sessionStorage.getItem('currentInvite');
          if (!inviteDataStr) {
            console.error('❌ [TestScreen] No invite data found in session storage with key "currentInvite"');
            throw new Error('Missing invite data');
          }
          
          const inviteData = JSON.parse(inviteDataStr);
          const candidateEmail = inviteData.candidateEmail;
          
          if (!candidateEmail) {
            console.error('❌ [TestScreen] No candidate email found in invite data');
            throw new Error('Missing candidate email');
          }
          
          // Prepare submission data in same format as working assessments
          const submissionData = {
            token: inviteData.token,
            candidateEmail: candidateEmail,
            candidateInfo: {
              email: candidateEmail,
              // Add other candidate info if available
            },
            assessmentType: 'space-mission',
            assessmentName: 'Space Mission Leadership Assessment',
            answers: testState.answers,
            completionTime: testState.timeSpent || null,
            completedAt: new Date().toISOString(),
            totalQuestions: questions.length,
            completedQuestions: Object.keys(testState.answers).length,
            gameMetadata: {
              questionIds: questions.map(q => q.id),
              language: i18n.language,
              startTime: testState.startTime,
              endTime: new Date().toISOString()
            }
          };

          console.log('📊 [TestScreen] Submitting space mission results...');
          console.log('  - Token:', submissionData.token ? 'VALID' : 'INVALID');
          console.log('  - CandidateEmail:', submissionData.candidateEmail || 'MISSING');
          console.log('  - Assessment Type:', submissionData.assessmentType);
          console.log('  - Answers count:', Object.keys(submissionData.answers).length);
          
          // Submit directly to API (same as working assessments)
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.olivinhr.com';
          const response = await fetch(`${apiBaseUrl}/api/candidate/submitResult`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          const responseData = await response.json();
          console.log('✅ [TestScreen] Space mission results submitted successfully!', responseData);
          
        } catch (error) {
          console.error('❌ [TestScreen] Failed to submit space mission results:', error);
          // Continue to thank you page even if submission fails
        }
        
        setShowSectionEnd(false);
        setCurrentSection(null);
        // Navigate to simple thank you page
        navigate('/candidate/simple-thank-you');
        return;
      }

      // For sections 1-3, navigate to the first question of the next section
      // This will trigger the onboarding for the next section automatically
      if (currentSection.id < 4) {
        const nextQuestionId = currentSection.questionRange.end + 1;
        console.log(`[TestScreen] Navigating from section ${currentSection.id} to next question ${nextQuestionId}`);
        
        setShowSectionEnd(false);
        setCurrentSection(null);
        
        // Ensure the next question ID is valid
        if (nextQuestionId <= questions.length) {
          navigate(`/candidate/test/${nextQuestionId}`);
        } else {
          // If we've exceeded the questions, navigate to ending
          console.log(`[TestScreen] Next question ${nextQuestionId} exceeds total questions ${questions.length}, navigating to ending`);
          navigate('/candidate/ending');
        }
        return;
      }
    }
    
    setShowSectionEnd(false);
    setCurrentSection(null);
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