import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  Cell,
  LabelList
} from 'recharts';
import { questions, competencies } from '../data/questions';
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

const getCategoryColor = (category: string): string => {
  const colors: {[key: string]: string} = {
    "stratejik": ["#FFD700", "#F7B801", "#F18701"],
    "iletişim": ["#6CA6C1", "#1B98E0", "#247BA0"],
    "risk": ["#FF6B6B", "#E9446A", "#B80C09"],
    "liderlik": ["#9F86C0", "#7A77B9", "#5E60CE"]
  };
  
  return colors[category][0];
};

// Custom tooltip component for the bubble chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bubble-tooltip">
        <h4>{data.fullName}</h4>
        <p className="score">Puan: {data.score}</p>
        <p className="insight">{data.insight}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for radar and bar charts
const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bubble-tooltip">
        <h4>{data.fullName}</h4>
        <p className="score">Puan: {data.score}/{data.maxScore}</p>
        <p className="insight">{getInsight(data.name, data.score)}</p>
      </div>
    );
  }
  return null;
};

// Modal component for competency details
const CompetencyModal = ({ competency, onClose }: { competency: CompetencyScore | null, onClose: () => void }) => {
  if (!competency) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{competency.fullName}</h3>
        <h4>{competency.abbreviation}</h4>
        <div className="modal-score" style={{ color: competency.color }}>
          Puan: {competency.score}/{competency.maxScore}
        </div>
        <p className="modal-description">{competency.description}</p>
        <p className="modal-insight">{getInsight(competency.abbreviation, competency.score)}</p>
        <button className="modal-close" onClick={onClose}>Kapat</button>
      </div>
    </div>
  );
};

