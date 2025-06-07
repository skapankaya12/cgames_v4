import type { CompetencyScore } from '../types/results';

export const getInsight = (competency: string, score: number): string => {
  const insights: {[key: string]: string[]} = {
    "DM": [
      "Karar almada daha aktif bir yaklaşım geliştirmelisiniz.",
      "Kararlarınızda dengelisiniz, ancak gelişim alanı mevcut.",
      "Çevik karar alabiliyorsunuz, bu alanda güçlüsünüz."
    ],
    "IN": [
      "İnisiyatif almakta çekingen kalıyorsunuz.",
      "İnisiyatif almada orta seviyedesiniz.",
      "İnisiyatif almada üstün performans gösteriyorsunuz."
    ],
    "AD": [
      "Değişime uyum sağlamakta zorlanıyorsunuz.",
      "Adaptasyon yeteneğiniz makul düzeyde.",
      "Hızlı adapte olma yeteneğiniz dikkat çekiyor."
    ],
    "CM": [
      "İletişim becerileriniz geliştirilebilir.",
      "İletişimde yeterli ancak gelişime açık alanlarınız var.",
      "İletişimde ustalaşmış durumdasınız."
    ],
    "ST": [
      "Stratejik düşünce yapınızı geliştirmelisiniz.",
      "Stratejik düşünme konusunda orta seviyedesiniz.",
      "Stratejik düşünce yapınız güçlü."
    ],
    "TO": [
      "Ekip uyumunuzu geliştirmelisiniz.",
      "Ekip içinde iyi çalışıyorsunuz, ancak gelişebilirsiniz.",
      "Ekip çalışmasında üstün performans gösteriyorsunuz."
    ],
    "RL": [
      "Risk liderliği, risk yönetiminde sorumluluk alma ve liderlik etme becerinizi ölçer.",
      "Risk liderliğinde başarılı bir profiliniz var."
    ],
    "RI": [
      "Risk zekası, riskleri doğru değerlendirme ve analiz etme yeteneğinizi gösterir."
    ]
  };
  
  let level = 0;
  if (score > 30) level = 2;
  else if (score > 20) level = 1;
  
  return insights[competency]?.[level] || insights[competency]?.[0] || "Analiz devam ediyor...";
};

export const getRecommendations = (scores: CompetencyScore[]): string[] => {
  const recommendations: string[] = [];
  
  scores.forEach(comp => {
    const percentage = (comp.score / comp.maxScore) * 100;
    if (percentage < 50) {
      switch (comp.abbreviation) {
        case 'DM':
          recommendations.push('Karar verme süreçlerinizi hızlandırmak için zaman sınırları belirleyin');
          break;
        case 'IN':
          recommendations.push('Proaktif davranış geliştirmek için günlük hedefler koyun');
          break;
        case 'AD':
          recommendations.push('Değişim yönetimi eğitimleri alarak adaptasyon becerinizi geliştirin');
          break;
        case 'CM':
          recommendations.push('İletişim becerilerinizi geliştirmek için sunum eğitimleri alın');
          break;
        case 'ST':
          recommendations.push('Stratejik düşünme için uzun vadeli planlama egzersizleri yapın');
          break;
        case 'TO':
          recommendations.push('Ekip çalışması projelerinde daha aktif rol alın');
          break;
        case 'RL':
          recommendations.push('Risk yönetimi sertifikasyonu alarak liderlik becerinizi geliştirin');
          break;
        case 'RI':
          recommendations.push('Risk analizi araçlarını öğrenerek zekânızı geliştirin');
          break;
      }
    }
  });
  
  return recommendations;
};

export const getScorePercentage = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

export const getScoreLevelColor = (percentage: number): string => {
  if (percentage >= 80) return '#10b981'; // Green
  if (percentage >= 60) return '#3b82f6'; // Blue
  if (percentage >= 40) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}dk ${remainingSeconds}sn`;
  }
  return `${remainingSeconds}sn`;
};

export const getSliderPosition = (value: number): string => {
  return `${(value / 10) * 100}%`;
}; 