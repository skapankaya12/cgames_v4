import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { CompetencyScore } from '../types/results';
import { getScorePercentage, getScoreLevelColor, getInsight } from '../utils/insights';

interface ScoreDisplayProps {
  scores: CompetencyScore[];
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ scores }) => {
  // Calculate overall statistics
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + getScorePercentage(score.score, score.maxScore), 0) / scores.length 
    : 0;
  
  const highestScore = scores.reduce((highest, score) => 
    getScorePercentage(score.score, score.maxScore) > getScorePercentage(highest.score, highest.maxScore) 
      ? score : highest, scores[0]);
  
  const lowestScore = scores.reduce((lowest, score) => 
    getScorePercentage(score.score, score.maxScore) < getScorePercentage(lowest.score, lowest.maxScore) 
      ? score : lowest, scores[0]);

  // Group scores by category for better organization
  const groupedScores = scores.reduce((groups, score) => {
    const category = score.category || 'Genel';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(score);
    return groups;
  }, {} as Record<string, CompetencyScore[]>);

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Mükemmel', color: 'var(--status-excellent)', bg: 'rgba(16, 185, 129, 0.1)' };
    if (percentage >= 80) return { level: 'Çok İyi', color: 'var(--status-good)', bg: 'rgba(99, 102, 241, 0.1)' };
    if (percentage >= 70) return { level: 'İyi', color: 'var(--candidate-primary)', bg: 'rgba(112, 130, 56, 0.1)' };
    if (percentage >= 60) return { level: 'Orta', color: 'var(--status-average)', bg: 'rgba(245, 158, 11, 0.1)' };
    return { level: 'Gelişim Gerekli', color: 'var(--status-needs-improvement)', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  return (
    <div className="yetkinlikler-section">
      {/* Enhanced Header Section */}
      <div className="section-header-with-stats">
        <div className="section-title-area">
          <h3 className="section-main-title">
            <div className="title-icon">
              <Icons.BarChart3 size={32} color="var(--candidate-primary)" />
            </div>
            <div className="title-content">
              <span className="title-text">Yetkinlik Analizi</span>
              <span className="title-subtitle">Kapsamlı beceri değerlendirme raporu</span>
            </div>
          </h3>
        </div>
        
        {/* Quick Stats Overview */}
        <div className="quick-stats-grid">
          <div className="quick-stat-card">
            <div className="stat-icon">
              <Icons.Target size={24} color="var(--candidate-primary)" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{Math.round(averageScore)}%</span>
              <span className="stat-label">Ortalama Performans</span>
            </div>
          </div>
          
          <div className="quick-stat-card">
            <div className="stat-icon">
              <Icons.TrendingUp size={24} color="var(--status-excellent)" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{scores.length}</span>
              <span className="stat-label">Değerlendirilen Yetkinlik</span>
            </div>
          </div>
          
          <div className="quick-stat-card">
            <div className="stat-icon">
              <Icons.Award size={24} color="var(--status-good)" />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {scores.filter(score => getScorePercentage(score.score, score.maxScore) >= 80).length}
              </span>
              <span className="stat-label">Güçlü Alan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview Chart */}
      <div className="performance-overview-section">
        <h4 className="subsection-title">
          <Icons.PieChart size={20} color="var(--candidate-primary)" />
          Performans Dağılımı
        </h4>
        
        <div className="performance-distribution">
          <div className="performance-chart">
            <div className="chart-container">
              <div className="radial-progress" style={{
                background: `conic-gradient(
                  var(--status-excellent) 0deg ${averageScore * 3.6}deg,
                  rgba(184, 192, 168, 0.2) ${averageScore * 3.6}deg 360deg
                )`
              }}>
                <div className="chart-center">
                  <span className="overall-score">{Math.round(averageScore)}%</span>
                  <span className="overall-label">Genel Skor</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="performance-levels">
            {[
              { range: '90-100%', label: 'Mükemmel', color: 'var(--status-excellent)', count: scores.filter(s => getScorePercentage(s.score, s.maxScore) >= 90).length },
              { range: '80-89%', label: 'Çok İyi', color: 'var(--status-good)', count: scores.filter(s => getScorePercentage(s.score, s.maxScore) >= 80 && getScorePercentage(s.score, s.maxScore) < 90).length },
              { range: '70-79%', label: 'İyi', color: 'var(--candidate-primary)', count: scores.filter(s => getScorePercentage(s.score, s.maxScore) >= 70 && getScorePercentage(s.score, s.maxScore) < 80).length },
              { range: '60-69%', label: 'Orta', color: 'var(--status-average)', count: scores.filter(s => getScorePercentage(s.score, s.maxScore) >= 60 && getScorePercentage(s.score, s.maxScore) < 70).length },
              { range: '0-59%', label: 'Gelişim Gerekli', color: 'var(--status-needs-improvement)', count: scores.filter(s => getScorePercentage(s.score, s.maxScore) < 60).length }
            ].map((level, index) => (
              <div key={index} className="performance-level-item">
                <div className="level-indicator" style={{ backgroundColor: level.color }}></div>
                <div className="level-info">
                  <span className="level-label">{level.label}</span>
                  <span className="level-range">{level.range}</span>
                </div>
                <div className="level-count">
                  <span className="count-value">{level.count}</span>
                  <span className="count-label">yetkinlik</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competency Categories */}
      {Object.entries(groupedScores).map(([category, categoryScores]) => (
        <div key={category} className="competency-category-section">
          <div className="category-header">
            <h4 className="category-title">
              <Icons.Folder size={20} color="var(--candidate-primary)" />
              {category}
            </h4>
            <div className="category-stats">
              <span className="category-average">
                Ortalama: {Math.round(categoryScores.reduce((sum, score) => 
                  sum + getScorePercentage(score.score, score.maxScore), 0) / categoryScores.length)}%
              </span>
              <span className="category-count">{categoryScores.length} yetkinlik</span>
            </div>
          </div>
          
          <div className="competency-grid">
            {categoryScores.map((score, index) => {
              const percentage = getScorePercentage(score.score, score.maxScore);
              const levelColor = getScoreLevelColor(percentage);
              const insight = getInsight(score.abbreviation, score.score);
              const performanceLevel = getPerformanceLevel(percentage);

              return (
                <div key={index} className="competency-card enhanced">
                  <div className="competency-header">
                    <div className="competency-info">
                      <h5 className="competency-name">
                        {score.fullName}
                        <span className="competency-abbrev">({score.abbreviation})</span>
                      </h5>
                      <p className="competency-description">{score.description}</p>
                    </div>
                    
                    <div className="competency-score-circle">
                      <div 
                        className="score-progress enhanced"
                        style={{
                          background: `conic-gradient(${levelColor} ${percentage * 3.6}deg, rgba(184, 192, 168, 0.15) 0deg)`
                        }}
                      >
                        <div className="score-inner">
                          <span className="score-percentage">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="competency-details enhanced">
                    <div className="score-breakdown">
                      <div className="score-info-row">
                        <span className="score-text">
                          Puan: <strong>{score.score} / {score.maxScore}</strong>
                        </span>
                        <div className="performance-badge" style={{
                          backgroundColor: performanceLevel.bg,
                          color: performanceLevel.color
                        }}>
                          {performanceLevel.level}
                        </div>
                      </div>
                      
                      <div 
                        className="score-bar enhanced"
                        style={{
                          background: `linear-gradient(to right, ${levelColor} ${percentage}%, rgba(184, 192, 168, 0.2) ${percentage}%)`
                        }}
                      />
                    </div>
                    
                    <div className="competency-insight enhanced">
                      <div className="insight-header">
                        <div className="insight-icon">
                          <Icons.Lightbulb size={16} color={levelColor} />
                        </div>
                        <span className="insight-title">Değerlendirme</span>
                      </div>
                      <p className="insight-text">{insight}</p>
                    </div>
                    
                    <div className="competency-footer">
                      <div className="competency-category-badge">
                        <Icons.Tag size={14} color="var(--candidate-text-muted)" />
                        <span>{score.category}</span>
                      </div>
                      
                      <div className="score-trend">
                        <Icons.TrendingUp size={14} color={levelColor} />
                        <span style={{ color: levelColor }}>
                          {percentage >= 80 ? 'Güçlü' : percentage >= 60 ? 'Gelişiyor' : 'Gelişim Gerekli'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress indicator on card */}
                  <div className="card-progress-indicator" style={{
                    background: `linear-gradient(90deg, ${levelColor} ${percentage}%, transparent ${percentage}%)`
                  }}></div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Enhanced Summary Section */}
      <div className="competency-summary enhanced">
        <div className="summary-header">
          <h4 className="summary-title">
            <Icons.BarChart3 size={24} color="var(--candidate-primary)" />
            Yetkinlik Özeti ve Öneriler
          </h4>
          <p className="summary-subtitle">
            Genel performansınız ve gelişim önerileri
          </p>
        </div>
        
        <div className="summary-content">
          <div className="summary-highlights">
            <div className="highlight-card strength">
              <div className="highlight-header">
                <div className="highlight-icon">
                  <Icons.Trophy size={24} color="var(--status-excellent)" />
                </div>
                <div className="highlight-info">
                  <span className="highlight-label">En Güçlü Yetkinlik</span>
                  <span className="highlight-value">
                    {highestScore ? highestScore.fullName : 'Veri yok'}
                  </span>
                  {highestScore && (
                    <span className="highlight-score">
                      {getScorePercentage(highestScore.score, highestScore.maxScore)}% - {getPerformanceLevel(getScorePercentage(highestScore.score, highestScore.maxScore)).level}
                    </span>
                  )}
                </div>
              </div>
              <p className="highlight-description">
                Bu alanda gösterdiğiniz yüksek performans, diğer alanlarda da başarılı olabileceğinizin göstergesidir.
              </p>
            </div>
            
            <div className="highlight-card development">
              <div className="highlight-header">
                <div className="highlight-icon">
                  <Icons.Target size={24} color="var(--status-average)" />
                </div>
                <div className="highlight-info">
                  <span className="highlight-label">Gelişim Alanı</span>
                  <span className="highlight-value">
                    {lowestScore ? lowestScore.fullName : 'Veri yok'}
                  </span>
                  {lowestScore && (
                    <span className="highlight-score">
                      {getScorePercentage(lowestScore.score, lowestScore.maxScore)}% - {getPerformanceLevel(getScorePercentage(lowestScore.score, lowestScore.maxScore)).level}
                    </span>
                  )}
                </div>
              </div>
              <p className="highlight-description">
                Bu alanda daha fazla çalışma ve pratik yaparak gelişiminizi destekleyebilirsiniz.
              </p>
            </div>
            
            <div className="highlight-card overall">
              <div className="highlight-header">
                <div className="highlight-icon">
                  <Icons.BarChart3 size={24} color="var(--candidate-primary)" />
                </div>
                <div className="highlight-info">
                  <span className="highlight-label">Genel Performans</span>
                  <span className="highlight-value">
                    %{Math.round(averageScore)} - {getPerformanceLevel(averageScore).level}
                  </span>
                  <span className="highlight-score">
                    {scores.length} yetkinlik değerlendirildi
                  </span>
                </div>
              </div>
              <p className="highlight-description">
                Genel performansınız {averageScore >= 80 ? 'çok başarılı' : averageScore >= 70 ? 'başarılı' : 'gelişime açık'} seviyededir.
              </p>
            </div>
          </div>
          
          {/* Action Items */}
          <div className="action-items-section">
            <h5 className="action-title">
              <Icons.CheckSquare size={20} color="var(--candidate-primary)" />
              Önerilen Gelişim Adımları
            </h5>
            <div className="action-items">
              <div className="action-item">
                <div className="action-icon">
                  <Icons.BookOpen size={16} color="var(--status-good)" />
                </div>
                <div className="action-content">
                  <span className="action-label">Güçlü alanlarınızı koruyun</span>
                  <span className="action-description">Yüksek performans gösterdiğiniz alanlarda pratiğinizi sürdürün</span>
                </div>
              </div>
              
              <div className="action-item">
                <div className="action-icon">
                  <Icons.Users size={16} color="var(--status-average)" />
                </div>
                <div className="action-content">
                  <span className="action-label">Gelişim alanlarında mentorluk alın</span>
                  <span className="action-description">Düşük skor aldığınız konularda uzman desteği arayın</span>
                </div>
              </div>
              
              <div className="action-item">
                <div className="action-icon">
                  <Icons.Calendar size={16} color="var(--candidate-primary)" />
                </div>
                <div className="action-content">
                  <span className="action-label">Düzenli değerlendirme yapın</span>
                  <span className="action-description">İlerlemeni takip etmek için periyodik değerlendirmeler yapın</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 