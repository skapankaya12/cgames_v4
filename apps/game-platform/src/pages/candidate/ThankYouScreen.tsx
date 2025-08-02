import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useGameFlow } from '../../contexts/GameFlowContext';
import '@cgames/ui-kit/styles/EndingScreen.css';

interface ThankYouScreenProps {}

const ThankYouScreen: React.FC<ThankYouScreenProps> = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const { submitResults, isResultsSubmitted } = useGameFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const inviteData = location.state?.inviteData;
  const candidateInfo = location.state?.candidateInfo;

  useEffect(() => {
    console.log('🎉 [ThankYou] Test completed successfully for:', candidateInfo?.email || inviteData?.candidateEmail);
    
    // Submit results if not already submitted
    if (!isResultsSubmitted && !isSubmitting && !submitSuccess) {
      submitTestResults();
    }
  }, [candidateInfo, inviteData, isResultsSubmitted, isSubmitting, submitSuccess]);

  const submitTestResults = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      console.log('📊 [ThankYou] Submitting test results...');
      
      // Get answers from session storage
      const answers = JSON.parse(sessionStorage.getItem('answers') || '{}');
      const interactionAnalytics = JSON.parse(sessionStorage.getItem('interactionAnalytics') || '{}');
      const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      // Prepare comprehensive results
      const results = {
        answers: answers,
        analytics: interactionAnalytics,
        candidateInfo: candidateInfo || userData,
        completionTime: new Date().toISOString(),
        gameVersion: '1.0.0',
      };
      
      console.log('📊 [ThankYou] Results to submit:', results);
      
      await submitResults(results);
      
      setSubmitSuccess(true);
      console.log('✅ [ThankYou] Results submitted successfully!');
      
    } catch (error) {
      console.error('❌ [ThankYou] Failed to submit results:', error);
      setSubmitError(error.message || 'Failed to submit results');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ending-screen-container thank-you-screen">
      <div className="ending-content">
        <div className="success-animation">
          <div className="checkmark-container">
            <svg className="checkmark" viewBox="0 0 100 100">
              <circle className="checkmark-circle" cx="50" cy="50" r="45" />
              <path className="checkmark-check" d="M25 50L40 65L75 30" />
            </svg>
          </div>
        </div>

        <div className="completion-message">
          <h1 className="completion-title">
            {t('completion.thankYouTitle', 'Tebrikler!')}
          </h1>
          
          <p className="completion-subtitle">
            {t('completion.testCompleted', 'Değerlendirmenizi başarıyla tamamladınız.')}
          </p>

          <div className="completion-details">
            <div className="detail-item">
              <span className="detail-icon">
                {isSubmitting ? '⏳' : submitSuccess ? '✅' : submitError ? '❌' : '⏳'}
              </span>
              <span className="detail-text">
                {isSubmitting 
                  ? t('completion.submittingResults', 'Yanıtlarınız kaydediliyor...')
                  : submitSuccess 
                    ? t('completion.resultsSubmitted', 'Yanıtlarınız güvenli şekilde kaydedildi')
                    : submitError
                      ? t('completion.submitError', 'Yanıtlar kaydedilemedi - lütfen HR ile iletişime geçin')
                      : t('completion.preparingResults', 'Yanıtlarınız hazırlanıyor...')
                }
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">📊</span>
              <span className="detail-text">
                {t('completion.hrNotified', 'İK ekibi sonuçlarınızı inceleyecek')}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">🔔</span>
              <span className="detail-text">
                {t('completion.followUp', 'Sonuçlar hakkında size geri dönüş yapılacak')}
              </span>
            </div>
          </div>

          {candidateInfo?.firstName && (
            <div className="personal-message">
              <p>
                {t('completion.personalMessage', 
                  `Değerli ${candidateInfo.firstName}, zamanınızı ayırdığınız için teşekkür ederiz.`
                )}
              </p>
            </div>
          )}

          <div className="next-steps">
            <h3>{t('completion.nextStepsTitle', 'Sonraki Adımlar')}</h3>
            <ul>
              <li>{t('completion.step1', 'Sonuçlarınız analiz edilecek')}</li>
              <li>{t('completion.step2', 'İK ekibi sizinle iletişim kuracak')}</li>
              <li>{t('completion.step3', 'Süreç hakkında bilgilendirileceksiniz')}</li>
            </ul>
          </div>

          <div className="closing-message">
            <p className="farewell">
              {t('completion.farewell', 'Bu pencereyi güvenle kapatabilirsiniz.')}
            </p>
            <p className="support">
              {t('completion.support', 'Sorularınız için: support@olivinhr.com')}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .thank-you-screen {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .ending-content {
          max-width: 600px;
          padding: 2rem;
        }

        .success-animation {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .checkmark-container {
          width: 100px;
          height: 100px;
        }

        .checkmark {
          width: 100%;
          height: 100%;
          animation: checkmark-appear 0.8s ease-in-out;
        }

        .checkmark-circle {
          stroke: #10B981;
          stroke-width: 3;
          fill: none;
          animation: checkmark-circle 0.6s ease-in-out;
        }

        .checkmark-check {
          stroke: #10B981;
          stroke-width: 4;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: checkmark-check 0.4s ease-in-out 0.6s both;
        }

        .completion-message {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .completion-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 1rem 0;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .completion-subtitle {
          font-size: 1.25rem;
          color: #4a5568;
          margin: 0 0 2rem 0;
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }

        .completion-details {
          margin: 2rem 0;
          animation: fadeInUp 0.6s ease-out 0.6s both;
        }

        .detail-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin: 1rem 0;
          text-align: left;
        }

        .detail-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
          min-width: 2rem;
        }

        .detail-text {
          font-size: 1.1rem;
          color: #2d3748;
        }

        .personal-message {
          background: linear-gradient(135deg, #667eea20, #764ba220);
          padding: 1.5rem;
          border-radius: 12px;
          margin: 2rem 0;
          animation: fadeInUp 0.6s ease-out 0.8s both;
        }

        .personal-message p {
          margin: 0;
          font-size: 1.1rem;
          color: #2d3748;
          font-weight: 500;
        }

        .next-steps {
          text-align: left;
          margin: 2rem 0;
          animation: fadeInUp 0.6s ease-out 1s both;
        }

        .next-steps h3 {
          color: #2d3748;
          margin-bottom: 1rem;
          text-align: center;
        }

        .next-steps ul {
          list-style: none;
          padding: 0;
        }

        .next-steps li {
          padding: 0.5rem 0;
          position: relative;
          padding-left: 2rem;
          color: #4a5568;
        }

        .next-steps li:before {
          content: "👉";
          position: absolute;
          left: 0;
        }

        .closing-message {
          margin-top: 2rem;
          animation: fadeInUp 0.6s ease-out 1.2s both;
        }

        .farewell {
          font-size: 1.1rem;
          color: #2d3748;
          margin: 1rem 0;
        }

        .support {
          font-size: 0.9rem;
          color: #718096;
          margin: 0.5rem 0 0 0;
        }

        @keyframes checkmark-appear {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes checkmark-circle {
          0% {
            stroke-dasharray: 0, 300;
          }
          100% {
            stroke-dasharray: 300, 300;
          }
        }

        @keyframes checkmark-check {
          0% {
            stroke-dasharray: 0, 50;
          }
          100% {
            stroke-dasharray: 50, 50;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .ending-content {
            padding: 1rem;
          }
          
          .completion-message {
            padding: 1.5rem;
          }
          
          .completion-title {
            font-size: 2rem;
          }
          
          .completion-subtitle {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ThankYouScreen; 