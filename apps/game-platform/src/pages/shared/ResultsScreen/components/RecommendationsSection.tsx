import React from 'react';
import { Icons } from '@cgames/ui-kit';
import { PersonalizedRecommendations as PersonalizedRecommendationsComponent } from '@cgames/ui-kit';
import type { PersonalizedRecommendations } from '@cgames/types/Recommendations';
import type { CompetencyScore, ResultsScreenUser } from '../types/results';
import type { CVData } from '@cgames/services';
// import { getRecommendations } from '../utils/insights';

interface RecommendationsSectionProps {
  personalizedRecommendations: PersonalizedRecommendations | null;
  isLoadingRecommendations: boolean;
  recommendationsError: string | null;
  scores: CompetencyScore[];
  user: ResultsScreenUser | null;
  cvData: CVData | null;
  sessionId: string;
  onGenerateRecommendations: () => Promise<void>;
  onShowHelp: (context: string) => void;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  personalizedRecommendations,
  isLoadingRecommendations,
  recommendationsError,
  scores,
  user,
  cvData,
  // sessionId, // Temporarily commented out unused parameter
  onGenerateRecommendations,
  onShowHelp
}) => {
  // const generalRecommendations = getRecommendations(scores);

  return (
    <div className="recommendations-section">
      {!personalizedRecommendations && !isLoadingRecommendations && (
        <button 
          className="generate-recommendations-button"
          onClick={onGenerateRecommendations}
          disabled={!user || scores.length === 0}
          style={{ marginBottom: '24px' }}
        >
          <Icons.Brain size={16} style={{ marginRight: '8px' }} />
          AI Önerileri Oluştur
        </button>
      )}

      {/* AI Recommendations Component */}
      <PersonalizedRecommendationsComponent
        recommendations={personalizedRecommendations}
        isLoading={isLoadingRecommendations}
        error={recommendationsError}
        onShowHelp={onShowHelp}

        competencyScores={scores.map(score => ({
          dimension: score.abbreviation,
          score: score.score,
          maxScore: score.maxScore,
          displayName: score.fullName,
          category: score.category
        }))}
      />

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
                  <h5>{typeof action === 'object' && action?.title ? action.title : `Eylem ${index + 1}`}</h5>
                  <p>{typeof action === 'object' ? action.description : action}</p>
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