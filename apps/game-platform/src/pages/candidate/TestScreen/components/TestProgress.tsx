import React from 'react';

const questionTitles = [
  "Yük Sorumlusu ile İlk Karşılaşma",
  "Çıkış Koridoru",
  "Rakip Firma Teklifi",
  "Devriye Gemisi Engeli",
  "Navigasyon Kararı",
  "Meteor Tehdidi",
  "Kimlik Doğrulama",
  "Korsan Saldırısı",
  "Terminal İlk İletişim",
  "Gecikme Alarmı",
  "Kargo Sarsıntısı",
  "Teslimat Alanı Boş",
  "Motor Alarmı",
  "Kargo İncelemesi",
  "Navigasyon Kaybı",
  "Alıcı Bilgisi Eksik"
];

interface TestProgressProps {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
  isTransitioning: boolean;
  onPrevious: () => void;
}

export const TestProgress: React.FC<TestProgressProps> = ({
  progress,
  currentQuestion,
  totalQuestions,
  isTransitioning,
  onPrevious
}) => {
  return (
    <div className="progress-hud">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="header-content">
        <button
          className="header-prev-button"
          onClick={onPrevious}
          disabled={currentQuestion === 0 || isTransitioning}
        >
          Geri
        </button>
        <div className="question-counter">
          Soru {currentQuestion + 1} / {totalQuestions} - {questionTitles[currentQuestion]}
        </div>
      </div>
    </div>
  );
}; 