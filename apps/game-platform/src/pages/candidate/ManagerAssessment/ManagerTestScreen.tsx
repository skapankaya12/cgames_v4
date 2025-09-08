import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { managerQuestions, calculateManagerScores } from '../../../data/manager';
import { LikertSlider } from '../../../components/LikertSlider';
import './ManagerTestScreen.css';

const ManagerTestScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const { t } = useTranslation('common');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = managerQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / managerQuestions.length) * 100;

  useEffect(() => {
    // Check if user has completed identity screen
    const identityData = sessionStorage.getItem('manager-candidate-data');
    if (!identityData) {
      navigate('/candidate/manager');
      return;
    }

    // Load saved answers if any
    const savedAnswers = sessionStorage.getItem('manager-answers');
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
    sessionStorage.setItem('manager-answers', JSON.stringify(newAnswers));
    
    // Don't auto-advance - let user use navigation buttons
  };

  const handleNext = () => {
    if (currentQuestionIndex < managerQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit assessment if on last question
      handleSubmitAssessment(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    
    try {
      const identityData = JSON.parse(sessionStorage.getItem('manager-candidate-data') || '{}');
      let token = searchParams.get('token');
      
      // Fallback: get token from sessionStorage if not in URL
      if (!token) {
        token = sessionStorage.getItem('yonetici-degerlendirme-token');
        console.log('🔍 [ManagerTest] Token not in URL, using sessionStorage:', token ? `${token.substring(0, 8)}...` : 'NULL/MISSING');
      }

      // Get candidate email from invite data (since we removed email from form)
      let candidateEmail = identityData.email;
      if (!candidateEmail) {
        // Try to get email from invite validation
        const currentInvite = sessionStorage.getItem('currentInvite');
        if (currentInvite) {
          const inviteData = JSON.parse(currentInvite);
          candidateEmail = inviteData.candidateEmail;
          console.log('📧 [ManagerTest] Using email from invite data:', candidateEmail);
        }
      }

      const completionTime = Date.now() - startTime;
      
      // Calculate scores
      const scores = calculateManagerScores(finalAnswers);
      
      // Prepare submission data
      const submissionData = {
        token,
        candidateEmail: candidateEmail, // Use email from invite data
        candidateInfo: {
          ...identityData,
          email: candidateEmail // Ensure email is included in candidateInfo
        },
        assessmentType: 'yonetici-degerlendirme',
        assessmentName: 'Yönetici Değerlendirme Anketi',
        answers: finalAnswers,
        scores,
        completionTime,
        completedAt: new Date().toISOString(),
        totalQuestions: managerQuestions.length,
        completedQuestions: Object.keys(finalAnswers).length
      };

      console.log('📊 [ManagerTest] Submitting assessment data:', {
        token: token?.substring(0, 8) + '...',
        candidateEmail: candidateEmail,
        assessmentType: 'yonetici-degerlendirme',
        hasAnswers: Object.keys(finalAnswers).length > 0,
        hasScores: Object.keys(scores).length > 0
      });

      // Submit to API (default to production API domain if env not provided)
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
        console.error('❌ [ManagerTest] API Error:', response.status, errorData);
        throw new Error(`API Error ${response.status}: ${errorData.error || 'Failed to submit assessment'}`);
      }

      const result = await response.json();
      console.log('✅ [ManagerTest] Assessment submitted successfully:', result);

      // Clear session storage
      sessionStorage.removeItem('manager-candidate-data');
      sessionStorage.removeItem('manager-answers');
      
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
      <div className="manager-test-screen">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="manager-test-screen">
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
    <div className="manager-test-screen">
      
      <div className="question-container">
        {/* Progress Bar - 3cm above questions */}
        <div style={{ 
          marginBottom: '3cm',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto 3cm auto'
        }}>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#6B8E23',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div className="question-header" style={{ justifyContent: 'center' }}>
          {/* Removed question counter and dimension badges */}
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
              ← Geri
            </button>
          )}
          
          <div className="nav-spacer"></div>
          
          {answers[currentQuestion.id] && (
            <button 
              className="nav-button next-button" 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentQuestionIndex < managerQuestions.length - 1 
                ? 'İleri →' 
                : 'Tamamla ✓'
              }
            </button>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        borderTop: '1px solid #e5e7eb',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6b7280',
        zIndex: 999
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          All rights reserved. OlivinHR 2025.
        </p>
                  <p style={{ margin: '0' }}>
            Need help? Contact our support team at <strong>info@olivinhr.com</strong>
          </p>
      </div>
    </div>
  );
};

export default ManagerTestScreen;
