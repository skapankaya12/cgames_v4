import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { SessionAnalytics } from '@cgames/services';
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

    const avgTimePerQuestion = interactionAnalytics.averageResponseTime || 0;
  const changedAnswersCount = interactionAnalytics.totalAnswerChanges || 0;
  const deviceType = 'Desktop';
  const browserInfo = 'Modern Browser';

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
              <p className="stat-value">{formatTime((interactionAnalytics.endTime || Date.now()) - interactionAnalytics.startTime)}</p>
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
              <Icons.Refresh size={24} color="#f59e0b" />
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
      {interactionAnalytics.questionAnalytics && interactionAnalytics.questionAnalytics.length > 0 && (
        <div className="analytics-chart-section">
          <h4>Soru Bazlı Süre Analizi</h4>
          <div className="question-times-chart">
            {interactionAnalytics.questionAnalytics.map((qa, index: number) => {
              const time = qa.totalTime || 0;
              const maxTime = Math.max(...interactionAnalytics.questionAnalytics.map(q => q.totalTime || 0));
              const heightPercent = maxTime > 0 ? (time / maxTime) * 100 : 0;
              const isSlowResponse = time > avgTimePerQuestion * 1.5;
              const isFastResponse = time < avgTimePerQuestion * 0.5;
              
              return (
                <div key={index} className="question-time-bar">
                  <div 
                    className={`time-bar ${isSlowResponse ? 'slow' : isFastResponse ? 'fast' : 'normal'}`}
                    style={{ height: `${heightPercent}%` }}
                    title={`Soru ${qa.questionId}: ${formatTime(time)}`}
                  />
                  <span className="question-number">{qa.questionId}</span>
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

        </div>
      </div>
    </div>
  );
}; 