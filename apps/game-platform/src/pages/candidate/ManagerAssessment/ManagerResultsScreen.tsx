import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { managerDimensions, getManagerEffectivenessLevel } from '../../../data/manager';
import { AIAssistantChat } from '@cgames/ui-kit';
import './ManagerResultsScreen.css';

interface ManagerScores {
  communication: { score: number; percentage: number };
  feedback_culture: { score: number; percentage: number };
  team_development: { score: number; percentage: number };
  fairness: { score: number; percentage: number };
  motivation_leadership: { score: number; percentage: number };
  overall?: { score: number; percentage: number };
}

const ManagerResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scores, setScores] = useState<ManagerScores | null>(null);
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get scores from navigation state or session storage
    const scoresFromState = location.state?.scores;
    const candidateFromState = location.state?.submissionData?.candidateInfo;
    
    if (scoresFromState) {
      setScores(scoresFromState);
      setCandidateInfo(candidateFromState);
      setLoading(false);
    } else {
      // Try to get from session storage as fallback
      const savedScores = sessionStorage.getItem('manager-results');
      const savedCandidate = sessionStorage.getItem('manager-candidate-data');
      
      if (savedScores && savedCandidate) {
        try {
          setScores(JSON.parse(savedScores));
          setCandidateInfo(JSON.parse(savedCandidate));
          setLoading(false);
        } catch (error) {
          console.error('Failed to parse saved results:', error);
          handleNoResults();
        }
      } else {
        handleNoResults();
      }
    }
  }, [location.state]);

  const handleNoResults = () => {
    setLoading(false);
    setTimeout(() => {
      navigate('/thank-you');
    }, 3000);
  };

  const getOverallManagerScore = () => {
    if (!scores) return null;
    
    const dimensions = ['communication', 'feedback_culture', 'team_development', 'fairness', 'motivation_leadership'];
    const avgPercentage = dimensions.reduce((sum, dim) => {
      return sum + (scores[dim as keyof ManagerScores]?.percentage || 0);
    }, 0) / dimensions.length;
    
    return {
      percentage: Math.round(avgPercentage),
      ...getManagerEffectivenessLevel(avgPercentage)
    };
  };

  if (loading) {
    return (
      <div className="manager-results-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Sonuçlarınız Hazırlanıyor...</h2>
          <p>Yönetici değerlendirme analiziniz işleniyor.</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="manager-results-screen">
        <div className="error-container">
          <h2>Sonuçlar Bulunamadı</h2>
          <p>Değerlendirme sonuçlarınıza ulaşılamıyor. Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  const overallManagerScore = getOverallManagerScore();

  return (
    <div className="manager-results-screen">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <div className="assessment-badge">👔</div>
          <h1>Yönetici Değerlendirme Sonuçları</h1>
          {candidateInfo && (
            <p className="candidate-info">
              {candidateInfo.firstName} {candidateInfo.lastName} • {candidateInfo.department}
            </p>
          )}
        </div>

        {/* Overall Manager Effectiveness */}
        {overallManagerScore && (
          <div className="overall-score-card">
            <h2>Genel Yönetici Etkinliği</h2>
            <div className="score-circle" style={{ '--score-color': overallManagerScore.color } as any}>
              <div className="score-percentage">{overallManagerScore.percentage}%</div>
              <div className="score-level">{overallManagerScore.level}</div>
            </div>
            <p className="score-description">{overallManagerScore.description}</p>
          </div>
        )}

        {/* Leadership Bar Chart */}
        <div className="bar-chart-section">
          <h2>Liderlik Yetkinlikleri</h2>
          <div className="bar-chart-container">
            {managerDimensions.map((dimension, index) => {
              const dimensionScore = scores[dimension.id as keyof ManagerScores];
              if (!dimensionScore) return null;
              
              return (
                <div key={dimension.id} className="bar-item" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="bar-label">
                    <div className="bar-icon" style={{ color: dimension.color }}>
                      {dimension.icon}
                    </div>
                    <div className="bar-text">
                      <span className="bar-name">{dimension.name}</span>
                      <span className="bar-percentage">{dimensionScore.percentage}%</span>
                    </div>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${dimensionScore.percentage}%`,
                        backgroundColor: dimension.color
                      }}
                    ></div>
                  </div>
                  <div className="bar-score">
                    {dimensionScore.score.toFixed(1)}/5.0
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dimension Details */}
        <div className="dimensions-section">
          <h2>Detaylı Analiz</h2>
          <div className="dimensions-grid">
            {managerDimensions.map((dimension) => {
              const dimensionScore = scores[dimension.id as keyof ManagerScores];
              if (!dimensionScore) return null;
              
              const effectiveness = getManagerEffectivenessLevel(dimensionScore.percentage);
              
              return (
                <div key={dimension.id} className="dimension-card">
                  <div className="dimension-header">
                    <div className="dimension-icon" style={{ color: dimension.color }}>
                      {dimension.icon}
                    </div>
                    <div>
                      <h3>{dimension.name}</h3>
                      <p className="dimension-description">{dimension.description}</p>
                    </div>
                  </div>
                  
                  <div className="dimension-metrics">
                    <div className="metric">
                      <span className="metric-label">Puan</span>
                      <span className="metric-value">{dimensionScore.score.toFixed(1)}/5.0</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Yüzde</span>
                      <span className="metric-value">{dimensionScore.percentage}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Seviye</span>
                      <span className="metric-value" style={{ color: effectiveness.color }}>
                        {effectiveness.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="dimension-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${dimensionScore.percentage}%`,
                          backgroundColor: dimension.color 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths and Development Areas */}
        <div className="insights-section">
          <div className="insights-grid">
            <div className="insights-card strengths">
              <h3>🌟 Güçlü Yönler</h3>
              <ul>
                {managerDimensions
                  .filter(dim => scores[dim.id as keyof ManagerScores]?.percentage >= 70)
                  .map(dim => (
                    <li key={dim.id}>
                      <strong>{dim.name}</strong> - %{scores[dim.id as keyof ManagerScores]?.percentage}
                    </li>
                  ))
                }
                {managerDimensions.filter(dim => scores[dim.id as keyof ManagerScores]?.percentage >= 70).length === 0 && (
                  <li>Tüm alanlarda gelişim fırsatları mevcut</li>
                )}
              </ul>
            </div>
            
            <div className="insights-card development">
              <h3>📈 Gelişim Alanları</h3>
              <ul>
                {managerDimensions
                  .filter(dim => scores[dim.id as keyof ManagerScores]?.percentage < 70)
                  .sort((a, b) => 
                    (scores[a.id as keyof ManagerScores]?.percentage || 0) - 
                    (scores[b.id as keyof ManagerScores]?.percentage || 0)
                  )
                  .slice(0, 3)
                  .map(dim => (
                    <li key={dim.id}>
                      <strong>{dim.name}</strong> - %{scores[dim.id as keyof ManagerScores]?.percentage}
                    </li>
                  ))
                }
                {managerDimensions.filter(dim => scores[dim.id as keyof ManagerScores]?.percentage < 70).length === 0 && (
                  <li>Tüm alanlar mükemmel seviyede!</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="ai-assistant-section">
          <h2>🤖 AI İK Asistan</h2>
          <p>Yönetici etkinliği sonuçlarınız hakkında detaylı analiz ve liderlik geliştirme önerileri için AI asistanımızla konuşabilirsiniz.</p>
          
          <AIAssistantChat
            scores={scores ? Object.entries(scores).filter(([key]) => key !== 'overall').map(([key, value]) => ({
              dimension: key,
              score: value.score,
              percentage: value.percentage
            })) : []}
            candidateName={candidateInfo ? `${candidateInfo.firstName} ${candidateInfo.lastName}` : 'Aday'}
            cvData={null}
            sessionId={`manager-${Date.now()}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button 
            className="action-button primary"
            onClick={() => window.print()}
          >
            📄 Sonuçları Yazdır
          </button>
          
          <button 
            className="action-button secondary"
            onClick={() => navigate('/thank-you')}
          >
            ✅ Tamamla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerResultsScreen;
