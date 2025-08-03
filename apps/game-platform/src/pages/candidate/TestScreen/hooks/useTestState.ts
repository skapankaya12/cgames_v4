import { useState, useEffect, useRef } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type InteractionTracker from '@cgames/services/InteractionTracker';
import type { TestState } from '@cgames/types';
import { getQuestionTitles } from '../../../../utils/questionsUtils';



export function useTestState(
  questions: any[],
  questionNumber: string | undefined,
  navigate: NavigateFunction,
  trackerRef: React.MutableRefObject<InteractionTracker | null>
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize current question from URL parameter or default to 0
  const getInitialQuestion = () => {
    if (questionNumber) {
      const qNum = parseInt(questionNumber, 10) - 1; // Convert to 0-based index
      if (qNum >= 0 && qNum < questions.length) {
        return qNum;
      }
    }
    return 0;
  };

  const [testState, setTestState] = useState<TestState>(() => {
    // Load answers from sessionStorage if available
    const savedAnswers = sessionStorage.getItem('answers');
    return {
      currentQuestion: getInitialQuestion(),
      answers: savedAnswers ? JSON.parse(savedAnswers) : {},
      isComplete: false,
    };
  });

  const [showForwardingLine, setShowForwardingLine] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrationText, setNarrationText] = useState('');

  const currentQuestion = questions[testState.currentQuestion];
  const progress = ((testState.currentQuestion + 1) / questions.length) * 100;

  // Update current question when URL parameter changes
  useEffect(() => {
    const newQuestion = getInitialQuestion();
    if (newQuestion !== testState.currentQuestion) {
      setTestState(prev => ({
        ...prev,
        currentQuestion: newQuestion
      }));
    }
  }, [questionNumber]);

  // Save answers to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('answers', JSON.stringify(testState.answers));
  }, [testState.answers]);

  // Update URL when current question changes
  useEffect(() => {
    const currentQuestionNumber = testState.currentQuestion + 1;
    const urlQuestionNumber = questionNumber ? parseInt(questionNumber, 10) : 1;
    
    if (currentQuestionNumber !== urlQuestionNumber) {
      navigate(`/candidate/test/${currentQuestionNumber}`, { replace: true });
    }
  }, [testState.currentQuestion, questionNumber, navigate]);

  // Track question start when question changes
  useEffect(() => {
    if (currentQuestion && trackerRef.current) {
      trackerRef.current.trackQuestionStart(currentQuestion.id);
    }
  }, [testState.currentQuestion, currentQuestion]);

  // Display narration text with immediate display
  useEffect(() => {
    if (currentQuestion) {
      setTimeout(() => {
        setNarrationText(currentQuestion.text);
      }, 50);
    }
  }, [testState.currentQuestion, currentQuestion]);

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Flush any remaining interaction events
      if (trackerRef.current) {
        trackerRef.current.flushEvents();
      }
    };
  }, []);

  const moveToNextQuestion = () => {
    // Track navigation event
    if (trackerRef.current && currentQuestion) {
      trackerRef.current.trackNavigation(currentQuestion.id, 'next');
    }

    if (testState.currentQuestion === questions.length - 1) {
      // Save answers to session storage
      sessionStorage.setItem('answers', JSON.stringify(testState.answers));
      
      // Save interaction analytics to session storage
      if (trackerRef.current) {
        const analytics = trackerRef.current.getSessionAnalytics();
        sessionStorage.setItem('interactionAnalytics', JSON.stringify(analytics));
        trackerRef.current.flushEvents();
      }
      
      navigate('/candidate/ending');
    } else {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
      setShowForwardingLine(false);
      setIsTransitioning(false);
    }
  };

  const handleAnswer = (value: string) => {
    if (isTransitioning) return;
    
    // Track answer change
    if (trackerRef.current && currentQuestion) {
      const previousValue = testState.answers[currentQuestion.id];
      trackerRef.current.trackAnswerChange(currentQuestion.id, previousValue, value);
    }
    
    // Update the answer
    setTestState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: value }
    }));
    
    // Show forwarding line and start transition
    setShowForwardingLine(true);
    setIsTransitioning(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Check if this is the last question
    const isLastQuestion = testState.currentQuestion === questions.length - 1;
    
    // Set timer to move to next question after 8 seconds (increased from 3 seconds)
    timerRef.current = setTimeout(() => {
      moveToNextQuestion();
    }, isLastQuestion ? 9000 : 8000); // Also increased last question timing from 4 to 9 seconds
  };

  const handlePrevious = () => {
    if (testState.currentQuestion > 0 && !isTransitioning) {
      // Track navigation event
      if (trackerRef.current && currentQuestion) {
        trackerRef.current.trackNavigation(currentQuestion.id, 'back');
      }

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
      
      // Reset forwarding line and transition state when going back
      setShowForwardingLine(false);
      setIsTransitioning(false);
      setError(null);
    }
  };

  return {
    testState,
    showForwardingLine,
    isTransitioning,
    error,
    narrationText,
    currentQuestion,
    progress,
    questionTitles: getQuestionTitles(),
    handleAnswer,
    handlePrevious,
    setError
  };
} 