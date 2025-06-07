import React from 'react';
import { Icons } from '../../../../components/SvgIcons';
import type { SessionAnalytics } from '../../../../services/InteractionTracker';
import { formatTime } from '../utils/insights';

interface AnalyticsSectionProps {
  interactionAnalytics: SessionAnalytics | null;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ 
  interactionAnalytics 
}) => {
  if (!interactionAnalytics) {
    return (
      <div className="analytics-section">
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '24px'
        }}>
          <Icons.Brain size={24} color="#667eea" />
          <span>Davranış Analizi</span>
        </h3>
        
        <div className="analytics-no-data">
          <div className="no-data-icon">
            <Icons.AlertCircle size={48} color="#6b7280" />
          </div>
          <h4>Davranış Verileri Bulunamadı</h4>
          <p>
            Bu testte detaylı davranış analizi verisi toplanmamış. 
            Yeni testlerde daha kapsamlı analiz için test süresince etkileşim verileri kaydedilecektir.
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

  const deviceType = interactionAnalytics.deviceInfo?.type || 'Bilinmiyor';
  const browserInfo = interactionAnalytics.userAgent?.includes('Chrome') ? 'Chrome' :
                     interactionAnalytics.userAgent?.includes('Firefox') ? 'Firefox' :
                     interactionAnalytics.userAgent?.includes('Safari') ? 'Safari' :
                     interactionAnalytics.userAgent?.includes('Edge') ? 'Edge' : 'Diğer';

  return (
    <div className="analytics-section">
      <h3 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '24px'
      }}>
        <Icons.Brain size={24} color="#667eea" />
        <span>Davranış Analizi</span>
      </h3>

      {/* Overview Stats */}
      <div className="analytics-overview">
        <div className="analytics-stat-grid">
          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Icons.Clock size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <h4>Toplam Süre</h4>
              <p className="stat-value">{formatTime(interactionAnalytics.totalTime)}</p>
              <p className="stat-subtitle">Test tamamlama süresi</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Icons.Timer size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <h4>Ortalama Soru Süresi</h4>
              <p className="stat-value">{formatTime(avgTimePerQuestion)}</p>
              <p className="stat-subtitle">Soru başına ortalama</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Icons.RefreshCw size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <h4>Değiştirilen Cevaplar</h4>
              <p className="stat-value">{changedAnswersCount}</p>
              <p className="stat-subtitle">Kararsızlık göstergesi</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Icons.Smartphone size={24} color="#8b5cf6" />
            </div>
            <div className="stat-content">
              <h4>Cihaz Türü</h4>
              <p className="stat-value">{deviceType}</p>
              <p className="stat-subtitle">{browserInfo} tarayıcı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Times Chart */}
      {interactionAnalytics.questionTimes && interactionAnalytics.questionTimes.length > 0 && (
        <div className="analytics-chart-section">
          <h4>Soru Bazlı Süre Analizi</h4>
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
              <span>Hızlı cevap (&lt; {formatTime(avgTimePerQuestion * 0.5)})</span>
            </div>
            <div className="legend-item">
              <div className="legend-color normal"></div>
              <span>Normal tempo</span>
            </div>
            <div className="legend-item">
              <div className="legend-color slow"></div>
              <span>Yavaş cevap (&gt; {formatTime(avgTimePerQuestion * 1.5)})</span>
            </div>
          </div>
        </div>
      )}

      {/* Behavior Patterns */}
      {interactionAnalytics.behaviorPatterns && Object.keys(interactionAnalytics.behaviorPatterns).length > 0 && (
        <div className="behavior-patterns-section">
          <h4>Davranış Patternleri</h4>
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

      {/* Changed Answers Analysis */}
      {changedAnswersCount > 0 && (
        <div className="changed-answers-section">
          <h4>Cevap Değişiklikleri Analizi</h4>
          <div className="changed-answers-insights">
            <div className="insight-card">
              <div className="insight-icon">
                <Icons.AlertTriangle size={20} color="#f59e0b" />
              </div>
              <div className="insight-content">
                <h5>Kararsızlık Seviyesi</h5>
                <p>
                  {changedAnswersCount} soruda cevabınızı değiştirdiniz. 
                  {changedAnswersCount > 5 
                    ? ' Bu, yüksek kararsızlık gösterebilir.'
                    : changedAnswersCount > 2 
                    ? ' Bu, normal düzeyde düşünce sürecidir.'
                    : ' Bu, kararlı bir yaklaşım gösterir.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Information */}
      <div className="session-info-section">
        <h4>Oturum Bilgileri</h4>
        <div className="session-info-grid">
          <div className="session-info-item">
            <Icons.Hash size={16} color="#6b7280" />
            <span>Oturum ID: {interactionAnalytics.sessionId}</span>
          </div>
          {interactionAnalytics.deviceInfo?.screenWidth && (
            <div className="session-info-item">
              <Icons.Monitor size={16} color="#6b7280" />
              <span>
                Ekran: {interactionAnalytics.deviceInfo.screenWidth} × {interactionAnalytics.deviceInfo.screenHeight}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 