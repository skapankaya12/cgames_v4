import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import '../styles/TestScreen.css';

interface TestState {
  currentQuestion: number;
  answers: { [key: number]: string };
  isComplete: boolean;
}

// Array of question titles
const questionTitles = [
  "Yük Sorumlusu ile İlk Karşılaşma",
  "Çıkış Koridoru",
  "Rakip Firma Teklifi",
  "Devriye Gemisi Engeli",
  "Navigasyon Kararı",
  "Meteor Tehdidi",
  "Kimlik Doğrulama",
  "Korsan Saldırısı",
  "Terminal İlk İletişim",
  "Gecikme Alarmı",
  "Kargo Sarsıntısı",
  "Teslimat Alanı Boş",
  "Motor Alarmı",
  "Kargo İncelemesi",
  "Navigasyon Kaybı",
  "Alıcı Bilgisi Eksik"
];

const TestScreen = () => {
  const navigate = useNavigate();
  const [testState, setTestState] = useState<TestState>({
    currentQuestion: 0,
    answers: {},
    isComplete: false,
  });
  const [showForwardingLine, setShowForwardingLine] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[testState.currentQuestion];

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const moveToNextQuestion = () => {
    if (testState.currentQuestion === questions.length - 1) {
      // Set completed state before navigating
      setTestState(prev => ({
        ...prev,
        isComplete: true
      }));
      
      // Save answers to session storage
      sessionStorage.setItem('answers', JSON.stringify(testState.answers));
      
      // Add a small delay to allow the user to see the completion message
      setTimeout(() => {
        navigate('/results');
      }, 1000);
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
    if (isTransitioning) return; // Prevent multiple selections during transition
    
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
    
    // Set timer to move to next question after 3 seconds
    timerRef.current = setTimeout(() => {
      moveToNextQuestion();
    }, isLastQuestion ? 4000 : 3000); // Give more time on the last question
  };
  
  const handlePrevious = () => {
    if (testState.currentQuestion > 0 && !isTransitioning) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
      
      // Show forwarding line if there's already an answer for the previous question
      const prevQuestion = questions[testState.currentQuestion - 1];
      setShowForwardingLine(!!testState.answers[prevQuestion.id]);
      setIsTransitioning(false);
      setError(null);
    }
  };

  const progress = ((testState.currentQuestion + 1) / questions.length) * 100;

  // If test is complete, show completion message
  if (testState.isComplete) {
    return (
      <div className="container space-background">
        <div className="test-screen">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: '100%' }}></div>
          </div>
          <h2 className="question-counter">Test tamamlandı!</h2>
          
          <div className="question-box">
            <h3 className="question-title">Görev Tamamlandı</h3>
            <div className="completion-message">
              <p>Tebrikler, kaptan! Teslimat görevini tamamladınız.</p>
              <p>Sonuçlarınız yükleniyor...</p>
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-background">
      <div className="test-screen">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <h2 className="question-counter">Soru {testState.currentQuestion + 1} / {questions.length}</h2>
        
        <div className="question-box">
          <h3 className="question-title">{questionTitles[testState.currentQuestion]}</h3>
          <p className="question-text">{currentQuestion.text}</p>
          
          <div className="radio-group">
            {currentQuestion.options.map(option => (
              <div 
                className={`radio-option ${isTransitioning ? 'disabled' : ''}`} 
                key={option.id}
                onClick={() => handleAnswer(option.id)}
              >
                <input
                  type="radio"
                  id={option.id}
                  name="question-option"
                  value={option.id}
                  checked={testState.answers[currentQuestion.id] === option.id}
                  onChange={() => {}}
                  disabled={isTransitioning}
                />
                <label htmlFor={option.id}>{option.text}</label>
              </div>
            ))}
          </div>

          {showForwardingLine && (
            <div className={`forwarding-line ${isTransitioning ? 'active' : ''}`}>
              <p>{testState.currentQuestion === questions.length - 1 ? 'Yük teslim edildi. Görev tamamlandı.' : currentQuestion.forwardingLine}</p>
              {isTransitioning && <div className="transition-indicator"></div>}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button
              className="prev-button"
              onClick={handlePrevious}
              disabled={testState.currentQuestion === 0 || isTransitioning}
            >
              Geri
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen; 