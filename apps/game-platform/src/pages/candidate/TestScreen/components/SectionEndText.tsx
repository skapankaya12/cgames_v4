import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionData } from '../../../../data/sections';
import { Icons } from '@cgames/ui-kit';

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
              {/* Section Complete Header */}
              <div className="section-header">
                <div className="section-icon">
                  {isLastSection ? (
                    <Icons.Trophy size={64} color="#ffc107" />
                  ) : (
                    <Icons.Check size={64} color="#00bfff" />
                  )}
                </div>
                <h1 className="section-main-title">
                  {section.endText.title[currentLang]}
                </h1>
                {!isLastSection && (
                  <div className="section-indicator">
                    <span className="progress-text">
                      {currentLang === 'en' 
                        ? `Section ${section.id} of 4 Complete`
                        : `4 Bölümden ${section.id}. Tamamlandı`
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Section Content */}
              <div className="section-content">
                <div className="section-description">
                  <p>{section.endText.content[currentLang]}</p>
                </div>

                {/* Next Step Preview Box */}
                <div className="next-step-box">
                  <div className="next-step-icon">
                    <span>&gt;</span>
                  </div>
                  <div className="next-step-content">
                    <h3>{currentLang === 'en' ? 'Coming Up:' : 'Sırada:'}</h3>
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
                </div>
              </div>

              {/* Continue Button */}
              <button onClick={onContinue} className="section-main-button">
                <span className="button-text">
                  {isLastSection 
                    ? (currentLang === 'en' ? 'View Results' : 'Sonuçları Görüntüle')
                    : (currentLang === 'en' ? 'Continue Mission' : 'Göreve Devam Et')
                  }
                </span>
                <span className="button-arrow">
                  {isLastSection ? '✓' : '→'}
                </span>
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
