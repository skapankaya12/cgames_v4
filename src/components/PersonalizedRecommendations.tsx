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
        <h3>Gelişim Önerileri</h3>
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Kişiselleştirilmiş önerileriniz hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-section">
        <h3>Gelişim Önerileri</h3>
        <div className="recommendations-error">
          <p>Öneriler yüklenirken bir hata oluştu. Genel öneriler gösteriliyor.</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="recommendations-section">
        <h3>Gelişim Önerileri</h3>
        <div className="recommendations-empty">
          <p>Henüz kişiselleştirilmiş öneri bulunmuyor.</p>
        </div>
      </div>
    );
  }

  const getRecommendationTypeIcon = (type: RecommendationItem['type']): string => {
    switch (type) {
      case 'mastery':
        return '🏆';
      case 'growth':
        return '📈';
      case 'foundation':
        return '🎯';
      default:
        return '💡';
    }
  };

  const getRecommendationTypeLabel = (type: RecommendationItem['type']): string => {
    switch (type) {
      case 'mastery':
        return 'Uzmanlık Yolu';
      case 'growth':
        return 'Gelişim Fırsatı';
      case 'foundation':
        return 'Temel Güçlendirme';
      default:
        return 'Öneri';
    }
  };

  const getRecommendationTypeClass = (type: RecommendationItem['type']): string => {
    switch (type) {
      case 'mastery':
        return 'recommendation-mastery';
      case 'growth':
        return 'recommendation-growth';
      case 'foundation':
        return 'recommendation-foundation';
      default:
        return 'recommendation-default';
    }
  };

  const getResourceTypeIcon = (type: string): string => {
    switch (type) {
      case 'case-study':
        return '📚';
      case 'mentorship':
        return '👥';
      case 'tutorial':
        return '🎓';
      default:
        return '📖';
    }
  };

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h3>Gelişim Önerileri</h3>
        <p className="recommendations-subtitle">
          Davranış analizinize dayalı kişiselleştirilmiş öneriler
        </p>
      </div>

      {recommendations.overallInsight && (
        <div className="overall-insight">
          <div className="insight-icon">💡</div>
          <p>{recommendations.overallInsight}</p>
        </div>
      )}

      <div className="recommendations-grid">
        {recommendations.recommendations.map((recommendation) => (
          <div 
            key={recommendation.id} 
            className={`recommendation-card ${getRecommendationTypeClass(recommendation.type)}`}
          >
            <div className="recommendation-header">
              <div className="recommendation-type">
                <span className="type-icon">
                  {getRecommendationTypeIcon(recommendation.type)}
                </span>
                <span className="type-label">
                  {getRecommendationTypeLabel(recommendation.type)}
                </span>
              </div>
              <div className="recommendation-score">
                {Math.round(recommendation.score)}%
              </div>
            </div>

            <div className="recommendation-content">
              <h4 className="recommendation-title">{recommendation.title}</h4>
              <p className="recommendation-description">{recommendation.description}</p>
              
              <div className="recommendation-dimension">
                <span className="dimension-label">Alan:</span>
                <span className="dimension-value">{recommendation.dimension}</span>
              </div>

              {recommendation.actionItems && recommendation.actionItems.length > 0 && (
                <div className="action-items">
                  <h5>Önerilen Aksiyonlar:</h5>
                  <ul>
                    {recommendation.actionItems.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.resources && recommendation.resources.length > 0 && (
                <div className="recommendation-resources">
                  <h5>Kaynaklar:</h5>
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
                        {resource.url && (
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resource-link"
                          >
                            Kaynağa Git →
                          </a>
                        )}
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
        <p className="generation-info">
          Öneriler {new Date(recommendations.generatedAt).toLocaleString('tr-TR')} tarihinde oluşturuldu
        </p>
        {recommendations.sessionId && (
          <p className="session-info">
            Oturum ID: {recommendations.sessionId}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalizedRecommendationsComponent; 