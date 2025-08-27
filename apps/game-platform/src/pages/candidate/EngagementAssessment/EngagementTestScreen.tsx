import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { engagementQuestions, engagementDimensions, calculateEngagementScores } from '../../../data/engagement';
import './EngagementTestScreen.css';

const EngagementTestScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const { t } = useTranslation('common');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = engagementQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / engagementQuestions.length) * 100;

  useEffect(() => {
    // Check if user has completed identity screen
    const identityData = sessionStorage.getItem('engagement-candidate-data');
    if (!identityData) {
      navigate('/candidate/engagement');
      return;
    }

    // Load saved answers if any
    const savedAnswers = sessionStorage.getItem('engagement-answers');
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        setAnswers(parsed);
      } catch (error) {
        console.warn('Failed to parse saved answers:', error);
      }
    }
  }, [navigate]);

  const handleAnswer = (optionId: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: optionId
    };
    
    setAnswers(newAnswers);
    
    // Save answers to session storage
    sessionStorage.setItem('engagement-answers', JSON.stringify(newAnswers));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < engagementQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmitAssessment(newAnswers);
      }
    }, 500);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    
    try {
      const identityData = JSON.parse(sessionStorage.getItem('engagement-candidate-data') || '{}');
      const token = searchParams.get('token');
      const completionTime = Date.now() - startTime;
      
      // Calculate scores
      const scores = calculateEngagementScores(finalAnswers);
      
      // Prepare submission data
      const submissionData = {
        token,
        candidateEmail: identityData.email, // Add explicit candidateEmail for API compatibility
        candidateInfo: identityData,
        assessmentType: 'calisan-bagliligi',
        assessmentName: 'Çalışan Bağlılığı Değerlendirmesi',
        answers: finalAnswers,
        scores,
        completionTime,
        completedAt: new Date().toISOString(),
        totalQuestions: engagementQuestions.length,
        completedQuestions: Object.keys(finalAnswers).length
      };

      console.log('📊 [EngagementTest] Submitting assessment data:', {
        token: token?.substring(0, 8) + '...',
        candidateEmail: identityData.email,
        assessmentType: 'calisan-bagliligi',
        hasAnswers: Object.keys(finalAnswers).length > 0,
        hasScores: Object.keys(scores).length > 0
      });

      // Submit to API
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const response = await fetch(`${apiBaseUrl}/api/candidate/submitResult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ [EngagementTest] API Error:', response.status, errorData);
        throw new Error(`API Error ${response.status}: ${errorData.error || 'Failed to submit assessment'}`);
      }

      const result = await response.json();
      console.log('✅ [EngagementTest] Assessment submitted successfully:', result);

      // Clear session storage
      sessionStorage.removeItem('engagement-candidate-data');
      sessionStorage.removeItem('engagement-answers');
      
      // Navigate to results or thank you page
      navigate('/candidate/engagement/results', { 
        state: { 
          scores,
          submissionData 
        }
      });
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Değerlendirme gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="engagement-test-screen">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="engagement-test-screen">
        <div className="submitting-screen">
          <div className="loading-spinner"></div>
          <h2>Değerlendirmeniz Gönderiliyor...</h2>
          <p>Lütfen bekleyin, sonuçlarınız hazırlanıyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="engagement-test-screen">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="question-container">
        <div className="question-header">
          <div className="question-counter">
            {currentQuestionIndex + 1} / {engagementQuestions.length}
          </div>
          <div className="dimension-badge">
            {engagementDimensions.find(d => d.id === currentQuestion.dimension)?.name}
          </div>
        </div>
        
        <div className="question-content">
          <h2 className="question-text">{currentQuestion.text}</h2>
          
          <div className="options-container">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`option-button ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}
                onClick={() => handleAnswer(option.id)}
                disabled={isSubmitting}
              >
                <span className="option-text">{option.text}</span>
                <span className="option-indicator"></span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="navigation-buttons">
          {currentQuestionIndex > 0 && (
            <button 
              className="nav-button prev-button" 
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              ← Önceki
            </button>
          )}
          
          <div className="nav-spacer"></div>
          
          {answers[currentQuestion.id] && (
            <div className="next-indicator">
              {currentQuestionIndex < engagementQuestions.length - 1 
                ? 'Sonraki soru otomatik yüklenecek...' 
                : 'Değerlendirme tamamlanıyor...'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngagementTestScreen;
