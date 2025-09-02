import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { teamQuestions, calculateTeamScores } from '../../../data/team';
import { LikertSlider } from '../../../components/LikertSlider';
import './TeamTestScreen.css';

const TeamTestScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const { t } = useTranslation('common');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = teamQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / teamQuestions.length) * 100;

  useEffect(() => {
    // Check if user has completed identity screen
    const identityData = sessionStorage.getItem('team-candidate-data');
    if (!identityData) {
      navigate('/candidate/team');
      return;
    }

    // Load saved answers if any
    const savedAnswers = sessionStorage.getItem('team-answers');
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        setAnswers(parsed);
      } catch (error) {
        console.warn('Failed to parse saved answers:', error);
      }
    }
  }, [navigate]);

  const handleAnswer = (value: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value.toString()
    };
    
    setAnswers(newAnswers);
    
    // Save answers to session storage
    sessionStorage.setItem('team-answers', JSON.stringify(newAnswers));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < teamQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmitAssessment(newAnswers);
      }
    }, 1000); // Slightly longer delay for slider
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    
    try {
      const identityData = JSON.parse(sessionStorage.getItem('team-candidate-data') || '{}');
      let token = searchParams.get('token');
      
      // Fallback: get token from sessionStorage if not in URL
      if (!token) {
        token = sessionStorage.getItem('takim-degerlendirme-token');
        console.log('🔍 [TeamTest] Token not in URL, using sessionStorage:', token ? `${token.substring(0, 8)}...` : 'NULL/MISSING');
      }
      const completionTime = Date.now() - startTime;
      
      // Calculate scores
      const scores = calculateTeamScores(finalAnswers);
      
      // Prepare submission data
      const submissionData = {
        token,
        candidateEmail: identityData.email, // Add explicit candidateEmail for API compatibility
        candidateInfo: identityData,
        assessmentType: 'takim-degerlendirme',
        assessmentName: 'Takım Değerlendirme Anketi',
        answers: finalAnswers,
        scores,
        completionTime,
        completedAt: new Date().toISOString(),
        totalQuestions: teamQuestions.length,
        completedQuestions: Object.keys(finalAnswers).length
      };

      console.log('📊 [TeamTest] Submitting assessment data:', {
        token: token?.substring(0, 8) + '...',
        candidateEmail: identityData.email,
        assessmentType: 'takim-degerlendirme',
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
        console.error('❌ [TeamTest] API Error:', response.status, errorData);
        throw new Error(`API Error ${response.status}: ${errorData.error || 'Failed to submit assessment'}`);
      }

      const result = await response.json();
      console.log('✅ [TeamTest] Assessment submitted successfully:', result);

      // Clear session storage
      sessionStorage.removeItem('team-candidate-data');
      sessionStorage.removeItem('team-answers');
      
      // Navigate to results or thank you page
      // Navigate to thank you page (not results - results go to HR dashboard)
      navigate('/thank-you');
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Değerlendirme gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="team-test-screen">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="team-test-screen">
        <div className="submitting-screen">
          <div className="loading-spinner"></div>
          <h2>Değerlendirmeniz Gönderiliyor...</h2>
          <p>Lütfen bekleyin, sonuçlarınız hazırlanıyor.</p>
        </div>
      </div>
    );
  }

  // Removed currentDimension logic as we now display dimension directly from question

  return (
    <div className="team-test-screen">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="question-container">
        <div className="question-header">
          <div className="question-counter">
            {currentQuestionIndex + 1} / {teamQuestions.length}
          </div>
          <div className="dimension-badge">
            {currentQuestion.dimension}
          </div>
          <div className="sub-dimension-badge">
            {currentQuestion.sub_dimension}
          </div>
        </div>
        
        <div className="question-content">
          <h2 className="question-text">{currentQuestion.question_text}</h2>
          
          <div className="slider-container">
            <LikertSlider
              value={answers[currentQuestion.id] ? parseInt(answers[currentQuestion.id]) : undefined}
              onChange={handleAnswer}
              disabled={isSubmitting}
              leftLabel="Kesinlikle Katılmıyorum (1)"
              rightLabel="Kesinlikle Katılıyorum (10)"
              showValue={true}
            />
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
              {currentQuestionIndex < teamQuestions.length - 1 
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

export default TeamTestScreen;
