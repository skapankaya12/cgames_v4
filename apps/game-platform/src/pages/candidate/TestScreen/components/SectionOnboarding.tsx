import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionData } from '../../../../data/sections';

interface SectionOnboardingProps {
  section: SectionData;
  onContinue: () => void;
}

export const SectionOnboarding: React.FC<SectionOnboardingProps> = ({ section, onContinue }) => {
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
                {section.title[currentLang]}
              </h1>

              {/* Main Description */}
              <div className="section-simple-description">
                <p>{section.onboarding.description[currentLang]}</p>
              </div>

              {/* Sırada Box */}
              <div className="sirada-box">
                <p>
                  {currentLang === 'en' 
                    ? 'The upcoming challenges will test different aspects of your decision-making under increasing pressure.'
                    : 'Önündeki zorluklar, artan baskı altında karar vermenin farklı yönlerini test edecek.'
                  }
                </p>
              </div>

              {/* Continue Button */}
              <button onClick={onContinue} className="section-simple-button">
                {currentLang === 'en' ? 'Begin Section' : 'Bölümü Başlat'}
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
