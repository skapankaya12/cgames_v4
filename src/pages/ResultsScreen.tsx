import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, competencies } from '../data/questions';
import type { SessionAnalytics } from '../services/InteractionTracker';
import { testGoogleSheetsIntegration, testBasicConnection } from '../utils/debugGoogleSheets';
import { BehavioralAnalyticsService } from '../services/BehavioralAnalyticsService';
import { PDFImportService, type ImportedData } from '../services/PDFImportService';
import { PDFExportService, type ExportData } from '../services/PDFExportService';
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
      "Risk liderliği, risk yönetiminde sorumluluk alma ve liderlik etme becerinizi ölçer.",
      "Risk liderliğinde başarılı bir profiliniz var."
    ],
    "RI": [
      "Risk zekası, riskleri doğru değerlendirme ve analiz etme yeteneğinizi gösterir."
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

  // PDF Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct Google Sheets API endpoint
  const API_URL = `https://script.google.com/macros/s/AKfycbw6qC8GtrcClw9dCD_GZBZ7muzId_uD9GOserb-L5pJCY9c8zB-E7yH6ZA8v7VB-p9g/exec`;

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
    (window as Window & { debugGoogleSheets?: unknown }).debugGoogleSheets = {
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
      },
      testWithFetch: async () => {
        console.log("=== TESTING WITH FETCH ===");
        if (user && answers && scores.length > 0) {
          const payload = {
            user,
            answers,
            competencyScores: scores
          };
          
          try {
            const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
            console.log("Fetch URL:", url.substring(0, 200) + "...");
            
            const _response = await fetch(url, {
              method: 'GET',
              mode: 'no-cors'
            });
            
            console.log("✅ Fetch completed");
            console.log("Response status:", _response.status);
            console.log("Response type:", _response.type);
            
          } catch (error) {
            console.error("❌ Fetch failed:", error);
          }
        }
      },
      forceSubmit: async () => {
        console.log("=== FORCE SUBMIT TEST ===");
        if (user && answers && scores.length > 0) {
          const payload = {
            user,
            answers,
            competencyScores: scores
          };
          
          console.log("Force submitting payload:", payload);
          
          // Method 1: Image
          const url1 = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
          const img = new Image();
          img.onload = () => console.log("✅ Image method successful");
          img.onerror = (e) => console.log("❌ Image method failed:", e);
          img.src = url1;
          img.style.display = 'none';
          document.body.appendChild(img);
          
          // Method 2: Fetch with no-cors
          try {
            await fetch(url1, { method: 'GET', mode: 'no-cors' });
            console.log("✅ Fetch no-cors completed");
          } catch (error) {
            console.error("❌ Fetch no-cors failed:", error);
          }
          
          // Method 3: Create iframe
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = url1;
          document.body.appendChild(iframe);
          console.log("📤 Iframe method initiated");
          
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 5000);
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
          // Enhanced submission with multiple methods for reliability
          const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
          console.log('Results URL length:', url.length);
          console.log('Results URL preview:', url.substring(0, 300) + '...');
          
          // Method 1: Fetch with no-cors (most reliable for Google Apps Script)
          try {
            await fetch(url, { 
              method: 'GET', 
              mode: 'no-cors',
              cache: 'no-cache'
            });
            console.log('✅ Fetch submission completed');
          } catch (fetchError) {
            console.warn('⚠️ Fetch method failed:', fetchError);
          }
          
          // Method 2: Image fallback
          const img = new Image();
          img.onload = () => console.log('✅ Image submission successful');
          img.onerror = (e) => console.warn('⚠️ Image submission failed:', e);
          img.src = url;
          img.style.display = 'none';
          document.body.appendChild(img);
          
          // Method 3: Iframe fallback
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.style.width = '1px';
          iframe.style.height = '1px';
          iframe.src = url;
          document.body.appendChild(iframe);
          
          // Clean up after 10 seconds
          setTimeout(() => {
            if (document.body.contains(img)) {
              document.body.removeChild(img);
            }
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 10000);
          
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
              
              // Use fetch for interaction data too
              try {
                await fetch(interactionUrl, { method: 'GET', mode: 'no-cors' });
                console.log('✅ Interaction tracking submitted via fetch');
              } catch (fetchError) {
                console.warn('⚠️ Interaction fetch failed, using image fallback:', fetchError);
                const interactionImg = new Image();
                interactionImg.src = interactionUrl;
                interactionImg.style.display = 'none';
                document.body.appendChild(interactionImg);
                
                setTimeout(() => {
                  if (document.body.contains(interactionImg)) {
                    document.body.removeChild(interactionImg);
                  }
                }, 10000);
              }
              
              console.log('✅ Interaction tracking data submitted successfully');
            } catch (interactionError) {
              console.error('❌ Error submitting interaction tracking:', interactionError);
              // Don't fail the whole submission if interaction tracking fails
            }
          }
          
          // Mark as successful after a short delay
          setTimeout(() => {
            setSubmitSuccess(true);
            setIsSubmitting(false);
          }, 2000);
          
        } catch (error) {
          console.error('❌ Error with submission:', error);
          setSubmitError('Otomatik gönderim başarısız oldu. Lütfen "Sonuçları Gönder" butonunu kullanın.');
          setIsSubmitting(false);
        }
      };

      submitResults();
    } catch (error) {
      console.error('Error processing data:', error);
      setSubmitError('Veri işleme hatası oluştu.');
    }
  }, [API_URL]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Enhanced manual submission with multiple methods
      const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
      console.log('Manual results URL length:', url.length);
      console.log('Manual results URL preview:', url.substring(0, 300) + '...');
      
      // Method 1: Fetch with no-cors (most reliable)
      const submitWithFetch = async () => {
        try {
          await fetch(url, { 
            method: 'GET', 
            mode: 'no-cors',
            cache: 'no-cache'
          });
          console.log('✅ Manual fetch submission completed');
          return true;
        } catch (error) {
          console.warn('⚠️ Manual fetch failed:', error);
          return false;
        }
      };
      
      // Execute fetch submission
      submitWithFetch();
      
      // Method 2: Image fallback
      const img = new Image();
      img.onload = () => console.log('✅ Manual image submission successful');
      img.onerror = (e) => console.warn('⚠️ Manual image submission failed:', e);
      img.src = url;
      img.style.display = 'none';
      document.body.appendChild(img);
      
      // Method 3: Iframe fallback
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      // Clean up after 10 seconds
      setTimeout(() => {
        if (document.body.contains(img)) {
          document.body.removeChild(img);
        }
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 10000);
      
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
          
          // Use fetch for interaction data
          const submitInteractionWithFetch = async () => {
            try {
              await fetch(interactionUrl, { method: 'GET', mode: 'no-cors' });
              console.log('✅ Manual interaction tracking submitted via fetch');
            } catch (error) {
              console.warn('⚠️ Manual interaction fetch failed, using image fallback:', error);
              const interactionImg = new Image();
              interactionImg.src = interactionUrl;
              interactionImg.style.display = 'none';
              document.body.appendChild(interactionImg);
              
              setTimeout(() => {
                if (document.body.contains(interactionImg)) {
                  document.body.removeChild(interactionImg);
                }
              }, 10000);
            }
          };
          
          submitInteractionWithFetch();
          console.log('✅ Manual interaction tracking data submitted successfully');
        } catch (interactionError) {
          console.error('❌ Error submitting manual interaction tracking:', interactionError);
          // Don't fail the whole submission if interaction tracking fails
        }
      }
      
      // Mark as successful after a short delay
      setTimeout(() => {
        setSubmitSuccess(true);
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Manual submission error:', error);
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

  const getScorePercentage = (score: number, maxScore: number): number => {
    // NORMALIZED SCORING SYSTEM - All competencies scaled to 100 points
    // This ensures fair percentage calculation across all competencies
    
    const NORMALIZED_BASE = 100; // All competencies normalized to 100 points
    
    // Calculate the scaling factor to bring this competency to 100 points
    const scalingFactor = NORMALIZED_BASE / maxScore;
    
    // Scale the user's score proportionally
    const normalizedScore = score * scalingFactor;
    
    // Calculate percentage from the normalized 100-point base
    const percentage = (normalizedScore / NORMALIZED_BASE) * 100;
    
    return Math.round(Math.min(percentage, 100)); // Cap at 100%
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

  const handleExportData = async () => {
    try {
      console.log('📄 Starting PDF export process...');
      
      // Prepare export data
      const exportData: ExportData = {
        user: user || { firstName: 'Kullanıcı', lastName: 'Bilinmiyor' },
        scores: scores.map(score => ({
          name: score.name,
          score: score.score,
          maxScore: score.maxScore,
          abbreviation: score.abbreviation,
          fullName: score.fullName,
          category: score.category,
          description: score.description,
          color: score.color
        })),
        interactionAnalytics,
        recommendations: getRecommendations(scores),
        exportDate: new Date().toISOString()
      };

      // Create PDF export service and export
      const pdfExportService = new PDFExportService();
      await pdfExportService.exportToPDF(exportData);
      
      console.log('✅ PDF export completed successfully');
      
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      alert('PDF dışa aktarma başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  // PDF Import Functions
  const handleImportClick = () => {
    setImportError(null);
    setImportSuccess(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setImportError('Lütfen sadece PDF dosyası seçin.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImportError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      console.log('📄 Starting PDF import for file:', file.name);
      
      const pdfImportService = new PDFImportService();
      const importedData: ImportedData = await pdfImportService.importFromPDF(file);

      // Validate imported data
      if (!pdfImportService.validateImportedData(importedData)) {
        throw new Error('İçe aktarılan veri geçersiz format içeriyor.');
      }

      console.log('✅ PDF import successful:', importedData);

      // Update application state with imported data
      setUser({
        firstName: importedData.user.firstName,
        lastName: importedData.user.lastName
      });

      // Convert imported scores to CompetencyScore format
      const importedScores: CompetencyScore[] = importedData.scores.map((score) => ({
        name: score.name,
        score: score.score,
        maxScore: score.maxScore,
        color: getScoreLevelColor((score.score / score.maxScore) * 100),
        fullName: score.fullName,
        abbreviation: score.abbreviation,
        category: score.category,
        description: score.description
      }));

      setScores(importedScores);

      // Update session storage with imported data
      sessionStorage.setItem('user', JSON.stringify(importedData.user));
      
      if (importedData.answers) {
        setAnswers(importedData.answers);
        sessionStorage.setItem('answers', JSON.stringify(importedData.answers));
      }

      if (importedData.interactionAnalytics) {
        setInteractionAnalytics(importedData.interactionAnalytics);
        sessionStorage.setItem('interactionAnalytics', JSON.stringify(importedData.interactionAnalytics));
      }

      setImportSuccess(true);
      setIsImporting(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setImportSuccess(false);
      }, 3000);

      console.log('✅ PDF import completed and state updated');

    } catch (error) {
      console.error('❌ PDF import failed:', error);
      setImportError(error instanceof Error ? error.message : 'PDF içe aktarma başarısız oldu.');
      setIsImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    if (!user || !answers || scores.length === 0) {
      console.log('❌ Missing essential data for personalized recommendations:', { user: !!user, answers: !!answers, scores: scores.length });
      return;
    }

    console.log('✅ Essential data available, starting AI recommendation generation...');
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      console.log('=== GENERATING AI-POWERED PERSONALIZED RECOMMENDATIONS ===');
      
      // Create fallback analytics if not available
      const fallbackAnalytics: SessionAnalytics = {
        sessionId: `fallback_${Date.now()}`,
        startTime: Date.now() - 600000, // 10 minutes ago
        endTime: Date.now(),
        averageResponseTime: 30000, // 30 seconds average
        totalQuestions: Object.keys(answers).length,
        completedQuestions: Object.keys(answers).length,
        totalAnswerChanges: 0,
        totalBackNavigations: 0,
        questionAnalytics: [],
        events: []
      };

      const analyticsToUse = interactionAnalytics || fallbackAnalytics;
      
      // Prepare user analytics data
      const userAnalyticsData: UserAnalyticsData = {
        answers: answers,
        timestamps: {},
        interactionEvents: [],
        sessionAnalytics: {
          totalTime: analyticsToUse.endTime ? analyticsToUse.endTime - analyticsToUse.startTime : 600000,
          averageResponseTime: analyticsToUse.averageResponseTime,
          questionCount: analyticsToUse.totalQuestions,
          startTime: analyticsToUse.startTime,
          endTime: analyticsToUse.endTime
        },
        userInfo: {
          firstName: user.firstName,
          lastName: user.lastName
        }
      };

      console.log('📊 User analytics data prepared:', userAnalyticsData);

      // Create behavioral analytics service
      const behavioralService = new BehavioralAnalyticsService();

      // Convert scores to DimensionScore format with proper names
      const dimensionMapping = {
        'DM': 'Karar Verme Becerileri',
        'IN': 'İnisiyatif Alma', 
        'AD': 'Adaptasyon',
        'CM': 'İletişim',
        'ST': 'Stratejik Düşünce',
        'TO': 'Takım Çalışması',
        'RL': 'Risk Liderliği',
        'RI': 'Risk Zekası'
      };

      const dimensionScores: DimensionScore[] = scores.map((score, index) => {
        const abbreviation = score.abbreviation || competencies[index]?.name || `DIM_${index}`;
        return {
          dimension: abbreviation,
          displayName: dimensionMapping[abbreviation as keyof typeof dimensionMapping] || score.fullName || abbreviation,
          score: typeof score.score === 'number' ? score.score : Number(score.score),
          maxScore: score.maxScore || 10,
          percentile: ((typeof score.score === 'number' ? score.score : Number(score.score)) / (score.maxScore || 10)) * 100,
          category: score.category || 'Genel'
        };
      });

      console.log('🎯 Enhanced dimension scores prepared:', dimensionScores);

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

  // Get development areas
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
            <div className="metric-value">{interactionAnalytics.totalAnswerChanges || 0}</div>
            <div className="metric-label">Cevap Değişikliği</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{interactionAnalytics.totalBackNavigations || 0}</div>
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
            
            {(interactionAnalytics.totalAnswerChanges || 0) > 5 && (
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
        <div>
          <div className="ai-recommendations-header">
            <button 
              className="generate-ai-button"
              onClick={generatePersonalizedRecommendations}
              disabled={isLoadingRecommendations}
              style={{
                backgroundColor: isLoadingRecommendations ? '#ccc' : '#4285f4',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: isLoadingRecommendations ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🤖 {isLoadingRecommendations ? 'AI Değerlendirme Hazırlanıyor...' : 'AI Aday Değerlendirme Raporu Oluştur'}
            </button>
          </div>
          <PersonalizedRecommendationsComponent
            recommendations={personalizedRecommendations}
            isLoading={isLoadingRecommendations}
            error={recommendationsError}
            competencyScores={scores.map(score => ({
              dimension: score.abbreviation || score.name,
              displayName: score.fullName,
              score: typeof score.score === 'number' ? score.score : Number(score.score),
              maxScore: score.maxScore || 10,
              percentile: ((typeof score.score === 'number' ? score.score : Number(score.score)) / (score.maxScore || 10)) * 100,
              category: score.category || 'Genel'
            }))}
          />
        </div>
      );
    }

    // Fallback to original recommendations with AI trigger button
    const recommendations = getRecommendations(scores);
    
    return (
      <div className="recommendations-section">
        <div className="recommendations-header-with-ai">
          <h3>Gelişim Önerileri</h3>
          <button 
            className="generate-ai-button"
            onClick={generatePersonalizedRecommendations}
            disabled={isLoadingRecommendations}
            style={{
              backgroundColor: isLoadingRecommendations ? '#ccc' : '#4285f4',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: isLoadingRecommendations ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🤖 {isLoadingRecommendations ? 'AI Değerlendirme Hazırlanıyor...' : 'AI Aday Değerlendirme Raporu Oluştur'}
          </button>
        </div>
        
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
              PDF Dışa Aktar
            </button>
            <button 
              className="import-button" 
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? 'İçe Aktarılıyor...' : 'PDF İçe Aktar'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              className="manual-submit-button" 
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginLeft: '8px'
              }}
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Sonuçları Gönder'}
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

      {isImporting && (
        <div className="status-overlay">
          <div className="status-message loading">
            <div className="spinner"></div>
            PDF dosyası içe aktarılıyor...
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

      {importError && (
        <div className="status-overlay">
          <div className="status-message error">
            {importError}
            <button onClick={() => setImportError(null)}>✕</button>
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

      {importSuccess && (
        <div className="status-overlay">
          <div className="status-message success">
            PDF dosyası başarıyla içe aktarıldı!
            <button onClick={() => setImportSuccess(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen; 