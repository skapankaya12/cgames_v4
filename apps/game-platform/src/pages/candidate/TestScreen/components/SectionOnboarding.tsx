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
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="section-onboarding-container">
            <div className="section-onboarding-box">
              {/* Section Header */}
              <div className="section-header">
                <div className="section-icon">
                  <Icons.Target size={48} color="#00bfff" />
                </div>
                <h1 className="section-title">
                  {section.title[currentLang]}
                </h1>
                <div className="section-indicator">
                  <span className="section-number">{section.id}</span>
                  <span className="section-total">/ 4</span>
                </div>
              </div>

              {/* Mission Briefing */}
              <div className="mission-briefing">
                <h2 className="briefing-title">
                  {section.onboarding.title[currentLang]}
                </h2>
                
                <div className="briefing-description">
                  <p>{section.onboarding.description[currentLang]}</p>
                </div>

                {/* Key Points */}
                <div className="key-points-section">
                  <h3 className="key-points-title">
                    {currentLang === 'en' ? 'Key Focus Areas:' : 'Dikkat Etmen Gerekenler:'}
                  </h3>
                  <ul className="key-points-list">
                    {section.onboarding.keyPoints[currentLang].map((point: string, index: number) => (
                      <li key={index} className="key-point-item">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Focus Areas */}
                <div className="focus-areas-section">
                  <h3 className="focus-areas-title">
                    {currentLang === 'en' ? 'Decision Focus:' : 'Karar Odağı:'}
                  </h3>
                  <div className="focus-areas-grid">
                    {section.onboarding.focus[currentLang].map((focus: string, index: number) => (
                      <div key={index} className="focus-item">
                        <div className="focus-icon">
                          <Icons.Check size={20} color="#00bfff" />
                        </div>
                        <span className="focus-text">{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mission Alert */}
                <div className="mission-alert">
                  <div className="alert-icon">
                    <Icons.AlertTriangle size={24} color="#ffc107" />
                  </div>
                  <p className="alert-text">
                    {currentLang === 'en' 
                      ? 'Each choice will highlight one priority while putting another in the background. There are no perfect answers - only your authentic decision-making style.'
                      : 'Her seçim bir önceliğini öne çıkarırken diğerini geride bırakacak. Mükemmel cevap yok - sadece senin otantik karar verme tarzın var.'
                    }
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <button onClick={onContinue} className="section-continue-button">
                <span className="button-text">
                  {currentLang === 'en' ? 'Begin Section' : 'Bölümü Başlat'}
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
