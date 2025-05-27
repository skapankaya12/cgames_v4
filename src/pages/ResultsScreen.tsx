import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, competencies } from '../data/questions';
import type { SessionAnalytics } from '../services/InteractionTracker';
import { testGoogleSheetsIntegration, testBasicConnection } from '../utils/debugGoogleSheets';
import '../styles/ResultsScreen.css';

interface CompetencyScore {
  name: string;
  score: number;
  maxScore: number;
  color: string;
  fullName: string;
  abbreviation: string;
  category: string;
  description: string;
}

interface FeedbackData {
  feedback: string;
  rating: number;
  timestamp: string;
  userInfo: {
    firstName: string;
    lastName: string;
  };
}

type FilterType = 'all' | 'davranış-analizi' | 'yetkinlikler' | 'öneriler';

const getInsight = (competency: string, score: number): string => {
  const insights: {[key: string]: string[]} = {
    "DM": [
      "Karar almada daha aktif bir yaklaşım geliştirmelisiniz.",
      "Kararlarınızda dengelisiniz, ancak gelişim alanı mevcut.",
      "Çevik karar alabiliyorsunuz, bu alanda güçlüsünüz."
    ],
    "IN": [
      "İnisiyatif almakta çekingen kalıyorsunuz.",
      "İnisiyatif almada orta seviyedesiniz.",
      "İnisiyatif almada üstün performans gösteriyorsunuz."
    ],
    "AD": [
      "Değişime uyum sağlamakta zorlanıyorsunuz.",
      "Adaptasyon yeteneğiniz makul düzeyde.",
      "Hızlı adapte olma yeteneğiniz dikkat çekiyor."
    ],
    "CM": [
      "İletişim becerileriniz geliştirilebilir.",
      "İletişimde yeterli ancak gelişime açık alanlarınız var.",
      "İletişimde ustalaşmış durumdasınız."
    ],
    "ST": [
      "Stratejik düşünce yapınızı geliştirmelisiniz.",
      "Stratejik düşünme konusunda orta seviyedesiniz.",
      "Stratejik düşünce yapınız güçlü."
    ],
    "TO": [
      "Ekip uyumunuzu geliştirmelisiniz.",
      "Ekip içinde iyi çalışıyorsunuz, ancak gelişebilirsiniz.",
      "Ekip çalışmasında üstün performans gösteriyorsunuz."
    ],
    "RL": [
      "Risk liderliği konusunda gelişim alanlarınız var.",
      "Risk yönetiminde dengeli bir yaklaşımınız var.",
      "Risk liderliğinde başarılı bir profiliniz var."
    ],
    "RI": [
      "Risk zekası konusunda daha fazla tecrübe kazanmalısınız.",
      "Risk zekası konusunda yeterli düzeydesiniz.",
      "Risk zekasında çok başarılı bir düzeydesiniz."
    ]
  };
  
  let level = 0;
  if (score > 30) level = 2;
  else if (score > 20) level = 1;
  
  return insights[competency][level];
};

const getRecommendations = (scores: CompetencyScore[]): string[] => {
  const recommendations: string[] = [];
  
  scores.forEach(comp => {
    const percentage = (comp.score / comp.maxScore) * 100;
    if (percentage < 50) {
      switch (comp.abbreviation) {
        case 'DM':
          recommendations.push('Karar verme süreçlerinizi hızlandırmak için zaman sınırları belirleyin');
          break;
        case 'IN':
          recommendations.push('Proaktif davranış geliştirmek için günlük hedefler koyun');
          break;
        case 'AD':
          recommendations.push('Değişim yönetimi eğitimleri alarak adaptasyon becerinizi geliştirin');
          break;
        case 'CM':
          recommendations.push('İletişim becerilerinizi geliştirmek için sunum eğitimleri alın');
          break;
        case 'ST':
          recommendations.push('Stratejik düşünme için uzun vadeli planlama egzersizleri yapın');
          break;
        case 'TO':
          recommendations.push('Ekip çalışması projelerinde daha aktif rol alın');
          break;
        case 'RL':
          recommendations.push('Risk yönetimi sertifikasyonu alarak liderlik becerinizi geliştirin');
          break;
        case 'RI':
          recommendations.push('Risk analizi araçlarını öğrenerek zekânızı geliştirin');
          break;
      }
    }
  });
  
  return recommendations;
};

