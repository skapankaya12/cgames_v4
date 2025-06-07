import React from 'react';
import { Icons } from '../../../../components/SvgIcons';
import PersonalizedRecommendationsComponent from '../../../../components/PersonalizedRecommendations';
import type { PersonalizedRecommendations } from '../../../../types/Recommendations';
import type { CompetencyScore, ResultsScreenUser } from '../types/results';
import type { CVData } from '../../../../services';
import { getRecommendations } from '../utils/insights';

interface RecommendationsSectionProps {
  personalizedRecommendations: PersonalizedRecommendations | null;
  isLoadingRecommendations: boolean;
  recommendationsError: string | null;
  scores: CompetencyScore[];
  user: ResultsScreenUser | null;
  cvData: CVData | null;
  sessionId: string;
  onGenerateRecommendations: () => Promise<void>;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  personalizedRecommendations,
  isLoadingRecommendations,
  recommendationsError,
  scores,
  user,
  cvData,
  sessionId,
  onGenerateRecommendations
}) => {
  const generalRecommendations = getRecommendations(scores);

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '24px'
        }}>
          <Icons.Brain size={24} color="#667eea" />
          <span>Kişiselleştirilmiş Öneriler</span>
        </h3>
        
        {!personalizedRecommendations && !isLoadingRecommendations && (
          <button 
            className="generate-recommendations-button"
            onClick={onGenerateRecommendations}
            disabled={!user || scores.length === 0}
          >
            <Icons.Brain size={16} style={{ marginRight: '8px' }} />
            AI Önerileri Oluştur
          </button>
        )}
      </div>

      {/* AI Recommendations Component */}
      <PersonalizedRecommendationsComponent
        recommendations={personalizedRecommendations}
        isLoading={isLoadingRecommendations}
        error={recommendationsError}
        competencyScores={scores.map(score => ({
          dimension: score.abbreviation,
          score: score.score,
          maxScore: score.maxScore,
          displayName: score.fullName,
          category: score.category
        }))}
      />

      {/* General Recommendations */}
      <div className="general-recommendations-section">
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '16px'
        }}>
          <Icons.Target size={20} color="#f59e0b" />
          <span>Genel Gelişim Önerileri</span>
        </h4>
        
        <div className="recommendations-grid">
          {generalRecommendations.length > 0 ? (
            generalRecommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-icon">
                  <Icons.Target size={16} color="#667eea" />
                </div>
                <p>{recommendation}</p>
              </div>
            ))
          ) : (
            <div className="no-recommendations">
              <Icons.Check size={24} color="#10b981" />
              <p>Tüm yetkinlik alanlarında güçlü performans gösteriyorsunuz!</p>
            </div>
          )}
        </div>

        {/* Additional Static Recommendations */}
        <div className="static-recommendations">
          <h5>Genel Liderlik Gelişim Önerileri</h5>
          <div className="static-recommendations-grid">
            <div className="recommendation-item">
              <div className="recommendation-icon">
                <Icons.Book size={16} color="#8b5cf6" />
              </div>
              <p>Liderlik gelişimi için düzenli okuma alışkanlığı edinin</p>
            </div>
            
            <div className="recommendation-item">
              <div className="recommendation-icon">
                <Icons.Target size={16} color="#3b82f6" />
              </div>
              <p>Hedef belirleme ve takip sistemleri kullanın</p>
            </div>
            
            <div className="recommendation-item">
              <div className="recommendation-icon">
                <Icons.User size={16} color="#10b981" />
              </div>
              <p>Mentorluk programlarına katılım sağlayın</p>
            </div>
            
            <div className="recommendation-item">
              <div className="recommendation-icon">
                <Icons.Analytics size={16} color="#f59e0b" />
              </div>
              <p>360 derece geri bildirim süreçlerinde yer alın</p>
            </div>
            
            <div className="recommendation-item">
              <div className="recommendation-icon">
                <Icons.User size={16} color="#ef4444" />
              </div>
              <p>Sektör ağınızı genişletmek için networking etkinliklerine katılın</p>
            </div>
            
            <div className="recommendation-item">
              <div className="recommendation-icon">
                <Icons.Brain size={16} color="#6366f1" />
              </div>
              <p>Stratejik düşünme becerilerinizi geliştirmek için vaka analizleri yapın</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Planning Section */}
      {personalizedRecommendations?.actionPlan && personalizedRecommendations.actionPlan.length > 0 && (
        <div className="action-plan-section">
          <h4 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Icons.Clock size={20} color="#10b981" />
            <span>Eylem Planı</span>
          </h4>
          
          <div className="action-plan-timeline">
            {personalizedRecommendations.actionPlan.map((action, index) => (
              <div key={index} className="action-plan-item">
                <div className="action-timeline-dot"></div>
                <div className="action-content">
                  <h5>{action.title || `Eylem ${index + 1}`}</h5>
                  <p>{action.description || action}</p>
                  {action.timeframe && (
                    <span className="action-timeframe">{action.timeframe}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CV Integration Info */}
      {cvData && (
        <div className="cv-integration-info">
          <div className="cv-info-card">
            <Icons.Document size={20} color="#667eea" />
            <span>Bu öneriler özgeçmiş analiziniz ({cvData.fileName}) ile birleştirilmiştir</span>
          </div>
        </div>
      )}
    </div>
  );
}; 