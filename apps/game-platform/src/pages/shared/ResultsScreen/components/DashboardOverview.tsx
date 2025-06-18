import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { CompetencyScore } from '../types/results';
import type { SessionAnalytics } from '@cgames/services/InteractionTracker';
// import type { PersonalizedRecommendations } from '@cgames/services/RecommendationService';
import { getScorePercentage, getScoreLevelColor } from '../utils/insights';

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
  // Calculate key metrics
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + getScorePercentage(score.score, score.maxScore), 0) / scores.length)
    : 0;
  
  const topCompetency = scores.length > 0 ? scores[0] : null;
  const improvementArea = scores.length > 0 ? scores[scores.length - 1] : null;
  
  const totalTimeSpent = (interactionAnalytics as any)?.totalTimeSpent || 0;
  const totalInteractions = (interactionAnalytics as any)?.totalInteractions || 0;

  // Get performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { label: 'Mükemmel', color: '#10b981', icon: 'Trophy' };
    if (score >= 60) return { label: 'İyi', color: '#708238', icon: 'Analytics' };
    if (score >= 40) return { label: 'Orta', color: '#f59e0b', icon: 'Target' };
    return { label: 'Gelişim Gerekli', color: '#ef4444', icon: 'AlertCircle' };
  };

  const performanceLevel = getPerformanceLevel(averageScore);
  const PerformanceIcon = Icons[performanceLevel.icon as keyof typeof Icons];

  // Get AI recommendations summary
  const getAIRecommendationsSummary = () => {
    if (isLoadingRecommendations) {
      return "AI analiziniz devam ediyor...";
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
          keyPoints.push(`Güçlü yönleriniz: ${strengths[0]}`);
        }
        
        if (developmentAreas && developmentAreas.length > 0) {
          keyPoints.push(`Gelişim alanı: ${developmentAreas[0]}`);
        }
        
        return keyPoints.length > 0 ? `${firstSentence} ${keyPoints.join('. ')}.` : firstSentence;
      }
      
      // Fallback summary
      if (strengths && developmentAreas) {
        return `AI analizinize göre ${strengths.length} güçlü yönünüz ve ${developmentAreas.length} gelişim alanınız belirlendi.`;
      }
      
      return "Kişiselleştirilmiş önerileriniz hazırlandı.";
    }
    
    return "AI öneriler oluşturulmadı.";
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
            Hoş geldiniz, {user?.firstName}! 👋
          </h2>
          <p>
            Bilişsel oyun değerlendirmeniz {getTestCompletionDate()} tarihinde tamamlandı. Aşağıda genel performansınızı ve detaylı analizleri görebilirsiniz.
          </p>
        </div>
        <button 
          className="help-button"
          onClick={() => onShowHelp('dashboard-overview')}
          title="Bu sayfayı anlamak için yardım alın"
        >
          <Icons.Lightbulb size={16} />
          <span>Yardım</span>
        </button>
      </div>

      {/* Bento Grid Layout - Key Metrics */}
      <div className="dashboard-bento-grid">
        {/* Overall Performance - Large Card */}
        <div className="bento-card bento-large performance-card">
          <div className="card-header">
            <div className="card-title">
              <PerformanceIcon size={24} color={performanceLevel.color} />
              <span>Genel Performans</span>
            </div>
            <div className="performance-badge" style={{ backgroundColor: `${performanceLevel.color}20`, color: performanceLevel.color }}>
              {performanceLevel.label}
            </div>
          </div>
          <div className="performance-score">
            <div className="score-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${averageScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ stroke: performanceLevel.color }}
                />
                <text x="18" y="20.35" className="percentage">
                  {averageScore}%
                </text>
              </svg>
            </div>
            <div className="score-details">
              <p>Ortalama Yetkinlik Skoru</p>
              <div className="score-number-display">
                <span className="large-score-number">{averageScore}%</span>
              </div>
              <span className="score-breakdown">
                {scores.length} yetkinlik alanı analiz edildi
              </span>
            </div>
          </div>
        </div>

        {/* Top Competency */}
        <div className="bento-card competency-highlight">
          <div className="card-header">
            <Icons.Trophy size={20} color="#10b981" />
            <span>En Güçlü Yetkinlik</span>
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
              <p>Veri yok</p>
            )}
          </div>
        </div>

        {/* Improvement Area */}
        <div className="bento-card improvement-area">
          <div className="card-header">
            <Icons.Target size={20} color="#f59e0b" />
            <span>Gelişim Alanı</span>
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
              <p>Veri yok</p>
            )}
          </div>
        </div>

        {/* Time Analytics */}
        <div className="bento-card time-analytics">
          <div className="card-header">
            <Icons.Clock size={20} color="#667eea" />
            <span>Zaman Analizi</span>
          </div>
          <div className="time-content">
            <div className="time-stat">
              <span className="time-value">
                {Math.round(totalTimeSpent / 60)}dk
              </span>
              <span className="time-label">Toplam Süre</span>
            </div>
            <div className="time-stat">
              <span className="time-value">
                {totalInteractions}
              </span>
              <span className="time-label">Toplam Etkileşim</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bento-card ai-insights">
          <div className="card-header">
            <Icons.AI size={20} color="#8b5cf6" />
            <span>AI Öngörüler</span>
          </div>
          <div className="insights-content">
            {isLoadingRecommendations ? (
              <div className="loading-state">
                <div className="loading-spinner-small"></div>
                <p>AI analiz ediyor...</p>
              </div>
            ) : personalizedRecommendations ? (
              <div className="insight-preview">
                <p>{getAIRecommendationsSummary()}</p>
                <button 
                  className="view-details-btn"
                  onClick={() => onViewChange('öneriler')}
                >
                  Tüm Önerileri Görüntüle
                </button>
              </div>
            ) : (
              <p>AI öneriler hazırlanıyor...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 