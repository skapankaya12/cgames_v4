import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionData } from '../../../../data/sections';
import { Icons } from '@cgames/ui-kit';

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
              {/* Section Header */}
              <div className="section-header">
                <div className="section-icon">
                  <Icons.Target size={48} color="#00bfff" />
                </div>
                <h1 className="section-main-title">
                  {section.title[currentLang]}
                </h1>
                <div className="section-indicator">
                  <span className="section-number">{section.id}</span>
                  <span className="section-total">/ 4</span>
                </div>
              </div>

              {/* Mission Briefing */}
              <div className="section-content">
                <h2 className="section-subtitle">
                  {section.onboarding.title[currentLang]}
                </h2>
                
                <div className="section-description">
                  <p>{section.onboarding.description[currentLang]}</p>
                </div>

                {/* Next Step Preview Box */}
                <div className="next-step-box">
                  <div className="next-step-icon">
                    <span>&gt;</span>
                  </div>
                  <div className="next-step-content">
                    <h3>{currentLang === 'en' ? 'Coming Up:' : 'Sırada:'}</h3>
                    <p>
                      {currentLang === 'en' 
                        ? 'The upcoming challenges will test different aspects of your decision-making under increasing pressure.'
                        : 'Önündeki zorluklar, artan baskı altında karar vermenin farklı yönlerini test edecek.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button onClick={onContinue} className="section-main-button">
                <span className="button-text">
                  {currentLang === 'en' ? 'Continue Mission' : 'Göreve Devam Et'}
                </span>
                <span className="button-arrow">→</span>
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
