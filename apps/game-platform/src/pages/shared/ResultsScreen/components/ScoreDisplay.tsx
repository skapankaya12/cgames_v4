import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { CompetencyScore } from '../types/results';
import { getScorePercentage, getScoreLevelColor } from '../utils/insights';

interface ScoreDisplayProps {
  scores: CompetencyScore[];
  onShowHelp: (context: string) => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ scores, onShowHelp }) => {
  if (scores.length === 0) {
    return (
      <div className="score-display empty-state">
        <div className="empty-state-content">
          <Icons.Analytics size={48} color="#9ca3af" />
          <h3>Henüz veri bulunmuyor</h3>
          <p>Oyun tamamlandıktan sonra skorlarınız burada görüntülenecek.</p>
        </div>
      </div>
    );
  }

  // Get competency description - explaining what each competency means
  const getCompetencyDescription = (competencyName: string) => {
    // Define descriptions that explain what each competency means
    const competencyDescriptions: { [key: string]: string } = {
      'Strategic Thinking': 'Stratejik düşünme, uzun vadeli planlama yapabilme, büyük resmi görme ve karmaşık problemleri analiz ederek çözüm geliştirebilme yeteneğidir. Geleceği öngörme ve organizasyonel hedeflere yönelik stratejiler oluşturma becerisini içerir.',
      'Communication': 'İletişim, fikirleri net ve etkili şekilde ifade etme, aktif dinleme, empati kurma ve farklı kitlelerle başarılı etkileşim kurabilme yeteneğidir. Hem sözlü hem de yazılı iletişim becerilerini kapsar.',
      'Leadership': 'Liderlik, takımları yönlendirme, motive etme, vizyon oluşturma ve başkalarını ortak hedefler doğrultusunda etkileyebilme yeteneğidir. Karar verme, delegasyon ve ekip yönetimi becerilerini içerir.',
      'Problem Solving': 'Problem çözme, karmaşık durumları analiz etme, alternatif çözümler geliştirme ve en uygun yaklaşımı seçerek uygulayabilme yeteneğidir. Analitik düşünme ve yaratıcı çözüm üretme becerilerini kapsar.',
      'Adaptability': 'Uyum sağlama, değişen koşullara hızla adapte olabilme, esneklik gösterme ve belirsizlik durumlarında etkili çalışabilme yeteneğidir. Değişim yönetimi ve çeviklik becerilerini içerir.',
      'Innovation': 'İnovasyon, yaratıcı düşünme, yeni fikirler geliştirme, mevcut süreçleri iyileştirme ve özgün çözümler üretebilme yeteneğidir. Farklı bakış açıları geliştirme ve risk alma becerilerini kapsar.',
      'Emotional Intelligence': 'Duygusal zeka, kendi duygularını anlama ve yönetme, başkalarının duygularını fark etme ve empati kurabilme yeteneğidir. Sosyal ilişkilerde etkinlik ve duygusal öz farkındalık becerilerini içerir.',
      'Decision Making': 'Karar verme, mevcut bilgileri değerlendirme, alternatifleri karşılaştırma ve belirsizlik durumlarında etkili kararlar alabilme yeteneğidir. Risk değerlendirmesi ve sonuç odaklı düşünme becerilerini kapsar.'
    };

    return competencyDescriptions[competencyName] || `${competencyName}, profesyonel yaşamda önemli olan ve sürekli geliştirilmesi gereken temel yetkinliklerden biridir. Bu alan, iş performansını ve kariyer gelişimini doğrudan etkileyen kritik beceriler içermektedir.`;
  };

  return (
    <div className="score-display">
      <div className="section-header">
        <h2>Yetkinlik Skorları</h2>
        <button className="section-help-button" onClick={() => onShowHelp('competencies')}>
          <Icons.Lightbulb size={20} />
          Yardım
        </button>
      </div>

      <div className="scores-grid">
        {scores.map((score, index) => {
          const percentage = getScorePercentage(score.score, score.maxScore);
          const levelColor = getScoreLevelColor(percentage);
          const description = getCompetencyDescription(score.fullName);
          
          // Get performance level
          const getPerformanceLevel = (percentage: number) => {
            if (percentage >= 80) return { label: 'Mükemmel', color: '#10b981' };
            if (percentage >= 60) return { label: 'İyi', color: '#708238' };
            if (percentage >= 40) return { label: 'Orta', color: '#f59e0b' };
            return { label: 'Gelişim Gerekli', color: '#ef4444' };
          };
          
          const performanceLevel = getPerformanceLevel(percentage);
          
          return (
            <div key={index} className="score-card">
              <div className="score-header">
                <div className="score-title">
                  <h3>{score.fullName}</h3>
                  <div className="score-level">
                    <Icons.Lightbulb size={16} color={levelColor} />
                    <span style={{ color: performanceLevel.color }}>
                      {performanceLevel.label}
                    </span>
                  </div>
                </div>
                <div className="score-percentage">
                  <span className="percentage-value" style={{ color: levelColor }}>
                    {percentage}%
                  </span>
                </div>
              </div>
              
              <div className="score-progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: levelColor 
                  }}
                />
              </div>

              <div className="score-description">
                <p>{description}</p>
              </div>
              
              <div className="score-details">
                <div className="score-breakdown">
                  <span className="score-raw">
                    {score.score} / {score.maxScore} puan
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="score-summary">
        <div className="summary-card best-score">
          <div className="summary-icon">
            <Icons.Trophy size={20} color="#10b981" />
          </div>
          <div className="summary-content">
            <h4>En İyi Performans</h4>
            <p>{scores[0]?.fullName}</p>
            <span className="summary-score">
              {getScorePercentage(scores[0]?.score || 0, scores[0]?.maxScore || 100)}%
            </span>
          </div>
        </div>

        <div className="summary-card needs-improvement">
          <div className="summary-icon">
            <Icons.Target size={20} color="#f59e0b" />
          </div>
          <div className="summary-content">
            <h4>Gelişim Alanı</h4>
            <p>{scores[scores.length - 1]?.fullName}</p>
            <span className="summary-score">
              {getScorePercentage(scores[scores.length - 1]?.score || 0, scores[scores.length - 1]?.maxScore || 100)}%
            </span>
          </div>
        </div>

        <div className="summary-card average-score">
          <div className="summary-icon">
            <Icons.BarChart3 size={20} color="#667eea" />
          </div>
          <div className="summary-content">
            <h4>Ortalama Performans</h4>
            <p>{scores.length} yetkinlik alanı</p>
            <span className="summary-score">
              {Math.round(scores.reduce((sum, score) => sum + getScorePercentage(score.score, score.maxScore), 0) / scores.length)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 