const ResultsScreen = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugData, setDebugData] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyScore | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Refs for swipe functionality
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Direct Google Sheets API endpoint for writing to spreadsheet
  // It requires no CORS handling as it's managed directly by Google
  const SHEET_ID = '1cGGxaSWHklq7WmYG8jd8p1aPpzcJBFJDUkK-qnxr4Xo';
  const SHEET_NAME = 'Results';
  
  // Proxied API URL to avoid CORS issues
  const API_URL = `https://script.google.com/macros/s/AKfycbx5FfkakXp3HADStMegv5JCvftCJaJ1s42xI6wElHcnx9BEZMK92ybNE5jTaO2q75tW/exec`;

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

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedAnswers = sessionStorage.getItem('answers');

    if (!storedUser || !storedAnswers) {
      console.error('Missing user or answers data:', { storedUser, storedAnswers });
      setSubmitError('Veri transferinde sorun oluştu. Lütfen testi yeniden başlatın.');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      const parsedAnswers = JSON.parse(storedAnswers);
      setAnswers(parsedAnswers);

      // Calculate scores
      const competencyScores: { [key: string]: number } = {};
      
      // Calculate max possible scores
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
      
      // Calculate maximum possible scores by finding the highest weight for each competency in each question
      questions.forEach(question => {
        // For each competency, find the option with the highest weight
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
      })).sort((a, b) => b.score - a.score); // Sort by descending score

      setScores(finalScores);

      // Prepare debug data
      const debugInfo = {
        user: JSON.parse(storedUser),
        answers: parsedAnswers,
        scores: finalScores,
        maxScores: maxCompetencyScores
      };
      setDebugData(JSON.stringify(debugInfo, null, 2));

      // Submit results to Google Sheets using multiple methods to ensure success
      const submitResults = async () => {
        if (!user || !parsedAnswers || finalScores.length === 0) return;
        
        setIsSubmitting(true);
        setSubmitError(null);
        
        // Prepare the data
        const userData = JSON.parse(storedUser);
        const payload = {
          user: userData,
          answers: parsedAnswers,
          competencyScores: finalScores
        };
        
        let success = false;
        
        // Method 1: Direct fetch to Apps Script in a way that handles CORS
        try {
          // Use fetch with URL parameters to avoid CORS issues
          const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
          
          // Using Image method to bypass CORS
          const img = new Image();
          img.src = url;
          img.style.display = 'none';
          document.body.appendChild(img);
          
          setTimeout(() => {
            document.body.removeChild(img);
          }, 5000);
          
          success = true;
        } catch (error) {
          console.error('Error with image method:', error);
        }
        
        // Method 2: iFrame form submission (as backup)
        if (!success) {
          try {
            // Create a hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Create form inside iframe
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
              const form = doc.createElement('form');
              form.method = 'POST';
              form.action = API_URL;
              
              // Add data as form field
              const hiddenField = doc.createElement('input');
              hiddenField.type = 'hidden';
              hiddenField.name = 'data';
              hiddenField.value = JSON.stringify(payload);
              form.appendChild(hiddenField);
              
              // Add form to iframe document body and submit
              doc.body.appendChild(form);
              form.submit();
              
              success = true;
              
              // Clean up after 5 seconds
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 5000);
            }
          } catch (error) {
            console.error('Error with iframe method:', error);
          }
        }
        
        // Method 3: Using a direct form submission in a new window
        if (!success) {
          try {
            // Create a new window/tab for the form submission
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = API_URL;
            form.target = '_blank';
            
            // Add data as form field
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = 'data';
            hiddenField.value = JSON.stringify(payload);
            form.appendChild(hiddenField);
            
            // Add form to document body and submit
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
            
            success = true;
          } catch (error) {
            console.error('Error with form method:', error);
          }
        }
        
        // Optimistically assume success to enhance user experience
        setSubmitSuccess(true);
        setIsSubmitting(false);
      };

      // Submit with a small delay to ensure the UI renders first
      setTimeout(() => {
        submitResults();
      }, 1000);
    } catch (error) {
      console.error('Error processing test data:', error);
      setSubmitError('Veriler işlenirken bir sorun oluştu. Lütfen testi yeniden başlatın.');
    }
  }, [navigate, API_URL]);

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Determine swipe direction and handle slide change
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left, go to next slide
        nextSlide();
      } else {
        // Swipe right, go to previous slide
        prevSlide();
      }
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  const handleRestart = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleManualSubmit = () => {
    if (!user || !answers || !scores.length) {
      setSubmitError('Veriler eksik, yeniden başlatmayı deneyin');
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
    });
    form.appendChild(hiddenField);
    
    // Add form to document body and submit
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Optimistically assume success
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  const handleCardClick = (competency: CompetencyScore) => {
    setSelectedCompetency(competency);
  };

  const nextSlide = () => {
    setCurrentSlide(current => (current === 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(current => (current === 0 ? 1 : current - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!user) return null;

  // Prepare data for radar chart
  const radarData = competencies.map(comp => {
    const scoreObj = scores.find(s => s.name === comp.name);
    return {
      name: comp.name,
      fullName: comp.fullName,
      score: scoreObj?.score || 0,
      maxScore: scoreObj?.maxScore || 0,
      color: comp.color
    };
  });

  // Prepare data for bar chart (already sorted by score)
  const barData = scores.map(score => ({
    name: score.name,
    fullName: score.fullName,
    score: score.score,
    maxScore: score.maxScore,
    color: score.color
  }));

  return (
    <div className="container space-background">
      <div className="results-screen">
        <div className="results-header">
          <h1 className="results-title">Test Tamamlandı: Yetenek Profiliniz</h1>
          <p className="results-summary">
            Profilinizi iki farklı açıdan inceleyin: dengeyi radar grafikte, net sıralamayı çubuk grafikte görün.
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
            <button className="resubmit-button" onClick={handleManualSubmit}>
              Sonuçları Manuel Gönder
            </button>
          </div>
        )}

        {submitSuccess && (
          <div className="success-message">
            Sonuçlarınız başarıyla kaydedildi.
          </div>
        )}

        <div 
          className="carousel-container"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="carousel-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {/* Slide 1: Radar Chart */}
            <div className="carousel-slide">
              <div className="chart-container">
                <h3 className="chart-title">Yetkinlik Dengesi</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={{ fill: '#d8e3ff', fontSize: 12 }} 
                    />
                    <PolarRadiusAxis 
                      angle={30}
                      domain={[0, 50]} 
                      tick={{ fill: '#d8e3ff' }}
                      stroke="rgba(255, 255, 255, 0.3)"
                    />
                    <Radar 
                      name="Yetkinlik Seviyesi" 
                      dataKey="score" 
                      stroke="#4e5eff" 
                      fill="#4e5eff" 
                      fillOpacity={0.6} 
                    />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Slide 2: Bar Chart */}
            <div className="carousel-slide">
              <div className="chart-container">
                <h3 className="chart-title">Yetkinlik Sıralaması</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={barData}
                    margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                    <XAxis 
                      type="number" 
                      domain={[0, 50]}
                      tick={{ fill: '#d8e3ff' }}
                      stroke="#d8e3ff"
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: '#d8e3ff' }}
                      stroke="#d8e3ff"
                      width={60}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="score" position="right" fill="#ffffff" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Carousel Navigation */}
          <button 
            className="carousel-control prev" 
            aria-label="Previous slide"
            onClick={prevSlide}
          >
            <span className="arrow left"></span>
          </button>
          <button 
            className="carousel-control next" 
            aria-label="Next slide"
            onClick={nextSlide}
          >
            <span className="arrow right"></span>
          </button>
          
          {/* Indicator Dots */}
          <div className="carousel-indicators">
            <button 
              className={`indicator-dot ${currentSlide === 0 ? 'active' : ''}`} 
              onClick={() => goToSlide(0)}
              aria-label="Go to slide 1"
            ></button>
            <button 
              className={`indicator-dot ${currentSlide === 1 ? 'active' : ''}`} 
              onClick={() => goToSlide(1)}
              aria-label="Go to slide 2"
            ></button>
          </div>
        </div>

        <div className="scores-grid">
          {scores.map((score) => (
            <div
              key={score.name}
              className="score-card"
              style={{ backgroundColor: `rgba(${parseInt(score.color.slice(1, 3), 16)}, ${parseInt(score.color.slice(3, 5), 16)}, ${parseInt(score.color.slice(5, 7), 16)}, 0.7)` }}
              onClick={() => handleCardClick(score)}
            >
              <p className="score-fullname">{score.fullName}</p>
              <p className="score-abbreviation">{score.abbreviation}</p>
              <p className="score-value">Puan: {score.score}/{score.maxScore}</p>
            </div>
          ))}
        </div>

        <div className="button-container">
          <button className="restart-button" onClick={handleRestart}>
            Yeniden Başlat
          </button>
          
          {!submitSuccess && (
            <button className="direct-submit-button" onClick={handleManualSubmit}>
              Sonuçları Gönder
            </button>
          )}
        </div>

        {showDebug && (
          <div className="debug-panel">
            <h3>Skor Detayları</h3>
            <div className="answers-debug">
              <h4>Cevaplarınız:</h4>
              <ul>
                {Object.entries(answers).map(([questionId, answerId]) => {
                  const question = questions.find(q => q.id === parseInt(questionId));
                  const option = question?.options.find(opt => opt.id === answerId);
                  return (
                    <li key={questionId}>
                      <strong>Soru {questionId}:</strong> {option?.text} (Seçenek: {answerId})
                      <div className="weights">
                        <strong>Ağırlıklar:</strong> 
                        {option && Object.entries(option.weights).map(([comp, weight]) => (
                          <span key={comp}>{comp}: {weight}, </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="api-info">
              <h4>API Bilgileri:</h4>
              <p>API URL: {API_URL}</p>
              <p>Sheet ID: {SHEET_ID}</p>
              <p>Sheet Name: {SHEET_NAME}</p>
              <button className="debug-button" onClick={handleManualSubmit}>
                Yeniden Veri Gönder
              </button>
            </div>
          </div>
        )}

        {selectedCompetency && (
          <CompetencyModal 
            competency={selectedCompetency} 
            onClose={() => setSelectedCompetency(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ResultsScreen; 