import { useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[testState.currentQuestion];

  const handleAnswer = (value: string) => {
    setTestState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: value }
    }));
    setShowForwardingLine(true);
  };

  const handleNext = () => {
    if (!testState.answers[currentQuestion.id]) {
      setError('Lütfen bir cevap seçin.');
      return;
    }
    
    if (testState.currentQuestion === questions.length - 1) {
      sessionStorage.setItem('answers', JSON.stringify(testState.answers));
      navigate('/results');
    } else {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
      setShowForwardingLine(false);
      setError(null);
    }
  };
  
  const handlePrevious = () => {
    if (testState.currentQuestion > 0) {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
      
      // Show forwarding line if there's already an answer for the previous question
      const prevQuestion = questions[testState.currentQuestion - 1];
      setShowForwardingLine(!!testState.answers[prevQuestion.id]);
      setError(null);
    }
  };

  const progress = ((testState.currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container">
      <div className="test-screen">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <h2 className="question-counter">Soru {testState.currentQuestion + 1} / {questions.length}</h2>
        
        <div className="question-box">
          <h3 className="question-title">{questionTitles[testState.currentQuestion]}</h3>
          <p className="question-text">Sahne: {currentQuestion.text}</p>
          
          <div className="radio-group">
            {currentQuestion.options.map(option => (
              <div 
                className="radio-option" 
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
                />
                <label htmlFor={option.id}>{option.text}</label>
              </div>
            ))}
          </div>

          {showForwardingLine && (
            <div className="forwarding-line">
              <p>{currentQuestion.forwardingLine}</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button
              className="prev-button"
              onClick={handlePrevious}
              disabled={testState.currentQuestion === 0}
            >
              Geri
            </button>
            <button
              className="next-button"
              onClick={handleNext}
              disabled={!testState.answers[currentQuestion.id]}
            >
              {testState.currentQuestion === questions.length - 1 ? 'Bitir' : 'İlerle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen; 