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
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="section-end-container">
            <div className="section-end-box">
              {/* Section Complete Header */}
              <div className="section-complete-header">
                <div className="complete-icon">
                  {isLastSection ? (
                    <Icons.Trophy size={64} color="#ffc107" />
                  ) : (
                    <Icons.Check size={64} color="#00bfff" />
                  )}
                </div>
                <h1 className="section-complete-title">
                  {section.endText.title[currentLang]}
                </h1>
                {!isLastSection && (
                  <div className="section-progress-indicator">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(section.id / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {currentLang === 'en' 
                        ? `Section ${section.id} of 4 Complete`
                        : `4 Bölümden ${section.id}. Tamamlandı`
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Section Summary */}
              <div className="section-summary">
                <div className="summary-content">
                  <p className="summary-text">
                    {section.endText.content[currentLang]}
                  </p>
                </div>

                {!isLastSection && (
                  <div className="next-section-preview">
                    <div className="preview-icon">
                      <Icons.ChevronRight size={32} color="#00bfff" />
                    </div>
                    <div className="preview-content">
                      <h3 className="preview-title">
                        {currentLang === 'en' ? 'Coming Next:' : 'Sırada:'}
                      </h3>
                      <p className="preview-description">
                        {currentLang === 'en' 
                          ? 'The challenges ahead will test different aspects of your decision-making under increasing pressure.'
                          : 'Önündeki zorluklar, artan baskı altında karar vermenin farklı yönlerini test edecek.'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {isLastSection && (
                  <div className="final-mission-summary">
                    <div className="mission-stats">
                      <div className="stat-item">
                        <Icons.Target size={32} color="#00bfff" />
                        <div className="stat-content">
                          <span className="stat-label">
                            {currentLang === 'en' ? 'Decisions Made' : 'Verilen Kararlar'}
                          </span>
                          <span className="stat-value">16</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <Icons.CheckCircle size={32} color="#10b981" />
                        <div className="stat-content">
                          <span className="stat-label">
                            {currentLang === 'en' ? 'Sections Completed' : 'Tamamlanan Bölümler'}
                          </span>
                          <span className="stat-value">4/4</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="final-message">
                      <p className="final-text">
                        {currentLang === 'en' 
                          ? 'Your decision-making profile is now being analyzed. The results will reveal your unique leadership style and decision priorities.'
                          : 'Karar verme profilin şimdi analiz ediliyor. Sonuçlar senin eşsiz liderlik tarzını ve karar önceliklerini ortaya çıkaracak.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button onClick={onContinue} className="section-continue-button">
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
