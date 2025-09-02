import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { engagementQuestions, calculateEngagementScores, likertOptions } from '../../../data/engagement';
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
    // Check if user has completed identity screen (try both keys)
    let identityData = sessionStorage.getItem('engagement-candidate-data');
    if (!identityData) {
      identityData = sessionStorage.getItem('calisan-bagliligi-candidate-data');
    }
    
    if (!identityData) {
      console.warn('🔍 [EngagementTest] No identity data found, redirecting to identity screen');
      navigate('/candidate/engagement');
      return;
    }

    console.log('✅ [EngagementTest] Identity data found, proceeding with test');

    // Load saved answers if any
    const savedAnswers = sessionStorage.getItem('engagement-answers');
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        setAnswers(parsed);
        console.log('📝 [EngagementTest] Loaded saved answers:', Object.keys(parsed).length);
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
      // Get data with detailed validation (try both keys)
      let identityDataRaw = sessionStorage.getItem('engagement-candidate-data');
      if (!identityDataRaw) {
        identityDataRaw = sessionStorage.getItem('calisan-bagliligi-candidate-data');
      }
      let token = searchParams.get('token');
      
      // Fallback: get token from sessionStorage if not in URL
      if (!token) {
        token = sessionStorage.getItem('calisan-bagliligi-token');
        console.log('🔍 [EngagementTest] Token not in URL, using sessionStorage:', token ? `${token.substring(0, 8)}...` : 'NULL/MISSING');
      }
      
      console.log('🔍 [EngagementTest] Raw data validation:');
      console.log('  - Token from URL:', searchParams.get('token') ? `${searchParams.get('token')!.substring(0, 8)}...` : 'NULL/MISSING');
      console.log('  - Token from sessionStorage:', token ? `${token.substring(0, 8)}...` : 'NULL/MISSING');
      console.log('  - Identity data raw:', identityDataRaw ? 'EXISTS' : 'NULL/MISSING');
      console.log('  - Final answers count:', Object.keys(finalAnswers).length);
      
      // Validate token
      if (!token) {
        throw new Error('Missing token parameter in URL');
      }
      
      // Validate and parse identity data
      if (!identityDataRaw) {
        throw new Error('Missing candidate identity data. Please go back and fill out your information.');
      }
      
      let identityData;
      try {
        identityData = JSON.parse(identityDataRaw);
      } catch (parseError) {
        console.error('Failed to parse identity data:', parseError);
        throw new Error('Invalid candidate data format. Please refresh and try again.');
      }
      
      console.log('  - Parsed identity data:', {
        hasFirstName: !!identityData.firstName,
        hasLastName: !!identityData.lastName,
        hasEmail: !!identityData.email,
        email: identityData.email || 'MISSING',
        hasDepartment: !!identityData.department,
        hasPosition: !!identityData.position
      });
      
      // Validate email
      if (!identityData.email) {
        throw new Error('Missing email in candidate data. Please go back and enter your email.');
      }
      
      // Validate answers
      if (Object.keys(finalAnswers).length === 0) {
        throw new Error('No answers provided. Please answer at least one question.');
      }
      
      const completionTime = Date.now() - startTime;
      
      // Calculate scores
      const scores = calculateEngagementScores(finalAnswers);
      
      // Prepare submission data with explicit validation
      const submissionData = {
        token,
        candidateEmail: identityData.email,
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

      console.log('📊 [EngagementTest] Final submission data validation:');
      console.log('  - Token:', submissionData.token ? 'VALID' : 'INVALID');
      console.log('  - CandidateEmail:', submissionData.candidateEmail || 'MISSING');
      console.log('  - CandidateInfo.email:', submissionData.candidateInfo?.email || 'MISSING');
      console.log('  - Answers count:', Object.keys(submissionData.answers).length);
      console.log('  - Scores count:', Object.keys(submissionData.scores).length);

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
            {currentQuestion.dimension}
          </div>
          <div className="sub-dimension-badge">
            {currentQuestion.sub_dimension}
          </div>
        </div>
        
        <div className="question-content">
          <h2 className="question-text">{currentQuestion.question_text}</h2>
          
          <div className="options-container">
            {likertOptions.map((option) => (
              <button
                key={option.id}
                className={`option-button ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}
                onClick={() => handleAnswer(option.id)}
                disabled={isSubmitting}
              >
                <span className="option-text">{option.text}</span>
                <span className="option-value">({option.value})</span>
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
