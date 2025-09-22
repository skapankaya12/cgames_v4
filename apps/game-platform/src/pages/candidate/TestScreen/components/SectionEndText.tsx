import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionData } from '../../../../data/sections';

interface SectionEndTextProps {
  section: SectionData;
  onContinue: () => void;
  isLastSection?: boolean;
}

export const SectionEndText: React.FC<SectionEndTextProps> = ({ 
  section, 
  onContinue, 
  isLastSection = false 
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'tr';

  return (
    <div className="dialog-game-container">
      <div className="background-image"></div>
      
      <div className="hero-section section-hero">
        <div className="hero-content section-hero-content">
          <div className="wizard-container">
            <div className="wizard-box section-wizard-box">
              {/* Main Title */}
              <h1 className="section-simple-title">
                {section.endText.title[currentLang]}
              </h1>

              {/* Main Description */}
              <div className="section-simple-description">
                <p>{section.endText.content[currentLang]}</p>
              </div>

              {/* Sırada Box */}
              <div className="sirada-box">
                <p>
                  {isLastSection 
                    ? (currentLang === 'en' 
                      ? 'Your decision-making profile is now being analyzed. The results will reveal your unique leadership style and decision priorities.'
                      : 'Karar verme profilin şimdi analiz ediliyor. Sonuçlar senin eşsiz liderlik tarzını ve karar önceliklerini ortaya çıkaracak.'
                    )
                    : (currentLang === 'en' 
                      ? 'The challenges ahead will test different aspects of your decision-making under increasing pressure.'
                      : 'Önündeki zorluklar, artan baskı altında karar vermenin farklı yönlerini test edecek.'
                    )
                  }
                </p>
              </div>

              {/* Continue Button */}
              <button onClick={onContinue} className="section-simple-button">
                {isLastSection 
                  ? (currentLang === 'en' ? 'View Results' : 'Sonuçları Görüntüle')
                  : (currentLang === 'en' ? 'Continue Mission' : 'Devam et')
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">
          {currentLang === 'en' ? 'OlivinHR 2025. All rights reserved' : 'OlivinHR 2025. Tüm hakları saklıdır'}
        </p>
      </div>
    </div>
  );
};
