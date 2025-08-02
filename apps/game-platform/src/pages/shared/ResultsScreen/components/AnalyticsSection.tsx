import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@cgames/ui-kit';
import type { SessionAnalytics } from '@cgames/services/InteractionTracker';
import { formatTime } from '../utils/insights';

interface AnalyticsSectionProps {
  interactionAnalytics: SessionAnalytics | null;
  onShowHelp: (context: string) => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ 
  interactionAnalytics,
  onShowHelp 
}) => {
  const { t } = useTranslation('ui');
  if (!interactionAnalytics) {
    return (
      <div className="analytics-section" style={{ backgroundColor: 'white' }}>
        <div className="section-header-with-help">
          <h3 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '24px'
          }}>
            <Icons.Brain size={24} color="#667eea" />
            <span>{t('results.behaviorAnalysis.title')}</span>
          </h3>
          <button 
            className="help-button"
            onClick={() => onShowHelp('behavior-analysis')}
            title={t('help.helpButtonTitle')}
          >
            <Icons.Lightbulb size={20} />
          </button>
        </div>
        
        <div className="analytics-no-data">
          <div className="no-data-icon">
            <Icons.AlertCircle size={48} color="#6b7280" />
          </div>
          <h4>{t('results.behaviorAnalysis.noDataTitle')}</h4>
          <p>
            {t('results.behaviorAnalysis.noDataDescription')}
          </p>
        </div>
      </div>
    );
  }

  const avgTimePerQuestion = interactionAnalytics.questionTimes 
    ? interactionAnalytics.questionTimes.reduce((sum, time) => sum + time, 0) / interactionAnalytics.questionTimes.length
    : 0;

  const changedAnswersCount = interactionAnalytics.changedAnswers 
    ? Object.keys(interactionAnalytics.changedAnswers).length 
    : 0;

  return (
    <div className="analytics-section" style={{ backgroundColor: 'white' }}>
      <div className="section-header-with-help">
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '24px'
        }}>
          <Icons.Brain size={24} color="#667eea" />
          <span>{t('results.behaviorAnalysis.title')}</span>
        </h3>
        <button 
          className="help-button"
          onClick={() => onShowHelp('behavior-analysis')}
          title={t('help.helpButtonTitle')}
        >
          <Icons.Lightbulb size={20} />
        </button>
      </div>

      {/* Overview Stats */}
      <div className="analytics-overview">
        <div className="analytics-stat-grid">
          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Icons.Clock size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <h4>{t('results.behaviorAnalysis.totalTime')}</h4>
              <p className="stat-value">{formatTime(interactionAnalytics.totalTime || 0)}</p>
              <p className="stat-subtitle">{t('results.behaviorAnalysis.totalTimeSubtitle')}</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Icons.Timer size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <h4>{t('results.behaviorAnalysis.avgQuestionTime')}</h4>
              <p className="stat-value">{formatTime(avgTimePerQuestion)}</p>
              <p className="stat-subtitle">{t('results.behaviorAnalysis.avgQuestionTimeSubtitle')}</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Icons.Refresh size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <h4>{t('results.behaviorAnalysis.changedAnswers')}</h4>
              <p className="stat-value">{changedAnswersCount}</p>
              <p className="stat-subtitle">{t('results.behaviorAnalysis.changedAnswersSubtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Times Chart */}
      {interactionAnalytics.questionTimes && interactionAnalytics.questionTimes.length > 0 && (
        <div className="analytics-chart-section">
          <h4>{t('results.behaviorAnalysis.questionTimeAnalysis')}</h4>
          <div className="question-times-chart">
            {interactionAnalytics.questionTimes.map((time, index) => {
              const maxTime = Math.max(...interactionAnalytics.questionTimes!);
              const heightPercent = maxTime > 0 ? (time / maxTime) * 100 : 0;
              const isSlowResponse = time > avgTimePerQuestion * 1.5;
              const isFastResponse = time < avgTimePerQuestion * 0.5;
              
              return (
                <div key={index} className="question-time-bar">
                  <div 
                    className={`time-bar ${isSlowResponse ? 'slow' : isFastResponse ? 'fast' : 'normal'}`}
                    style={{ height: `${heightPercent}%` }}
                    title={`Soru ${index + 1}: ${formatTime(time)}`}
                  />
                  <span className="question-number">{index + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color fast"></div>
              <span>{t('results.behaviorAnalysis.fastResponse')} (&lt; {formatTime(avgTimePerQuestion * 0.5)})</span>
            </div>
            <div className="legend-item">
              <div className="legend-color normal"></div>
              <span>{t('results.behaviorAnalysis.normalTempo')}</span>
            </div>
            <div className="legend-item">
              <div className="legend-color slow"></div>
              <span>{t('results.behaviorAnalysis.slowResponse')} (&gt; {formatTime(avgTimePerQuestion * 1.5)})</span>
            </div>
          </div>
        </div>
      )}

      {/* Behavior Patterns */}
      {interactionAnalytics.behaviorPatterns && Object.keys(interactionAnalytics.behaviorPatterns).length > 0 && (
        <div className="behavior-patterns-section">
          <h4>{t('results.behaviorAnalysis.behaviorPatterns')}</h4>
          <div className="behavior-patterns-grid">
            {Object.entries(interactionAnalytics.behaviorPatterns).map(([pattern, data]) => (
              <div key={pattern} className="behavior-pattern-card">
                <h5>{pattern.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h5>
                <div className="pattern-data">
                  {typeof data === 'object' ? (
                    Object.entries(data).map(([key, value]) => (
                      <div key={key} className="pattern-item">
                        <span className="pattern-key">{key}:</span>
                        <span className="pattern-value">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="pattern-value">{String(data)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}; 