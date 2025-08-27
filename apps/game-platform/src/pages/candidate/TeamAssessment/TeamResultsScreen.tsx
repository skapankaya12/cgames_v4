import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { teamDimensions, getTeamEffectivenessLevel } from '../../../data/team';
import { AIAssistantChat } from '@cgames/ui-kit';
import './TeamResultsScreen.css';

interface TeamScores {
  communication: { score: number; percentage: number };
  shared_goals: { score: number; percentage: number };
  support_collaboration: { score: number; percentage: number };
  trust_transparency: { score: number; percentage: number };
  motivation: { score: number; percentage: number };
  overall?: { score: number; percentage: number };
}

const TeamResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scores, setScores] = useState<TeamScores | null>(null);
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
      const savedScores = sessionStorage.getItem('team-results');
      const savedCandidate = sessionStorage.getItem('team-candidate-data');
      
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

  const getOverallTeamScore = () => {
    if (!scores) return null;
    
    const dimensions = ['communication', 'shared_goals', 'support_collaboration', 'trust_transparency', 'motivation'];
    const avgPercentage = dimensions.reduce((sum, dim) => {
      return sum + (scores[dim as keyof TeamScores]?.percentage || 0);
    }, 0) / dimensions.length;
    
    return {
      percentage: Math.round(avgPercentage),
      ...getTeamEffectivenessLevel(avgPercentage)
    };
  };

  if (loading) {
    return (
      <div className="team-results-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Sonuçlarınız Hazırlanıyor...</h2>
          <p>Takım değerlendirme analiziniz işleniyor.</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="team-results-screen">
        <div className="error-container">
          <h2>Sonuçlar Bulunamadı</h2>
          <p>Değerlendirme sonuçlarınıza ulaşılamıyor. Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  const overallTeamScore = getOverallTeamScore();

  return (
    <div className="team-results-screen">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <div className="assessment-badge">👥</div>
          <h1>Takım Değerlendirme Sonuçları</h1>
          {candidateInfo && (
            <p className="candidate-info">
              {candidateInfo.firstName} {candidateInfo.lastName} • {candidateInfo.department}
            </p>
          )}
        </div>

        {/* Overall Team Effectiveness */}
        {overallTeamScore && (
          <div className="overall-score-card">
            <h2>Genel Takım Etkinliği</h2>
            <div className="score-circle" style={{ '--score-color': overallTeamScore.color } as any}>
              <div className="score-percentage">{overallTeamScore.percentage}%</div>
              <div className="score-level">{overallTeamScore.level}</div>
            </div>
            <p className="score-description">{overallTeamScore.description}</p>
          </div>
        )}

        {/* Team Radar Chart */}
        <div className="radar-chart-section">
          <h2>Takım Performans Radarı</h2>
          <div className="radar-container">
            <div className="radar-chart">
              <svg viewBox="0 0 400 400" className="radar-svg">
                {/* Grid circles */}
                {[1, 2, 3, 4, 5].map(level => (
                  <circle
                    key={level}
                    cx="200"
                    cy="200"
                    r={level * 30}
                    fill="none"
                    stroke="#e9ecef"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Grid lines */}
                {teamDimensions.map((_, index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const x2 = 200 + Math.cos(angle) * 150;
                  const y2 = 200 + Math.sin(angle) * 150;
                  return (
                    <line
                      key={index}
                      x1="200"
                      y1="200"
                      x2={x2}
                      y2={y2}
                      stroke="#e9ecef"
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* Data polygon */}
                <polygon
                  points={teamDimensions.map((dimension, index) => {
                    const score = scores[dimension.id as keyof TeamScores]?.percentage || 0;
                    const radius = (score / 100) * 150;
                    const angle = (index * 72 - 90) * (Math.PI / 180);
                    const x = 200 + Math.cos(angle) * radius;
                    const y = 200 + Math.sin(angle) * radius;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="rgba(107, 142, 35, 0.2)"
                  stroke="#6B8E23"
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {teamDimensions.map((dimension, index) => {
                  const score = scores[dimension.id as keyof TeamScores]?.percentage || 0;
                  const radius = (score / 100) * 150;
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const x = 200 + Math.cos(angle) * radius;
                  const y = 200 + Math.sin(angle) * radius;
                  return (
                    <circle
                      key={dimension.id}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={dimension.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
                
                {/* Labels */}
                {teamDimensions.map((dimension, index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const labelRadius = 170;
                  const x = 200 + Math.cos(angle) * labelRadius;
                  const y = 200 + Math.sin(angle) * labelRadius;
                  return (
                    <text
                      key={dimension.id}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="radar-label"
                      fontSize="12"
                      fill="#333"
                    >
                      {dimension.icon} {dimension.name}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Dimension Details */}
        <div className="dimensions-section">
          <h2>Detaylı Analiz</h2>
          <div className="dimensions-grid">
            {teamDimensions.map((dimension) => {
              const dimensionScore = scores[dimension.id as keyof TeamScores];
              if (!dimensionScore) return null;
              
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
                  
                  <div className="dimension-score">
                    <div className="score-bar-container">
                      <div 
                        className="score-bar" 
                        style={{ 
                          width: `${dimensionScore.percentage}%`,
                          backgroundColor: dimension.color 
                        }}
                      ></div>
                    </div>
                    <div className="score-details">
                      <span className="percentage">{dimensionScore.percentage}%</span>
                      <span className="score-value">{dimensionScore.score.toFixed(1)}/5.0</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="ai-assistant-section">
          <h2>🤖 AI İK Asistan</h2>
          <p>Takım etkinliği sonuçlarınız hakkında detaylı analiz ve iyileştirme önerileri için AI asistanımızla konuşabilirsiniz.</p>
          
          <AIAssistantChat
            scores={scores ? Object.entries(scores).filter(([key]) => key !== 'overall').map(([key, value]) => ({
              dimension: key,
              score: value.score,
              percentage: value.percentage
            })) : []}
            candidateName={candidateInfo ? `${candidateInfo.firstName} ${candidateInfo.lastName}` : 'Aday'}
            cvData={null}
            sessionId={`team-${Date.now()}`}
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

export default TeamResultsScreen;
