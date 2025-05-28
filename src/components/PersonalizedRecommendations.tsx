import React from 'react';
import type { PersonalizedRecommendations, RecommendationItem } from '../types/Recommendations';
import '../styles/PersonalizedRecommendations.css';

interface PersonalizedRecommendationsProps {
  recommendations: PersonalizedRecommendations | null;
  isLoading: boolean;
  error?: string | null;
}

const PersonalizedRecommendationsComponent: React.FC<PersonalizedRecommendationsProps> = ({
  recommendations,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="recommendations-section">
        <h3>🤖 AI Destekli Aday Değerlendirme Raporu</h3>
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Google AI ile aday değerlendirme raporu hazırlanıyor...</p>
          <small>Yetkinlik skorları ve davranış kalıpları analiz ediliyor...</small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-section">
        <h3>🤖 AI Destekli Aday Değerlendirme Raporu</h3>
        <div className="recommendations-error">
          <p>AI değerlendirme raporu yüklenirken bir hata oluştu: {error}</p>
          <p>Genel değerlendirme gösteriliyor.</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="recommendations-section">
        <h3>🤖 AI Destekli Aday Değerlendirme Raporu</h3>
        <div className="recommendations-empty">
          <p>Henüz AI destekli aday değerlendirme raporu bulunmuyor.</p>
          <p>Rapor oluşturmak için yukarıdaki butona tıklayın.</p>
        </div>
      </div>
    );
  }

  const getRecommendationTypeIcon = (type: RecommendationItem['type']): string => {
    switch (type) {
      case 'mastery':
        return '🌟';
      case 'growth':
        return '🌱';
      case 'foundation':
        return '🏗️';
      default:
        return '🎯';
    }
  };

  const getRecommendationTypeLabel = (type: RecommendationItem['type']): string => {
    switch (type) {
      case 'mastery':
        return 'Ustalık Geliştirme';
      case 'growth':
        return 'Büyüme Odaklı';
      case 'foundation':
        return 'Temel Güçlendirme';
      default:
        return 'Gelişim Önerisi';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return '#27ae60';
    if (confidence >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getDifficultyIcon = (level: string): string => {
    switch (level) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '🟡';
    }
  };

  const getDifficultyLabel = (level: string): string => {
    switch (level) {
      case 'beginner': return 'Başlangıç';
      case 'intermediate': return 'Orta';
      case 'advanced': return 'İleri';
      default: return 'Orta';
    }
  };

  const getImpactIcon = (impact: string): string => {
    switch (impact) {
      case 'high': return '🚀';
      case 'medium': return '📈';
      case 'low': return '📊';
      default: return '📈';
    }
  };

  const getImpactLabel = (impact: string): string => {
    switch (impact) {
      case 'high': return 'Yüksek Etki';
      case 'medium': return 'Orta Etki';
      case 'low': return 'Düşük Etki';
      default: return 'Orta Etki';
    }
  };

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#f39c12';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#f39c12';
    }
  };

  const getResourceTypeIcon = (type: string): string => {
    switch (type) {
      case 'book': return '📚';
      case 'course': return '🎓';
      case 'exercise': return '💪';
      case 'mentoring': return '👥';
      case 'tutorial': return '📖';
      default: return '📋';
    }
  };

  const getOverallPerformance = (scores: any[]): number => {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + (score.score / score.maxScore) * 100, 0);
    return Math.round(total / scores.length);
  };

  const getPerformanceColor = (performance: number): string => {
    if (performance >= 75) return '#27ae60';
    if (performance >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getPerformanceLabel = (performance: number): string => {
    if (performance >= 75) return 'Güçlü Performans';
    if (performance >= 60) return 'Orta Performans';
    return 'Gelişim Gerekli';
  };

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h3>�� Google AI Destekli Aday Değerlendirme Raporu</h3>
        <p className="recommendations-subtitle">
          Yetkinlik analiz sonuçlarına dayalı profesyonel aday değerlendirmesi
        </p>
        
        {/* AI Transparency Info for HR */}
        <div className="ai-transparency-info">
          <div className="ai-info-grid">
            <div className="ai-info-item">
              <span className="ai-info-label">AI Modeli:</span>
              <span className="ai-info-value">{recommendations.aiModel || 'Google Gemini'}</span>
            </div>
            <div className="ai-info-item">
              <span className="ai-info-label">Genel Performans:</span>
              <span className="ai-info-value" style={{ color: getPerformanceColor(getOverallPerformance([])) }}>
                %{getOverallPerformance([])} - {getPerformanceLabel(getOverallPerformance([]))}
              </span>
            </div>
            <div className="ai-info-item">
              <span className="ai-info-label">Analiz Verisi:</span>
              <span className="ai-info-value">{recommendations.dataUsed?.join(', ') || 'Yetkinlik Skorları'}</span>
            </div>
          </div>
        </div>
      </div>

      {recommendations.overallInsight && (
        <div className="overall-insight">
          <div className="insight-icon">📋</div>
          <div className="insight-content">
            <h4>Genel Aday Değerlendirmesi</h4>
            <p>{recommendations.overallInsight}</p>
          </div>
        </div>
      )}

      <div className="recommendations-grid">
        {recommendations.recommendations.map((recommendation, index) => (
          <div 
            key={recommendation.id || `rec-${index}`} 
            className="recommendation-card"
          >
            {/* Card Header with Key Metrics */}
            <div className="recommendation-header">
              <div className="recommendation-type">
                <span className="type-icon">
                  {getRecommendationTypeIcon(recommendation.type)}
                </span>
                <span className="type-label">
                  Yetkinlik Değerlendirmesi
                </span>
              </div>
              
              <div className="recommendation-metrics">
                {recommendation.priority && (
                  <div className="metric-badge priority" style={{ backgroundColor: getPriorityColor(recommendation.priority) }}>
                    <span className="metric-label">Öncelik</span>
                    <span className="metric-value">
                      {recommendation.priority === 'high' ? 'Yüksek' : 
                       recommendation.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                )}

                {recommendation.estimatedImpact && (
                  <div className="metric-badge impact" style={{ backgroundColor: getImpactColor(recommendation.estimatedImpact) }}>
                    <span className="metric-label">Risk</span>
                    <span className="metric-value">
                      {recommendation.estimatedImpact === 'high' ? 'Yüksek' : 
                       recommendation.estimatedImpact === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="recommendation-content">
              <h4 className="recommendation-title">{recommendation.title}</h4>
              
              {/* Dimension Info */}
              <div className="recommendation-dimension">
                <span className="dimension-label">Yetkinlik Alanı:</span>
                <span className="dimension-value">
                  {(() => {
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
                    return dimensionMapping[recommendation.dimension as keyof typeof dimensionMapping] || recommendation.dimension;
                  })()}
                </span>
              </div>

              <p className="recommendation-description">{recommendation.description}</p>
              
              {/* Assessment Section */}
              {recommendation.reasoning && (
                <div className="recommendation-reasoning">
                  <h5>📊 Performans Değerlendirmesi</h5>
                  <p className="reasoning-text">{recommendation.reasoning}</p>
                </div>
              )}

              {/* Based On Section */}
              {recommendation.basedOn && recommendation.basedOn.length > 0 && (
                <div className="recommendation-based-on">
                  <h5>📈 Analiz Temeli</h5>
                  <ul className="based-on-list">
                    {recommendation.basedOn.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* HR Recommendations */}
              {recommendation.userBenefit && (
                <div className="recommendation-benefit">
                  <h5>💼 İK Önerileri</h5>
                  <p className="benefit-text">{recommendation.userBenefit}</p>
                </div>
              )}

              {/* Risk and Priority */}
              <div className="recommendation-meta">
                {recommendation.difficultyLevel && (
                  <div className="meta-item">
                    <span className="meta-icon">{getDifficultyIcon(recommendation.difficultyLevel)}</span>
                    <span className="meta-label">Risk Seviyesi:</span>
                    <span className="meta-value">
                      {recommendation.difficultyLevel === 'advanced' ? 'Yüksek' : 
                       recommendation.difficultyLevel === 'intermediate' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                )}
                
                {recommendation.estimatedImpact && (
                  <div className="meta-item">
                    <span className="meta-icon">{getImpactIcon(recommendation.estimatedImpact)}</span>
                    <span className="meta-label">Etki:</span>
                    <span className="meta-value">{getImpactLabel(recommendation.estimatedImpact)}</span>
                  </div>
                )}
              </div>

              {/* Timeline and Expected Outcome */}
              <div className="recommendation-timeline-outcome">
                {recommendation.timeline && (
                  <div className="timeline-item">
                    <span className="timeline-icon">⏱️</span>
                    <span className="timeline-label">Süreç:</span>
                    <span className="timeline-value">{recommendation.timeline}</span>
                  </div>
                )}

                {recommendation.expectedOutcome && (
                  <div className="outcome-item">
                    <span className="outcome-icon">🎯</span>
                    <span className="outcome-label">Potansiyel:</span>
                    <span className="outcome-value">{recommendation.expectedOutcome}</span>
                  </div>
                )}
              </div>

              {/* HR Action Items */}
              {recommendation.actionItems && recommendation.actionItems.length > 0 && (
                <div className="action-items">
                  <h5>✅ İK Eylem Planı</h5>
                  <ul className="action-list">
                    {recommendation.actionItems.map((action, index) => (
                      <li key={index} className="action-item">{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Position Recommendations */}
              {recommendation.resources && recommendation.resources.length > 0 && (
                <div className="recommendation-resources">
                  <h5>🎯 Pozisyon Önerileri</h5>
                  <div className="resources-list">
                    {recommendation.resources.map((resource, index) => (
                      <div key={index} className="resource-item">
                        <div className="resource-header">
                          <span className="resource-icon">
                            {getResourceTypeIcon(resource.type)}
                          </span>
                          <span className="resource-title">{resource.title}</span>
                        </div>
                        <p className="resource-description">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations-footer">
        <div className="generation-info">
          <p>
            <strong>🤖 AI ile Oluşturuldu:</strong> {new Date(recommendations.generatedAt).toLocaleString('tr-TR')}
          </p>
          <p>
            <strong>📊 Analiz Edilen Veri:</strong> {recommendations.dataUsed?.join(', ') || 'Yetkinlik skorları ve davranış kalıpları'}
          </p>
          {recommendations.sessionId && (
            <p className="session-info">
              <strong>🔗 Oturum ID:</strong> {recommendations.sessionId}
            </p>
          )}
        </div>
        
        <div className="transparency-note">
          <h5>🔍 İK Değerlendirme Notu</h5>
          <p>
            Bu rapor, adayın yetkinlik skorları ve davranış kalıpları analiz edilerek Google AI tarafından oluşturulmuştur. 
            Her değerlendirme için performans analizi, pozisyon önerileri ve İK süreçleri için öneriler sunulmuştur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendationsComponent; 