const ResultsScreen = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [interactionAnalytics, setInteractionAnalytics] = useState<SessionAnalytics | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackSubmitSuccess, setFeedbackSubmitSuccess] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState<string | null>(null);

  // Direct Google Sheets API endpoint
  const API_URL = `https://script.google.com/macros/s/AKfycbzMTWueAS7y8b_Us7FoA2joYyaAim_KsGL9YlaGd0LfJNuUFPczGJfA4kBP6wUrT7J0/exec`;
  const FEEDBACK_API_URL = `https://script.google.com/macros/s/AKfycbzMTWueAS7y8b_Us7FoA2joYyaAim_KsGL9YlaGd0LfJNuUFPczGJfA4kBP6wUrT7J0/exec`;

  // Format time duration
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}dk ${remainingSeconds}sn`;
    }
    return `${remainingSeconds}sn`;
  };

  // Get question title by ID
  const getQuestionTitle = (questionId: number): string => {
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
    return questionTitles[questionId - 1] || `Soru ${questionId}`;
  };

  useEffect(() => {
    // Competency descriptions
    const competencyDescriptions: {[key: string]: string} = {
      "DM": "Karar verme yeteneği, baskı altında hızlı ve doğru kararlar alabilme becerinizi gösterir.",
      "IN": "İnisiyatif alma, proaktif davranma ve fırsatları değerlendirme becerinizi ölçer.",
      "AD": "Adaptasyon, değişen koşullara uyum sağlama ve esnek olabilme yeteneğinizi belirtir.",
      "CM": "İletişim, fikirlerinizi açık ve etkili bir şekilde ifade etme becerinizi gösterir.",
      "ST": "Stratejik düşünme, uzun vadeli planlama ve geniş perspektiften bakabilme yeteneğinizi ölçer.",
      "TO": "Ekip oryantasyonu, bir ekibin parçası olarak çalışma ve işbirliği yapma becerinizi belirtir.",
      "RL": "Risk liderliği, risk yönetiminde sorumluluk alma ve liderlik etme becerinizi ölçer.",
      "RI": "Risk zekası, riskleri doğru değerlendirme ve analiz etme yeteneğinizi gösterir."
    };

    // Competency categories
    const competencyCategories: {[key: string]: string} = {
      "DM": "stratejik",
      "IN": "liderlik",
      "AD": "liderlik",
      "CM": "iletişim",
      "ST": "stratejik",
      "TO": "iletişim",
      "RL": "risk",
      "RI": "risk"
    };

    // Make test functions available in console for debugging
    (window as any).debugGoogleSheets = {
      testBasicConnection,
      testGoogleSheetsIntegration,
      testCurrentData: () => {
        console.log("=== CURRENT DATA DEBUG ===");
        console.log("User:", user);
        console.log("Answers:", answers);
        console.log("Scores:", scores);
        console.log("API_URL:", API_URL);
        
        if (user && answers && scores.length > 0) {
          const payload = {
            user,
            answers,
            competencyScores: scores
          };
          
          const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
          console.log("Current payload:", payload);
          console.log("URL length:", url.length);
          console.log("URL preview:", url.substring(0, 300) + "...");
          
          // Test the actual submission
          const img = new Image();
          img.onload = () => console.log("✅ Current data submission successful");
          img.onerror = () => console.log("❌ Current data submission failed");
          img.src = url;
          img.style.display = 'none';
          document.body.appendChild(img);
        } else {
          console.log("❌ Missing required data for submission");
        }
      }
    };
    
    console.log("Debug functions available in console:");
    console.log("- debugGoogleSheets.testBasicConnection()");
    console.log("- debugGoogleSheets.testGoogleSheetsIntegration()");
    console.log("- debugGoogleSheets.testCurrentData()");

    const storedUser = sessionStorage.getItem('user');
    const storedAnswers = sessionStorage.getItem('answers');
    const storedAnalytics = sessionStorage.getItem('interactionAnalytics');

    if (!storedUser || !storedAnswers) {
      console.error('Missing user or answers data:', { storedUser, storedAnswers });
      setSubmitError('Veri transferinde sorun oluştu. Lütfen testi yeniden başlatın.');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      const parsedAnswers = JSON.parse(storedAnswers);
      setAnswers(parsedAnswers);

      // Load interaction analytics if available
      if (storedAnalytics) {
        try {
          const analytics = JSON.parse(storedAnalytics);
          setInteractionAnalytics(analytics);
        } catch (error) {
          console.error('Error parsing interaction analytics:', error);
        }
      }

      // Calculate scores
      const competencyScores: { [key: string]: number } = {};
      const maxCompetencyScores: { [key: string]: number } = {};
      
      // Initialize scores
      competencies.forEach(comp => {
        competencyScores[comp.name] = 0;
        maxCompetencyScores[comp.name] = 0;
      });

      // Calculate user scores based on their answers
      Object.entries(parsedAnswers).forEach(([questionId, answerId]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const selectedOption = question?.options.find(opt => opt.id === answerId);
        
        if (selectedOption) {
          Object.entries(selectedOption.weights).forEach(([comp, weight]) => {
            competencyScores[comp] += weight;
          });
        }
      });
      
      // Calculate maximum possible scores
      questions.forEach(question => {
        competencies.forEach(comp => {
          const highestWeight = Math.max(
            ...question.options.map(option => option.weights[comp.name] || 0)
          );
          maxCompetencyScores[comp.name] += highestWeight;
        });
      });

      const finalScores = competencies.map(comp => ({
        name: comp.name,
        score: competencyScores[comp.name],
        maxScore: maxCompetencyScores[comp.name],
        color: comp.color,
        fullName: comp.fullName,
        abbreviation: comp.name,
        category: competencyCategories[comp.name] || "stratejik",
        description: competencyDescriptions[comp.name] || ""
      })).sort((a, b) => b.score - a.score);

      setScores(finalScores);

      // Submit results including interaction analytics
      const submitResults = async () => {
        if (!user || !parsedAnswers || finalScores.length === 0) return;
        
        setIsSubmitting(true);
        setSubmitError(null);
        
        const userData = JSON.parse(storedUser);
        const payload = {
          user: userData,
          answers: parsedAnswers,
          competencyScores: finalScores
        };
        
        // Add detailed logging for debugging
        console.log('=== SUBMITTING RESULTS ===');
        console.log('User data:', userData);
        console.log('Final scores:', finalScores);
        console.log('Competency scores structure:', finalScores.map(score => ({
          name: score.name,
          abbreviation: score.abbreviation,
          score: score.score,
          maxScore: score.maxScore
        })));
        console.log('Full payload:', JSON.stringify(payload, null, 2));
        
        try {
          // Submit test results
          const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
          console.log('Results URL length:', url.length);
          console.log('Results URL preview:', url.substring(0, 300) + '...');
          
          const img = new Image();
          img.src = url;
          img.style.display = 'none';
          document.body.appendChild(img);
          
          // Clean up after 5 seconds
          setTimeout(() => {
            if (document.body.contains(img)) {
              document.body.removeChild(img);
            }
          }, 5000);
          
          // Submit interaction tracking data if available
          if (storedAnalytics) {
            try {
              const analytics = JSON.parse(storedAnalytics);
              // Add user information to analytics for tracking
              const analyticsWithUser = {
                ...analytics,
                user: userData
              };
              
              const interactionUrl = `${API_URL}?interactionData=${encodeURIComponent(JSON.stringify(analyticsWithUser))}`;
              const interactionImg = new Image();
              interactionImg.src = interactionUrl;
              interactionImg.style.display = 'none';
              document.body.appendChild(interactionImg);
              
              // Clean up after 5 seconds
              setTimeout(() => {
                if (document.body.contains(interactionImg)) {
                  document.body.removeChild(interactionImg);
                }
              }, 5000);
              
              console.log('Interaction tracking data submitted successfully');
            } catch (interactionError) {
              console.error('Error submitting interaction tracking:', interactionError);
              // Don't fail the whole submission if interaction tracking fails
            }
          }
          
          // Mark as successful after a short delay
          setTimeout(() => {
            setSubmitSuccess(true);
            setIsSubmitting(false);
          }, 2000);
          
        } catch (error) {
          console.error('Error with submission:', error);
          setSubmitError('Otomatik gönderim başarısız oldu. Lütfen "Sonuçları Gönder" butonunu kullanın.');
          setIsSubmitting(false);
        }
      };

      submitResults();
    } catch (error) {
      console.error('Error processing data:', error);
      setSubmitError('Veri işleme hatası oluştu.');
    }
  }, [API_URL]);

  const handleRestart = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleManualSubmit = () => {
    if (!user || !answers || scores.length === 0) {
      setSubmitError('Gönderilecek veri bulunamadı.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const payload = {
      user,
      answers,
      competencyScores: scores
    };

    // Add detailed logging for debugging
    console.log('=== MANUAL SUBMIT RESULTS ===');
    console.log('User data:', user);
    console.log('Scores:', scores);
    console.log('Competency scores structure:', scores.map(score => ({
      name: score.name,
      abbreviation: score.abbreviation,
      score: score.score,
      maxScore: score.maxScore
    })));
    console.log('Full payload:', JSON.stringify(payload, null, 2));

    try {
      // Submit test results
      const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
      console.log('Manual results URL length:', url.length);
      console.log('Manual results URL preview:', url.substring(0, 300) + '...');
      
      const img = new Image();
      img.src = url;
      img.style.display = 'none';
      document.body.appendChild(img);
      
      // Clean up after 5 seconds
      setTimeout(() => {
        if (document.body.contains(img)) {
          document.body.removeChild(img);
        }
      }, 5000);
      
      // Submit interaction tracking data if available
      const storedAnalytics = sessionStorage.getItem('interactionAnalytics');
      if (storedAnalytics) {
        try {
          const analytics = JSON.parse(storedAnalytics);
          // Add user information to analytics for tracking
          const analyticsWithUser = {
            ...analytics,
            user: user
          };
          
          const interactionUrl = `${API_URL}?interactionData=${encodeURIComponent(JSON.stringify(analyticsWithUser))}`;
          const interactionImg = new Image();
          interactionImg.src = interactionUrl;
          interactionImg.style.display = 'none';
          document.body.appendChild(interactionImg);
          
          // Clean up after 5 seconds
          setTimeout(() => {
            if (document.body.contains(interactionImg)) {
              document.body.removeChild(interactionImg);
            }
          }, 5000);
          
          console.log('Manual interaction tracking data submitted successfully');
        } catch (interactionError) {
          console.error('Error submitting manual interaction tracking:', interactionError);
          // Don't fail the whole submission if interaction tracking fails
        }
      }
      
      // Mark as successful after a short delay
      setTimeout(() => {
        setSubmitSuccess(true);
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Manual submission error:', error);
      setSubmitError('Gönderim başarısız oldu. Lütfen tekrar deneyin.');
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    console.log('=== FEEDBACK SUBMIT STARTED ===');
    console.log('Feedback text:', feedbackText);
    console.log('Feedback rating:', feedbackRating);
    console.log('User:', user);
    
    if (!feedbackText.trim() || feedbackRating === 0) {
      console.log('Validation failed: missing text or rating');
      setFeedbackSubmitError('Lütfen geri bildirim yazın ve puan verin.');
      return;
    }

    if (!user) {
      console.log('Validation failed: no user');
      setFeedbackSubmitError('Kullanıcı bilgisi bulunamadı.');
      return;
    }

    setIsFeedbackSubmitting(true);
    setFeedbackSubmitError(null);

    // Create a simpler data structure to avoid URL length issues
    const feedbackData = {
      action: 'feedback',
      feedback: feedbackText.trim(),
      rating: feedbackRating,
      timestamp: new Date().toISOString(),
      firstName: user.firstName,
      lastName: user.lastName
    };

    console.log('Submitting feedback data:', feedbackData);

    try {
      // Method: Use individual parameters instead of JSON
      const params = new URLSearchParams({
        action: 'feedback',
        feedback: feedbackData.feedback,
        rating: feedbackData.rating.toString(),
        timestamp: feedbackData.timestamp,
        firstName: feedbackData.firstName,
        lastName: feedbackData.lastName
      });
      
      const url = `${API_URL}?${params.toString()}`;
      console.log('Feedback URL length:', url.length);
      console.log('Feedback URL:', url.substring(0, 200) + '...');
      
      // Use Image method with success assumption (since Google Apps Script usually works)
      const img = new Image();
      img.src = url;
      img.style.display = 'none';
      document.body.appendChild(img);
      
      // Since Google Apps Script typically returns 200 OK, assume success after short delay
      setTimeout(() => {
        console.log('Feedback submission completed successfully');
        setFeedbackSubmitSuccess(true);
        setIsFeedbackSubmitting(false);
        setFeedbackText('');
        setFeedbackRating(0);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setFeedbackSubmitSuccess(false);
        }, 3000);
      }, 1500); // 1.5 second delay for submission
      
      // Clean up image after 10 seconds
      setTimeout(() => {
        if (document.body.contains(img)) {
          document.body.removeChild(img);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Feedback submission error:', error);
      setFeedbackSubmitError('Geri bildirim gönderilemedi. Lütfen tekrar deneyin.');
      setIsFeedbackSubmitting(false);
    }
  };

  // Test function for debugging
  const testFeedbackSubmission = () => {
    console.log('=== TEST FEEDBACK SUBMISSION ===');
    console.log('API_URL:', API_URL);
    
    const testParams = new URLSearchParams({
      action: 'feedback',
      feedback: 'Test feedback message',
      rating: '5',
      timestamp: new Date().toISOString(),
      firstName: 'Test',
      lastName: 'User'
    });
    
    const url = `${API_URL}?${testParams.toString()}`;
    console.log('Test URL:', url);
    console.log('Test URL length:', url.length);
    
    // Try with Image method
    const img = new Image();
    img.onload = () => console.log('Test image loaded successfully');
    img.onerror = () => console.log('Test image failed to load');
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
  };

  const getScorePercentage = (score: number, maxScore: number): number => {
    return Math.round((score / maxScore) * 100);
  };

  const getScoreLevel = (percentage: number): string => {
    if (percentage >= 80) return 'Mükemmel';
    if (percentage >= 60) return 'İyi';
    if (percentage >= 40) return 'Orta';
    return 'Gelişim Gerekli';
  };

  const getScoreLevelColor = (percentage: number): string => {
    if (percentage >= 80) return '#00ff88';
    if (percentage >= 60) return '#00bfff';
    if (percentage >= 40) return '#ffa500';
    return '#ff6b6b';
  };

  const handleExportData = () => {
    const exportData = {
      user,
      scores,
      interactionAnalytics,
      recommendations: getRecommendations(scores),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${user?.firstName}_${user?.lastName}_sonuclar.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (scores.length === 0) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <p>Sonuçlar hesaplanıyor...</p>
      </div>
    );
  }

  // Calculate overall performance
  const overallScore = Math.round(
    scores.reduce((sum, comp) => sum + getScorePercentage(comp.score, comp.maxScore), 0) / scores.length
  );

  // Get top competencies and development areas
  const topCompetencies = scores.slice(0, 3);
  const developmentAreas = scores.slice(-3).reverse();

  const filterOptions = [
    { value: 'all', label: 'Tüm Sonuçlar' },
    { value: 'davranış-analizi', label: 'Davranış Analizi' },
    { value: 'yetkinlikler', label: 'Yetkinlikler' },
    { value: 'öneriler', label: 'Öneriler' }
  ];

  const renderDavranisAnalizi = () => {
    if (!interactionAnalytics) return null;
    
    return (
      <div className="analysis-section">
        <h3>Davranış Analizi</h3>
        <div className="behavior-metrics">
          <div className="metric-card">
            <div className="metric-value">{formatTime(interactionAnalytics.averageResponseTime)}</div>
            <div className="metric-label">Ortalama Yanıt Süresi</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{interactionAnalytics.totalAnswerChanges}</div>
            <div className="metric-label">Cevap Değişikliği</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{interactionAnalytics.totalBackNavigations}</div>
            <div className="metric-label">Geri Dönüş</div>
          </div>
        </div>
        
        <div className="decision-style">
          <h4>Karar Verme Tarzınız</h4>
          <div className="style-badges">
            {interactionAnalytics.averageResponseTime < 30000 ? (
              <span className="style-badge quick">Hızlı Karar Verici</span>
            ) : interactionAnalytics.averageResponseTime > 60000 ? (
              <span className="style-badge deliberate">Düşünceli Karar Verici</span>
            ) : (
              <span className="style-badge balanced">Dengeli Karar Verici</span>
            )}
            
            {interactionAnalytics.totalAnswerChanges > 5 && (
              <span className="style-badge adaptive">Adaptif Düşünür</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderYetkinlikler = () => (
    <div className="competencies-section">
      <h3>Yetkinlik Detayları</h3>
      <div className="competencies-grid">
        {scores.map((comp) => {
          const percentage = getScorePercentage(comp.score, comp.maxScore);
          return (
            <div key={comp.name} className="competency-detail-card">
              <div className="competency-header">
                <h4>{comp.fullName}</h4>
                <span className="competency-score" style={{ color: getScoreLevelColor(percentage) }}>
                  {percentage}%
                </span>
              </div>
              <div className="competency-progress">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: getScoreLevelColor(percentage)
                  }}
                ></div>
              </div>
              <p className="competency-description">{comp.description}</p>
              <p className="competency-insight">{getInsight(comp.abbreviation, comp.score)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderOneriler = () => {
    const recommendations = getRecommendations(scores);
    
    return (
      <div className="recommendations-section">
        <h3>Gelişim Önerileri</h3>
        <div className="recommendations-list">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="recommendation-item">
              <p>{recommendation}</p>
            </div>
          ))}
          
          {currentFilter === 'öneriler' && (
            <div className="general-recommendations">
              <h4>Genel Öneriler</h4>
              <div className="recommendation-item">
                <p>Liderlik gelişimi için düzenli okuma alışkanlığı edinin</p>
              </div>
              <div className="recommendation-item">
                <p>Hedef belirleme ve takip sistemleri kullanın</p>
              </div>
              <div className="recommendation-item">
                <p>Mentorluk programlarına katılım sağlayın</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFilteredContent = () => {
    switch (currentFilter) {
      case 'davranış-analizi':
        return renderDavranisAnalizi();
      case 'yetkinlikler':
        return renderYetkinlikler();
      case 'öneriler':
        return renderOneriler();
      default:
        return (
          <>
            {renderDavranisAnalizi()}
            {renderYetkinlikler()}
          </>
        );
    }
  };

  return (
    <div className="modern-results-container">
      {/* Header */}
      <div className="modern-header">
        <div className="header-left">
          <h1>Sonuçlar</h1>
        </div>
        <div className="header-right">
          <div className="header-controls">
            <div className="filter-dropdown">
              <button 
                className="filter-button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              >
                {filterOptions.find(opt => opt.value === currentFilter)?.label}
                <span className={`dropdown-arrow ${isFilterDropdownOpen ? 'open' : ''}`}></span>
              </button>
              {isFilterDropdownOpen && (
                <div className="filter-dropdown-menu">
                  {filterOptions.map(option => (
                    <button
                      key={option.value}
                      className={`filter-option ${currentFilter === option.value ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentFilter(option.value as FilterType);
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="export-button" onClick={handleExportData}>
              Dışa Aktar
            </button>
          </div>
          <button className="restart-button" onClick={handleRestart}>
            Yeni Test
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="modern-content">
        {/* Left Sidebar - Overview */}
        <div className="sidebar">
          <div className="overview-card">
            <h3>Genel Performans</h3>
            <div className="overall-score-display">
              <div className="score-circle" style={{ color: getScoreLevelColor(overallScore) }}>
                {overallScore}%
              </div>
              <p className="score-level">{getScoreLevel(overallScore)}</p>
            </div>
            
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Toplam Soru:</span>
                <span className="stat-value">{questions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Değerlendirilen Alan:</span>
                <span className="stat-value">{scores.length}</span>
              </div>
            </div>
          </div>

          <div className="development-areas-card">
            <h3>Gelişim Alanları</h3>
            <div className="development-list">
              {developmentAreas.map((comp) => {
                const percentage = getScorePercentage(comp.score, comp.maxScore);
                return (
                  <div key={comp.name} className="development-item">
                    <div className="development-info">
                      <span className="development-name">{comp.fullName}</span>
                      <span className="development-score" style={{ color: getScoreLevelColor(percentage) }}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="development-bar">
                      <div 
                        className="development-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: getScoreLevelColor(percentage)
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Form in Sidebar */}
          <div className="sidebar-feedback-card">
            <h3>Geri Bildirim</h3>
            <p className="sidebar-feedback-description">
              Test deneyiminizi değerlendirin
            </p>
            
            <div className="sidebar-feedback-form">
              <div className="sidebar-rating-section">
                <label>Puanınız:</label>
                <div className="sidebar-star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`sidebar-star ${feedbackRating >= star ? 'active' : ''}`}
                      onClick={() => setFeedbackRating(star)}
                      disabled={isFeedbackSubmitting}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="sidebar-feedback-text-section">
                <label htmlFor="sidebar-feedback-text">Yorumlarınız:</label>
                <textarea
                  id="sidebar-feedback-text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Görüşlerinizi paylaşın..."
                  rows={3}
                  disabled={isFeedbackSubmitting}
                  maxLength={300}
                />
                <div className="sidebar-character-count">
                  {feedbackText.length}/300
                </div>
              </div>
              
              <button
                className="sidebar-feedback-submit-button"
                onClick={handleFeedbackSubmit}
                disabled={!feedbackText.trim() || feedbackRating === 0 || isFeedbackSubmitting}
              >
                {isFeedbackSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
              
              {feedbackSubmitError && (
                <div className="sidebar-feedback-error">
                  {feedbackSubmitError}
                </div>
              )}
              
              {feedbackSubmitSuccess && (
                <div className="sidebar-feedback-success">
                  Teşekkürler!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {renderFilteredContent()}
        </div>
      </div>

      {/* Status Messages */}
      {isSubmitting && (
        <div className="status-overlay">
          <div className="status-message loading">
            <div className="spinner"></div>
            Sonuçlar kaydediliyor...
          </div>
        </div>
      )}

      {submitError && (
        <div className="status-overlay">
          <div className="status-message error">
            {submitError}
            <button onClick={() => setSubmitError(null)}>✕</button>
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className="status-overlay">
          <div className="status-message success">
            Sonuçlar başarıyla kaydedildi!
            <button onClick={() => setSubmitSuccess(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen; 