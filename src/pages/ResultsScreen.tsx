import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, competencies } from '../data/questions';
import type { SessionAnalytics } from '../services/InteractionTracker';
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

const ResultsScreen = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [interactionAnalytics, setInteractionAnalytics] = useState<SessionAnalytics | null>(null);

  // Direct Google Sheets API endpoint
  const API_URL = `https://script.google.com/macros/s/AKfycbwDRSbngy9nVmclxjU_P9UeOR5TpNSpuHMgm--TYi653LOEWZx51K8SJ0yhBOjGVvJC/exec`;

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
          // Removed interactionAnalytics to keep sheets separate
        };
        
        try {
          // Use only the Image method which works reliably
          const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
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

      // Only submit automatically once, and only if not already submitted
      if (!submitSuccess) {
        setTimeout(() => {
          submitResults();
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing test data:', error);
      setSubmitError('Veriler işlenirken bir sorun oluştu. Lütfen testi yeniden başlatın.');
    }
  }, [navigate, API_URL, user]);

  const handleRestart = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleManualSubmit = () => {
    if (!user || !answers || !scores.length) {
      setSubmitError('Veriler eksik, yeniden başlatmayı deneyin');
      return;
    }
    
    // Prevent duplicate submissions
    if (submitSuccess || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Create a new window/tab for the form submission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = API_URL;
    form.target = '_blank';
    
    // Add data as form field
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'data';
    hiddenField.value = JSON.stringify({
      user,
      answers,
      competencyScores: scores
      // Removed interactionAnalytics to keep sheets separate
    });
    form.appendChild(hiddenField);
    
    // Add form to document body and submit
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Mark as successful after a delay
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const getScorePercentage = (score: number, maxScore: number): number => {
    return Math.round((score / maxScore) * 100);
  };

  const getScoreLevel = (percentage: number): string => {
    if (percentage >= 80) return "Üstün";
    if (percentage >= 60) return "İyi";
    if (percentage >= 40) return "Orta";
    return "Gelişim Alanı";
  };

  const getScoreLevelColor = (percentage: number): string => {
    if (percentage >= 80) return "#00ff88";
    if (percentage >= 60) return "#00bfff";
    if (percentage >= 40) return "#ffaa00";
    return "#ff6b6b";
  };

  if (!user) return null;

  // Calculate overall performance
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((sum, comp) => sum + getScorePercentage(comp.score, comp.maxScore), 0) / scores.length) : 0;
  const topCompetencies = scores.slice(0, 3);
  const developmentAreas = scores.slice(-2);

  // Group competencies by category
  const competenciesByCategory = scores.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as {[key: string]: CompetencyScore[]});

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Sonuçlar</h1>
          <p className="dashboard-subtitle">Kaptan {user?.firstName}, göreviniz tamamlandı! İşte detaylı performans analiziniz:</p>
        </div>
        <div className="header-actions">
          {!submitSuccess && (
            <button className="submit-btn" onClick={handleManualSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Gönderiliyor...' : 'Sonuçları Kaydet'}
            </button>
          )}
          <button className="restart-btn" onClick={handleRestart}>
            Yeni Test Başlat
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {isSubmitting && (
        <div className="status-message loading">
          <div className="spinner"></div>
          Sonuçlarınız kaydediliyor...
        </div>
      )}

      {submitError && (
        <div className="status-message error">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="status-message success">
          Sonuçlarınız başarıyla kaydedildi!
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Overall Performance Card */}
        <div className="dashboard-card overview-card">
          <div className="card-header">
            <h3>Genel Performans</h3>
            <div className="overall-score" style={{ color: getScoreLevelColor(overallScore) }}>
              {overallScore}%
            </div>
          </div>
          <div className="card-content">
            <div className="score-breakdown">
              <div className="score-item">
                <span className="label">Seviye:</span>
                <span className="value" style={{ color: getScoreLevelColor(overallScore) }}>
                  {getScoreLevel(overallScore)}
                </span>
              </div>
              <div className="score-item">
                <span className="label">Toplam Soru:</span>
                <span className="value">{questions.length}</span>
              </div>
              <div className="score-item">
                <span className="label">Değerlendirilen Alan:</span>
                <span className="value">{scores.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Competencies Card */}
        <div className="dashboard-card top-competencies-card">
          <div className="card-header">
            <h3> En Güçlü Yetkinlikler</h3>
          </div>
          <div className="card-content">
            <div className="competency-ranking">
              {topCompetencies.map((comp, index) => {
                const percentage = getScorePercentage(comp.score, comp.maxScore);
                return (
                  <div key={comp.name} className="ranking-item">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="comp-info">
                      <div className="comp-name">{comp.fullName}</div>
                      <div className="comp-code">({comp.abbreviation})</div>
                    </div>
                    <div className="comp-score" style={{ color: getScoreLevelColor(percentage) }}>
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Development Areas Card */}
        <div className="dashboard-card development-card">
          <div className="card-header">
            <h3>Gelişim Alanları</h3>
          </div>
          <div className="card-content">
            <div className="development-list">
              {developmentAreas.map((comp) => {
                const percentage = getScorePercentage(comp.score, comp.maxScore);
                return (
                  <div key={comp.name} className="development-item">
                    <div className="comp-info">
                      <div className="comp-name">{comp.fullName}</div>
                      <div className="comp-insight">{getInsight(comp.abbreviation, comp.score)}</div>
                    </div>
                    <div className="comp-score" style={{ color: getScoreLevelColor(percentage) }}>
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.entries(competenciesByCategory).map(([category, comps]) => (
          <div key={category} className="dashboard-card category-card">
            <div className="card-header">
              <h3>{category.charAt(0).toUpperCase() + category.slice(1)} Yetkinlikleri</h3>
            </div>
            <div className="card-content">
              <div className="category-competencies">
                {comps.map((comp) => {
                  const percentage = getScorePercentage(comp.score, comp.maxScore);
                  return (
                    <div key={comp.name} className="category-comp-item">
                      <div className="comp-header">
                        <span className="comp-name">{comp.fullName}</span>
                        <span className="comp-percentage" style={{ color: getScoreLevelColor(percentage) }}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
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
          </div>
        ))}

        {/* Analytics Card */}
        {interactionAnalytics && (
          <div className="dashboard-card analytics-card">
            <div className="card-header">
              <h3> Davranış Analizi</h3>
            </div>
            <div className="card-content">
              <div className="analytics-grid">
                <div className="analytics-metric">
                  <div className="metric-value">{formatTime(interactionAnalytics.averageResponseTime)}</div>
                  <div className="metric-label">Ortalama Yanıt Süresi</div>
                </div>
                <div className="analytics-metric">
                  <div className="metric-value">{interactionAnalytics.totalAnswerChanges}</div>
                  <div className="metric-label">Cevap Değişikliği</div>
                </div>
                <div className="analytics-metric">
                  <div className="metric-value">{interactionAnalytics.totalBackNavigations}</div>
                  <div className="metric-label">Geri Dönüş</div>
                </div>
              </div>
              
              {/* Decision Style */}
              <div className="decision-style-section">
                <h4>Karar Verme Tarzınız</h4>
                <div className="decision-insights">
                  {interactionAnalytics.averageResponseTime < 30000 ? (
                    <div className="insight-badge quick">⚡ Hızlı Karar Verici</div>
                  ) : interactionAnalytics.averageResponseTime > 60000 ? (
                    <div className="insight-badge deliberate"> Düşünceli Karar Verici</div>
                  ) : (
                    <div className="insight-badge balanced"> Dengeli Karar Verici</div>
                  )}
                  
                  {interactionAnalytics.totalAnswerChanges > 5 && (
                    <div className="insight-badge adaptive"> Adaptif Düşünür</div>
                  )}
                  
                  {interactionAnalytics.totalBackNavigations > 2 && (
                    <div className="insight-badge thorough"> Kapsamlı Değerlendirici</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Insights Card */}
        <div className="dashboard-card insights-card">
          <div className="card-header">
            <h3> Detaylı İçgörüler</h3>
          </div>
          <div className="card-content">
            <div className="insights-list">
              {topCompetencies.slice(0, 2).map((comp) => (
                <div key={comp.name} className="insight-item">
                  <div className="insight-header">
                    <span className="insight-icon"></span>
                    <span className="insight-title">{comp.fullName}</span>
                  </div>
                  <p className="insight-text">{getInsight(comp.abbreviation, comp.score)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen; 