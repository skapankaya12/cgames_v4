import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@cgames/ui-kit';
import type { CompetencyScore } from '../types/results';
import type { SessionAnalytics } from '@cgames/services/InteractionTracker';
// import type { PersonalizedRecommendations } from '@cgames/services/RecommendationService';
import { getScorePercentage, getScoreLevelColor, formatTime } from '../utils/insights';

type ViewType = 'dashboard' | 'yetkinlikler' | 'davranış-analizi' | 'öneriler' | 'feedback';

interface User {
  firstName: string;
  lastName: string;
  company?: string;
}

interface DashboardOverviewProps {
  scores: CompetencyScore[];
  user: User | null;
  interactionAnalytics: SessionAnalytics | null;
  personalizedRecommendations: any | null;
  isLoadingRecommendations: boolean;
  onViewChange: (view: ViewType) => void;
  onShowHelp: (context: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  scores,
  user,
  interactionAnalytics,
  personalizedRecommendations,
  isLoadingRecommendations,
  onViewChange,
  onShowHelp
}) => {
  const { t } = useTranslation('ui');
  // Calculate key metrics
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + getScorePercentage(score.score, score.maxScore), 0) / scores.length)
    : 0;
  
  // Fix: Calculate actual highest and lowest scoring competencies
  const topCompetency = scores.length > 0 
    ? scores.reduce((highest, current) => 
        getScorePercentage(current.score, current.maxScore) > getScorePercentage(highest.score, highest.maxScore) 
          ? current 
          : highest
      )
    : null;
    
  const improvementArea = scores.length > 0 
    ? scores.reduce((lowest, current) => 
        getScorePercentage(current.score, current.maxScore) < getScorePercentage(lowest.score, lowest.maxScore) 
          ? current 
          : lowest
      )
    : null;
  
  // Calculate time analytics correctly - matching AnalyticsSection
  const totalTime = interactionAnalytics?.totalTime || 0;
  const avgTimePerQuestion = interactionAnalytics?.questionTimes 
    ? interactionAnalytics.questionTimes.reduce((sum, time) => sum + time, 0) / interactionAnalytics.questionTimes.length
    : 0;

  // Get performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { label: t('results.performanceLevels.excellent'), color: '#10b981', icon: 'Trophy' };
    if (score >= 60) return { label: t('results.performanceLevels.good'), color: '#708238', icon: 'Analytics' };
    if (score >= 40) return { label: t('results.performanceLevels.average'), color: '#f59e0b', icon: 'Target' };
    return { label: t('results.performanceLevels.needsDevelopment'), color: '#ef4444', icon: 'AlertCircle' };
  };

  const performanceLevel = getPerformanceLevel(averageScore);
  const PerformanceIcon = Icons[performanceLevel.icon as keyof typeof Icons];

  // Get AI recommendations summary
  const getAIRecommendationsSummary = () => {
    if (isLoadingRecommendations) {
      return t('results.aiAssistant.loading');
    }
    
    if (personalizedRecommendations) {
      // Extract meaningful summary from AI recommendations
      const summary = personalizedRecommendations.overallSummary;
      const developmentAreas = personalizedRecommendations.developmentAreas;
      const strengths = personalizedRecommendations.strengths;
      
      if (summary) {
        // Take the first sentence and add key points
        const firstSentence = summary.split('.')[0] + '.';
        const keyPoints = [];
        
        if (strengths && strengths.length > 0) {
          keyPoints.push(`${t('results.dashboard.strongestCompetency')}: ${strengths[0]}`);
        }
        
        if (developmentAreas && developmentAreas.length > 0) {
          keyPoints.push(`${t('results.dashboard.developmentArea')}: ${developmentAreas[0]}`);
        }
        
        return keyPoints.length > 0 ? `${firstSentence} ${keyPoints.join('. ')}.` : firstSentence;
      }
      
      // Fallback summary
      if (strengths && developmentAreas) {
        return t('results.dashboard.aiAnalysisSummary', { 
          strengthsCount: strengths.length, 
          developmentCount: developmentAreas.length 
        });
      }
      
      return t('results.dashboard.recommendationsReady');
    }
    
    return t('results.dashboard.noRecommendations');
  };

  // Get formatted test completion date
  const getTestCompletionDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="dashboard-overview">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h2>
            {t('results.dashboard.welcome', { name: user?.firstName })}
          </h2>
          <p>
            {t('results.dashboard.completedOn', { date: getTestCompletionDate() })}
          </p>
        </div>
        <button 
          className="help-button"
          onClick={() => onShowHelp('dashboard-overview')}
          title={t('help.helpButtonTitle')}
        >
          <Icons.Lightbulb size={16} />
          <span>{t('help.ipuclari')}</span>
        </button>
      </div>

      {/* Bento Grid Layout - Key Metrics */}
      <div className="dashboard-bento-grid">
        {/* Overall Performance - Large Card */}
        <div className="bento-card bento-large performance-card">
          <div className="card-header">
            <div className="card-title">
              <PerformanceIcon size={24} color={performanceLevel.color} />
              <span>{t('results.dashboard.overallPerformance')}</span>
            </div>
          </div>
          <div className="performance-score-vertical">
            <div className="score-circle-container-vertical">
              <div className="score-circle-small">
                <svg viewBox="0 0 80 80" className="circular-chart-small">
                  <circle
                    className="circle-bg-small"
                    cx="40" cy="40" r="30"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <circle
                    className="circle-progress-small"
                    cx="40" cy="40" r="30"
                    fill="none"
                    stroke={performanceLevel.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - averageScore / 100)}`}
                    transform="rotate(-90 40 40)"
                    style={{ 
                      transition: 'stroke-dashoffset 1s ease-in-out',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                </svg>
                <div className="score-center-small">
                  <span className="score-number-small">{averageScore}</span>
                  <span className="score-symbol-small">%</span>
                </div>
              </div>
            </div>
            <div className="score-info-vertical">
              <h3 className="score-title-vertical">{t('results.dashboard.overallPerformanceDescription')}</h3>
              <p className="score-subtitle-vertical">{scores.length} {t('results.competencies.competencyAreas')} {t('results.navigation.competencies.description', { count: scores.length })}</p>
            </div>
          </div>
        </div>

        {/* Top Competency */}
        <div className="bento-card competency-highlight">
          <div className="card-header card-header-left">
            <Icons.Trophy size={20} color="#10b981" />
            <span>{t('results.dashboard.strongestCompetency')}</span>
          </div>
          <div className="competency-content">
            {topCompetency ? (
              <>
                <h4>{topCompetency.fullName}</h4>
                <div className="competency-score">
                  <span className="score-value">
                    {getScorePercentage(topCompetency.score, topCompetency.maxScore)}%
                  </span>
                  <div 
                    className="score-bar"
                    style={{
                      background: `linear-gradient(to right, ${getScoreLevelColor(getScorePercentage(topCompetency.score, topCompetency.maxScore))} ${getScorePercentage(topCompetency.score, topCompetency.maxScore)}%, #e5e7eb ${getScorePercentage(topCompetency.score, topCompetency.maxScore)}%)`
                    }}
                  />
                </div>
              </>
            ) : (
              <p>{t('results.competencies.noDataTitle')}</p>
            )}
          </div>
        </div>

        {/* Improvement Area */}
        <div className="bento-card improvement-area">
          <div className="card-header card-header-left">
            <Icons.Target size={20} color="#f59e0b" />
            <span>{t('results.dashboard.developmentArea')}</span>
          </div>
          <div className="competency-content">
            {improvementArea ? (
              <>
                <h4>{improvementArea.fullName}</h4>
                <div className="competency-score">
                  <span className="score-value">
                    {getScorePercentage(improvementArea.score, improvementArea.maxScore)}%
                  </span>
                  <div 
                    className="score-bar"
                    style={{
                      background: `linear-gradient(to right, ${getScoreLevelColor(getScorePercentage(improvementArea.score, improvementArea.maxScore))} ${getScorePercentage(improvementArea.score, improvementArea.maxScore)}%, #e5e7eb ${getScorePercentage(improvementArea.score, improvementArea.maxScore)}%)`
                    }}
                  />
                </div>
              </>
            ) : (
              <p>{t('results.competencies.noDataTitle')}</p>
            )}
          </div>
        </div>

        {/* Time Analytics */}
        <div className="bento-card time-analytics">
          <div className="card-header card-header-left">
            <Icons.Clock size={20} color="#667eea" />
            <span>{t('results.behaviorAnalysis.title')}</span>
          </div>
          <div className="time-content">
            <div className="time-stat">
              <span className="time-value">
                {formatTime(totalTime)}
              </span>
              <span className="time-label">{t('results.behaviorAnalysis.totalTime')}</span>
            </div>
            <div className="time-stat">
              <span className="time-value">
                {formatTime(avgTimePerQuestion)}
              </span>
              <span className="time-label">{t('results.behaviorAnalysis.avgQuestionTime')}</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bento-card ai-insights">
          <div className="card-header">
            <Icons.AI size={20} color="#8b5cf6" />
            <span>{t('results.dashboard.aiInsights')}</span>
          </div>
          <div className="insights-content">
            {isLoadingRecommendations ? (
              <div className="loading-state">
                <div className="loading-spinner-small"></div>
                <p>{t('results.aiAssistant.loading')}</p>
              </div>
            ) : personalizedRecommendations ? (
              <div className="insight-preview">
                <p>{getAIRecommendationsSummary()}</p>
                <div className="centered-button">
                  <button 
                    className="view-details-btn"
                    onClick={() => onViewChange('öneriler')}
                  >
                    {t('results.dashboard.viewDetails')}
                  </button>
                </div>
              </div>
            ) : (
              <p>{t('results.dashboard.generateInsights')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 