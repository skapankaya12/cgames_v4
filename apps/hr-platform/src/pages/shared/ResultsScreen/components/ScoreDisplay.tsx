import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { CompetencyScore } from '../types/results';
import { getScorePercentage, getScoreLevelColor, getInsight } from '../utils/insights';

interface ScoreDisplayProps {
  scores: CompetencyScore[];
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ scores }) => {
  return (
    <div className="yetkinlikler-section">
      <h3 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '24px'
      }}>
        <Icons.Analytics size={24} color="#667eea" />
        <span>Yetkinlik Analizi</span>
      </h3>
      
      <div className="competency-grid">
        {scores.map((score, index) => {
          const percentage = getScorePercentage(score.score, score.maxScore);
          const levelColor = getScoreLevelColor(percentage);
          const insight = getInsight(score.abbreviation, score.score);

          return (
            <div key={index} className="competency-card">
              <div className="competency-header">
                <div className="competency-info">
                  <h4 className="competency-name">
                    {score.fullName}
                    <span className="competency-abbrev">({score.abbreviation})</span>
                  </h4>
                  <p className="competency-description">{score.description}</p>
                </div>
                <div className="competency-score-circle">
                  <div 
                    className="score-progress"
                    style={{
                      background: `conic-gradient(${levelColor} ${percentage * 3.6}deg, #e5e7eb 0deg)`
                    }}
                  >
                    <div className="score-inner">
                      <span className="score-percentage">{percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="competency-details">
                <div className="score-breakdown">
                  <span className="score-text">
                    Puan: {score.score} / {score.maxScore}
                  </span>
                  <div 
                    className="score-bar"
                    style={{
                      background: `linear-gradient(to right, ${levelColor} ${percentage}%, #e5e7eb ${percentage}%)`
                    }}
                  />
                </div>
                
                <div className="competency-insight">
                  <div className="insight-icon">
                    <Icons.Lightbulb size={16} color={levelColor} />
                  </div>
                  <p className="insight-text">{insight}</p>
                </div>
                
                <div className="competency-category">
                  <span 
                    className="category-badge"
                    style={{ 
                      backgroundColor: `${levelColor}20`,
                      color: levelColor,
                      border: `1px solid ${levelColor}40`
                    }}
                  >
                    {score.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="competency-summary">
        <h4>Yetkinlik Özeti</h4>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="stat-icon">
              <Icons.Trophy size={20} color="#10b981" />
            </div>
            <div className="stat-content">
              <span className="stat-label">En Güçlü Yetkinlik</span>
              <span className="stat-value">
                {scores.length > 0 ? scores[0].fullName : 'Veri yok'}
              </span>
            </div>
          </div>
          
          <div className="summary-stat">
            <div className="stat-icon">
              <Icons.Target size={20} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Gelişim Alanı</span>
              <span className="stat-value">
                {scores.length > 0 ? scores[scores.length - 1].fullName : 'Veri yok'}
              </span>
            </div>
          </div>
          
          <div className="summary-stat">
            <div className="stat-icon">
              <Icons.BarChart3 size={20} color="#667eea" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Ortalama Performans</span>
              <span className="stat-value">
                {scores.length > 0 
                  ? `${Math.round(scores.reduce((sum, score) => 
                      sum + getScorePercentage(score.score, score.maxScore), 0) / scores.length)}%`
                  : 'Veri yok'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 