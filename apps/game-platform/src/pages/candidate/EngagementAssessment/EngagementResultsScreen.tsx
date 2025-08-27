import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { engagementDimensions } from '../../../data/engagement';
import { AIAssistantChat } from '@cgames/ui-kit';
import './EngagementResultsScreen.css';

interface EngagementScores {
  emotional: { score: number; percentage: number; subdimensions?: any };
  continuance: { score: number; percentage: number; subdimensions?: any };
  normative: { score: number; percentage: number; subdimensions?: any };
}

const EngagementResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scores, setScores] = useState<EngagementScores | null>(null);
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
      const savedScores = sessionStorage.getItem('engagement-results');
      const savedCandidate = sessionStorage.getItem('engagement-candidate-data');
      
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
    // Could redirect to a "no results found" page or back to start
    setTimeout(() => {
      navigate('/thank-you');
    }, 3000);
  };

  const getCommitmentLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Çok Yüksek', color: '#2ECC71', description: 'Güçlü bağlılık' };
    if (percentage >= 65) return { level: 'Yüksek', color: '#27AE60', description: 'İyi düzeyde bağlılık' };
    if (percentage >= 50) return { level: 'Orta', color: '#F39C12', description: 'Orta düzeyde bağlılık' };
    if (percentage >= 35) return { level: 'Düşük', color: '#E67E22', description: 'Gelişim gerekli' };
    return { level: 'Çok Düşük', color: '#E74C3C', description: 'Acil dikkat gerekli' };
  };

  const getOverallEngagement = () => {
    if (!scores) return null;
    
    const avgPercentage = (scores.emotional.percentage + scores.continuance.percentage + scores.normative.percentage) / 3;
    return {
      percentage: Math.round(avgPercentage),
      ...getCommitmentLevel(avgPercentage)
    };
  };

  if (loading) {
    return (
      <div className="engagement-results-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Sonuçlarınız Hazırlanıyor...</h2>
          <p>Çalışan bağlılığı analiziniz işleniyor.</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="engagement-results-screen">
        <div className="error-container">
          <h2>Sonuçlar Bulunamadı</h2>
          <p>Değerlendirme sonuçlarınıza ulaşılamıyor. Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  const overallEngagement = getOverallEngagement();

  return (
    <div className="engagement-results-screen">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <div className="assessment-badge">💼</div>
          <h1>Çalışan Bağlılığı Değerlendirme Sonuçları</h1>
          {candidateInfo && (
            <p className="candidate-info">
              {candidateInfo.firstName} {candidateInfo.lastName} • {candidateInfo.department}
            </p>
          )}
        </div>

        {/* Overall Score */}
        {overallEngagement && (
          <div className="overall-score-card">
            <h2>Genel Bağlılık Düzeyi</h2>
            <div className="score-circle" style={{ '--score-color': overallEngagement.color } as any}>
              <div className="score-percentage">{overallEngagement.percentage}%</div>
              <div className="score-level">{overallEngagement.level}</div>
            </div>
            <p className="score-description">{overallEngagement.description}</p>
          </div>
        )}

        {/* Dimension Breakdown */}
        <div className="dimensions-section">
          <h2>Bağlılık Boyutları</h2>
          <div className="dimensions-grid">
            {engagementDimensions.map((dimension) => {
              const dimensionScore = scores[dimension.id as keyof EngagementScores];
              const commitmentLevel = getCommitmentLevel(dimensionScore.percentage);
              
              return (
                <div key={dimension.id} className="dimension-card">
                  <div className="dimension-header">
                    <h3>{dimension.name}</h3>
                    <p className="dimension-description">{dimension.description}</p>
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
                      <span className="level" style={{ color: commitmentLevel.color }}>
                        {commitmentLevel.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="dimension-insights">
                    <div className="score-value">
                      Puan: {dimensionScore.score.toFixed(1)}/5.0
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
          <p>Sonuçlarınız hakkında detaylı analiz ve öneriler için AI asistanımızla konuşabilirsiniz.</p>
          
          <AIAssistantChat
            scores={scores ? Object.entries(scores).map(([key, value]) => ({
              dimension: key,
              score: value.score,
              maxScore: 5,
              percentile: value.percentage
            })) : []}
            candidateName={candidateInfo ? `${candidateInfo.firstName} ${candidateInfo.lastName}` : 'Aday'}
            cvData={undefined}
            sessionId={`engagement-${Date.now()}`}
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

export default EngagementResultsScreen;
