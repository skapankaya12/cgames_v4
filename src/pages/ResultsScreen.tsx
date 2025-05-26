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
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [interactionAnalytics, setInteractionAnalytics] = useState<SessionAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const topCompetencies = scores.slice(0, 3);
  const developmentAreas = scores.slice(-2);

  return (
    <div className="dialog-game-container">
      <video 
        ref={videoRef}
        className={`background-video ${videoLoaded ? 'loaded' : ''}`}
        src="/identityscreen.mp4"
        playsInline
        muted
        loop
        autoPlay
        onLoadedData={() => {
          setVideoLoaded(true);
          setVideoError(false);
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.error('Video autoplay failed:', error);
            });
          }
        }}
        onError={() => {
          console.error('Video failed to load');
          setVideoError(true);
        }}
      >
        Your browser does not support the video tag.
      </video>
      
      {!videoLoaded && !videoError && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {videoError && (
        <div className="video-error">
          <p>Video yüklenemedi</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Yeniden Dene
          </button>
        </div>
      )}

      <div className="hero-section">
        <div className="hero-content">
          <div className="results-container">
            <div className="results-box">
              <div className="results-header">
                <h1 className="results-title">Görev Tamamlandı, Kaptan {user.firstName}!</h1>
                <p className="results-subtitle">
                  Galaksiler arası yolculuğunuz sona erdi. İşte liderlik profiliniz:
                </p>
              </div>

              {isSubmitting && (
                <div className="notification">
                  <div className="spinner"></div>
                  Sonuçlarınız kaydediliyor...
                </div>
              )}

              {submitError && (
                <div className="error-message">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="success-message">
                  Sonuçlarınız başarıyla kaydedildi.
                </div>
              )}

              <div className="competency-sections">
                <div className="section">
                  <h3 className="section-title">🌟 En Güçlü Yetkinlikleriniz</h3>
                  <div className="competency-list">
                    {topCompetencies.map((competency, index) => {
                      const percentage = getScorePercentage(competency.score, competency.maxScore);
                      const level = getScoreLevel(percentage);
                      const levelColor = getScoreLevelColor(percentage);
                      
                      return (
                        <div key={competency.name} className="competency-item">
                          <div className="competency-header">
                            <span className="competency-rank">#{index + 1}</span>
                            <div className="competency-info">
                              <h4 className="competency-name">{competency.fullName}</h4>
                              <p className="competency-code">({competency.abbreviation})</p>
                            </div>
                            <div className="competency-score">
                              <span className="score-percentage" style={{ color: levelColor }}>
                                {percentage}%
                              </span>
                              <span className="score-level" style={{ color: levelColor }}>
                                {level}
                              </span>
                            </div>
                          </div>
                          <p className="competency-description">{competency.description}</p>
                          <p className="competency-insight">{getInsight(competency.abbreviation, competency.score)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="section">
                  <h3 className="section-title">🚀 Gelişim Alanlarınız</h3>
                  <div className="competency-list">
                    {developmentAreas.map((competency) => {
                      const percentage = getScorePercentage(competency.score, competency.maxScore);
                      const level = getScoreLevel(percentage);
                      const levelColor = getScoreLevelColor(percentage);
                      
                      return (
                        <div key={competency.name} className="competency-item development">
                          <div className="competency-header">
                            <div className="competency-info">
                              <h4 className="competency-name">{competency.fullName}</h4>
                              <p className="competency-code">({competency.abbreviation})</p>
                            </div>
                            <div className="competency-score">
                              <span className="score-percentage" style={{ color: levelColor }}>
                                {percentage}%
                              </span>
                              <span className="score-level" style={{ color: levelColor }}>
                                {level}
                              </span>
                            </div>
                          </div>
                          <p className="competency-description">{competency.description}</p>
                          <p className="competency-insight">{getInsight(competency.abbreviation, competency.score)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interaction Analytics Section */}
                {interactionAnalytics && (
                  <div className="section">
                    <div className="analytics-header">
                      <h3 className="section-title">📊 Performans Analizi</h3>
                      <button 
                        className="analytics-toggle"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                      >
                        {showAnalytics ? 'Gizle' : 'Göster'}
                      </button>
                    </div>
                    
                    {showAnalytics && (
                      <div className="analytics-content">
                        <div className="analytics-summary">
                          <div className="analytics-item">
                            <span className="analytics-label">Ortalama Yanıt Süresi:</span>
                            <span className="analytics-value">{formatTime(interactionAnalytics.averageResponseTime)}</span>
                          </div>
                          <div className="analytics-item">
                            <span className="analytics-label">Toplam Cevap Değişikliği:</span>
                            <span className="analytics-value">{interactionAnalytics.totalAnswerChanges}</span>
                          </div>
                          <div className="analytics-item">
                            <span className="analytics-label">Geri Dönüş Sayısı:</span>
                            <span className="analytics-value">{interactionAnalytics.totalBackNavigations}</span>
                          </div>
                        </div>

                        {/* Slowest Questions */}
                        {interactionAnalytics.questionAnalytics.length > 0 && (
                          <div className="analytics-section">
                            <h4 className="analytics-subtitle">⏱️ En Uzun Düşündüğünüz Sorular</h4>
                            <div className="question-times">
                              {interactionAnalytics.questionAnalytics
                                .filter(q => q.totalTime && q.totalTime > 0)
                                .sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
                                .slice(0, 3)
                                .map((q, index) => (
                                  <div key={q.questionId} className="question-time-item">
                                    <span className="question-rank">#{index + 1}</span>
                                    <span className="question-title">{getQuestionTitle(q.questionId)}</span>
                                    <span className="question-time">{formatTime(q.totalTime!)}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Revised Questions */}
                        {interactionAnalytics.questionAnalytics.some(q => q.revisions.length > 0) && (
                          <div className="analytics-section">
                            <h4 className="analytics-subtitle">🔄 Cevabını Değiştirdiğin Sorular</h4>
                            <div className="revised-questions">
                              {interactionAnalytics.questionAnalytics
                                .filter(q => q.revisions.length > 0)
                                .map(q => (
                                  <div key={q.questionId} className="revised-question-item">
                                    <span className="question-title">{getQuestionTitle(q.questionId)}</span>
                                    <span className="revision-count">{q.revisions.length} değişiklik</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Decision Style Insight */}
                        <div className="analytics-section">
                          <h4 className="analytics-subtitle">🧠 Karar Verme Tarzınız</h4>
                          <div className="decision-style">
                            {interactionAnalytics.averageResponseTime < 30000 ? (
                              <p className="style-insight quick">
                                ⚡ <strong>Hızlı Karar Verici:</strong> Sorulara hızlı yanıt veriyorsunuz. Bu, güçlü sezgileriniz ve hızlı analiz yeteneğiniz olduğunu gösterir.
                              </p>
                            ) : interactionAnalytics.averageResponseTime > 60000 ? (
                              <p className="style-insight deliberate">
                                🤔 <strong>Düşünceli Karar Verici:</strong> Kararlarınızı dikkatlice değerlendiriyorsunuz. Bu, analitik düşünce yapınızı ve detaylara önem verdiğinizi gösterir.
                              </p>
                            ) : (
                              <p className="style-insight balanced">
                                ⚖️ <strong>Dengeli Karar Verici:</strong> Hız ve dikkat arasında iyi bir denge kuruyorsunuz. Bu, esnek karar verme yeteneğinizi gösterir.
                              </p>
                            )}
                            
                            {interactionAnalytics.totalAnswerChanges > 5 && (
                              <p className="style-insight adaptive">
                                🔄 <strong>Adaptif Düşünür:</strong> Cevaplarınızı gözden geçirme eğiliminiz, öz-farkındalığınızı ve sürekli iyileştirme yaklaşımınızı gösterir.
                              </p>
                            )}
                            
                            {interactionAnalytics.totalBackNavigations > 2 && (
                              <p className="style-insight thorough">
                                🔍 <strong>Kapsamlı Değerlendirici:</strong> Önceki sorulara geri dönmeniz, bütünsel düşünme yeteneğinizi ve tutarlılığa verdiğiniz önemi gösterir.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="action-section">
                <div className="button-container">
                  {!submitSuccess && (
                    <button className="submit-button" onClick={handleManualSubmit} disabled={isSubmitting}>
                      {isSubmitting ? 'Gönderiliyor...' : 'Sonuçları Gönder'}
                    </button>
                  )}
                  <button className="restart-button" onClick={handleRestart}>
                    Yeni Görev Başlat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">Cognitive Games. All rights reserved</p>
      </div>
    </div>
  );
};

export default ResultsScreen; 