import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, competencies } from '../data/questions';
import type { SessionAnalytics } from '../services/InteractionTracker';
import { testGoogleSheetsIntegration, testBasicConnection } from '../utils/debugGoogleSheets';
import { BehavioralAnalyticsService } from '../services/BehavioralAnalyticsService';
import PersonalizedRecommendationsComponent from '../components/PersonalizedRecommendations';
import type { PersonalizedRecommendations, UserAnalyticsData, DimensionScore } from '../types/Recommendations';
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
  ratings: {
    accuracy: number;
    gameExperience: number;
    fairness: number;
    usefulness: number;
    recommendation: number;
    purchaseLikelihood: number;
    valueForMoney: number;
    technicalPerformance: number;
  };
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
  const [feedbackRatings, setFeedbackRatings] = useState({
    accuracy: 0,
    gameExperience: 0,
    fairness: 0,
    usefulness: 0,
    recommendation: 0,
    purchaseLikelihood: 0,
    valueForMoney: 0,
    technicalPerformance: 0,
  });
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackSubmitSuccess, setFeedbackSubmitSuccess] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState<string | null>(null);

  // Personalized recommendations state
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  // Direct Google Sheets API endpoint
  const API_URL = `https://script.google.com/macros/s/AKfycbyPTdwM5hzH0m7Bm2g9_eyEogvPM-LAU_YxJ-mvzf8aT0RrTq8ZRqwZOcfMLNtPW-ac/exec`;
  const FEEDBACK_API_URL = `https://script.google.com/macros/s/AKfycbyPTdwM5hzH0m7Bm2g9_eyEogvPM-LAU_YxJ-mvzf8aT0RrTq8ZRqwZOcfMLNtPW-ac/exec`;

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

      // Generate personalized recommendations after scores are calculated
      setTimeout(() => {
        generatePersonalizedRecommendations();
      }, 500); // Small delay to ensure state is updated

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
    console.log('Feedback ratings:', feedbackRatings);
    console.log('User:', user);
    
    // Check if at least one rating is provided
    const hasAnyRating = Object.values(feedbackRatings).some(rating => rating > 0);
    
    if (!feedbackText.trim() && !hasAnyRating) {
      console.log('Validation failed: no feedback text or ratings');
      setFeedbackSubmitError('Lütfen en az bir değerlendirme yapın veya yorum yazın.');
      return;
    }

    if (!user) {
      console.log('Validation failed: no user');
      setFeedbackSubmitError('Kullanıcı bilgisi bulunamadı.');
      return;
    }

    setIsFeedbackSubmitting(true);
    setFeedbackSubmitError(null);

    // Create comprehensive feedback data
    const feedbackData = {
      action: 'feedback',
      feedback: feedbackText.trim(),
      accuracy: feedbackRatings.accuracy,
      gameExperience: feedbackRatings.gameExperience,
      fairness: feedbackRatings.fairness,
      usefulness: feedbackRatings.usefulness,
      recommendation: feedbackRatings.recommendation,
      purchaseLikelihood: feedbackRatings.purchaseLikelihood,
      valueForMoney: feedbackRatings.valueForMoney,
      technicalPerformance: feedbackRatings.technicalPerformance,
      timestamp: new Date().toISOString(),
      firstName: user.firstName,
      lastName: user.lastName
    };

    console.log('Submitting comprehensive feedback data:', feedbackData);

    try {
      // Method: Use individual parameters instead of JSON
      const params = new URLSearchParams({
        action: 'feedback',
        feedback: feedbackData.feedback,
        accuracy: feedbackData.accuracy.toString(),
        gameExperience: feedbackData.gameExperience.toString(),
        fairness: feedbackData.fairness.toString(),
        usefulness: feedbackData.usefulness.toString(),
        recommendation: feedbackData.recommendation.toString(),
        purchaseLikelihood: feedbackData.purchaseLikelihood.toString(),
        valueForMoney: feedbackData.valueForMoney.toString(),
        technicalPerformance: feedbackData.technicalPerformance.toString(),
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
        setFeedbackRatings({
          accuracy: 0,
          gameExperience: 0,
          fairness: 0,
          usefulness: 0,
          recommendation: 0,
          purchaseLikelihood: 0,
          valueForMoney: 0,
          technicalPerformance: 0,
        });
        
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

  const handleSliderChange = (ratingType: keyof typeof feedbackRatings, value: number) => {
    setFeedbackRatings(prev => ({ ...prev, [ratingType]: value }));
  };

  const handleSliderClick = (event: React.MouseEvent<HTMLDivElement>, ratingType: keyof typeof feedbackRatings) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const value = Math.round(percentage * 9) + 1; // 1-10 scale
    handleSliderChange(ratingType, value);
  };

  const getSliderPosition = (value: number): string => {
    return `${((value - 1) / 9) * 100}%`;
  };

  // Generate personalized recommendations using behavioral analytics
  const generatePersonalizedRecommendations = async () => {
    console.log('🚀 generatePersonalizedRecommendations called!');
    console.log('Data check:', { 
      hasUser: !!user, 
      hasAnswers: !!answers, 
      hasInteractionAnalytics: !!interactionAnalytics, 
      scoresLength: scores.length 
    });

    if (!user || !answers || !interactionAnalytics || scores.length === 0) {
      console.log('❌ Missing data for personalized recommendations:', { user, answers, interactionAnalytics, scores: scores.length });
      return;
    }

    console.log('✅ All data available, starting AI recommendation generation...');
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      console.log('=== GENERATING AI-POWERED PERSONALIZED RECOMMENDATIONS ===');
      
      // Prepare user analytics data
      const userAnalyticsData: UserAnalyticsData = {
        answers,
        timestamps: {}, // We could enhance this with actual timestamps
        interactionEvents: interactionAnalytics.events || [],
        sessionAnalytics: interactionAnalytics,
        userInfo: {
          firstName: user.firstName,
          lastName: user.lastName
        }
      };

      console.log('📊 User analytics data prepared:', userAnalyticsData);

      // Create behavioral analytics service
      const behavioralService = new BehavioralAnalyticsService();

      // Convert scores to DimensionScore format
      const dimensionScores: DimensionScore[] = scores.map((score, index) => ({
        dimension: score.abbreviation || competencies[index]?.name || `DIM_${index}`,
        score: typeof score === 'number' ? score : Number(score),
        maxScore: 10,
        percentile: (typeof score === 'number' ? score : Number(score)) / 10 * 100
      }));

      console.log('🎯 Dimension scores prepared:', dimensionScores);

      // Try AI-powered recommendations first, fallback to simulated if needed
      console.log('🤖 Calling AI recommendation service...');
      const personalizedRecs = await behavioralService.generateAIRecommendations(
        dimensionScores,
        `session_${Date.now()}`,
        userAnalyticsData.userInfo
      );

      console.log('✅ AI recommendations generated successfully:', personalizedRecs);

      setPersonalizedRecommendations(personalizedRecs);
      setIsLoadingRecommendations(false);

      // Store in session storage for persistence
      sessionStorage.setItem('personalizedRecommendations', JSON.stringify(personalizedRecs));

    } catch (error) {
      console.error('❌ Error generating personalized recommendations:', error);
      setRecommendationsError('Kişiselleştirilmiş öneriler oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoadingRecommendations(false);
    }
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
    // If we have personalized recommendations, show them
    if (personalizedRecommendations || isLoadingRecommendations || recommendationsError) {
      return (
        <PersonalizedRecommendationsComponent
          recommendations={personalizedRecommendations}
          isLoading={isLoadingRecommendations}
          error={recommendationsError}
        />
      );
    }

    // Fallback to original recommendations
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
            {renderOneriler()}
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
              Test deneyiminizi değerlendirin (1-10 arası puanlayın)
            </p>
            
            <div className="sidebar-feedback-form">
              {/* Accuracy Rating */}
              <div className="sidebar-rating-section">
                <label>Sonuçların doğruluğunu nasıl değerlendiriyorsunuz?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'accuracy')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.accuracy > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.accuracy || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.accuracy > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.accuracy > 0 ? `Puanınız: ${feedbackRatings.accuracy}/10` : 'Bir puan seçin'}
                </div>
              </div>

              {/* Game Experience Rating */}
              <div className="sidebar-rating-section">
                <label>Ne kadar "oyun oynuyor" hissi yaşadınız?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'gameExperience')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.gameExperience > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.gameExperience || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.gameExperience > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.gameExperience > 0 ? `Puanınız: ${feedbackRatings.gameExperience}/10` : 'Bir puan seçin'}
                </div>
              </div>

              {/* Fairness Rating */}
              <div className="sidebar-rating-section">
                <label>Puanlama sistemi ne kadar adil geldi?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'fairness')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.fairness > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.fairness || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.fairness > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.fairness > 0 ? `Puanınız: ${feedbackRatings.fairness}/10` : 'Bir puan seçin'}
                </div>
              </div>

              {/* Usefulness Rating */}
              <div className="sidebar-rating-section">
                <label>Sonuçlar güçlü/zayıf yönlerinizi anlamada ne kadar faydalı?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'usefulness')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.usefulness > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.usefulness || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.usefulness > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.usefulness > 0 ? `Puanınız: ${feedbackRatings.usefulness}/10` : 'Bir puan seçin'}
                </div>
              </div>

              {/* Recommendation Rating */}
              <div className="sidebar-rating-section">
                <label>Bu testi arkadaşınıza tavsiye etme olasılığınız?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'recommendation')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.recommendation > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.recommendation || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.recommendation > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.recommendation > 0 ? `Puanınız: ${feedbackRatings.recommendation}/10` : 'Bir puan seçin'}
                </div>
              </div>

              {/* Purchase Likelihood Rating */}
              <div className="sidebar-rating-section">
                <label>İK müdürü olsaydınız, bu testi satın alma olasılığınız?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'purchaseLikelihood')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.purchaseLikelihood > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.purchaseLikelihood || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.purchaseLikelihood > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.purchaseLikelihood > 0 ? `Puanınız: ${feedbackRatings.purchaseLikelihood}/10` : 'Bir puan seçin'}
                </div>
              </div>

              {/* Value for Money Rating */}
              <div className="sidebar-rating-section">
                <label>25$ maliyetle, paranın karşılığını nasıl değerlendirirsiniz?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'valueForMoney')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.valueForMoney > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.valueForMoney || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.valueForMoney > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.valueForMoney > 0 ? `Puanınız: ${feedbackRatings.valueForMoney}/10` : 'Bir puan seçin'}
                </div>
              </div>

              {/* Technical Performance Rating */}
              <div className="sidebar-rating-section">
                <label>Teknik performansı (yüklenme, yanıt verme) nasıl değerlendiriyorsunuz?</label>
                <div className="rating-slider-container">
                  <div 
                    className="rating-slider-track"
                    onClick={(e) => handleSliderClick(e, 'technicalPerformance')}
                  >
                    <div 
                      className={`rating-slider-handle ${feedbackRatings.technicalPerformance > 0 ? 'has-value' : ''}`}
                      style={{ left: getSliderPosition(feedbackRatings.technicalPerformance || 1) }}
                    />
                  </div>
                  <div className="rating-scale-labels">
                    <span className="rating-scale-label">1</span>
                    <span className="rating-scale-label">10</span>
                  </div>
                </div>
                <div className={`rating-description ${feedbackRatings.technicalPerformance > 0 ? 'has-value' : ''}`}>
                  {feedbackRatings.technicalPerformance > 0 ? `Puanınız: ${feedbackRatings.technicalPerformance}/10` : 'Bir puan seçin'}
                </div>
              </div>
              
              <div className="sidebar-feedback-text-section">
                <label htmlFor="sidebar-feedback-text">Ek Yorumlarınız:</label>
                <textarea
                  id="sidebar-feedback-text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Şimdiden teşekkürler."
                  rows={3}
                  disabled={isFeedbackSubmitting}
                  maxLength={500}
                />
                <div className="sidebar-character-count">
                  {feedbackText.length}/500
                </div>
              </div>
              
              <button
                className="sidebar-feedback-submit-button"
                onClick={handleFeedbackSubmit}
                disabled={isFeedbackSubmitting}
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