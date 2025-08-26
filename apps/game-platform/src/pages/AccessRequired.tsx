import React from 'react';
import LanguageSelector from '../components/LanguageSelector';
import '@cgames/ui-kit/styles/IdentityScreen.css';

const AccessRequired: React.FC = () => {
  return (
    <div className="dialog-game-container">
      <div className="hero-section">
        <div className="language-selector-container" style={{ position: 'absolute', top: 16, right: 16 }}>
          <LanguageSelector />
        </div>
        <div className="hero-content">
          <div className="signup-container">
            <div className="signup-box" style={{ textAlign: 'center' }}>
              <h2>Access link required</h2>
              <p style={{ marginTop: 8 }}>
                This assessment is available only via a unique invitation link.
              </p>
              <p style={{ marginTop: 8 }}>
                Please use the button in your email invitation or contact your recruiter to request a new link.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="game-footer">
        <p className="footer-text">Cognitive Games. All rights reserved</p>
      </div>
    </div>
  );
};

export default AccessRequired;


