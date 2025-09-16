import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CVTextExtractionService } from '@cgames/services/CVTextExtractionService';
import { Icons } from '@cgames/ui-kit';
import '@cgames/ui-kit/styles/FormScreen.css';

interface User {
  firstName: string;
  lastName: string;
  company: string;
}

type FormStep = 'welcome' | 'testDetails' | 'rules' | 'form';

const FormScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('ui');
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [user, setUser] = useState<User>({ firstName: '', lastName: '', company: '' });
  const [error, setError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingCV, setIsProcessingCV] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setFileError(t('form.errors.pdfOnly', 'Lütfen sadece PDF dosyası seçin.'));
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError(t('form.errors.fileSize', 'Dosya boyutu 10MB\'dan küçük olmalıdır.'));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Extract CV text for analysis
    setIsProcessingCV(true);
    try {
      console.log('📄 Starting CV text extraction for:', file.name);
      const cvService = new CVTextExtractionService();
      const cvData = await cvService.extractCVData(file);
      
      // Store CV data for later use in recommendations
      cvService.storeCVData(cvData);
      console.log('✅ CV data extracted and stored:', cvData.fileName);
    } catch (error) {
      console.error('❌ CV text extraction failed:', error);
      // Don't block the form submission if CV extraction fails
      setFileError(t('form.errors.cvAnalysisFailed', 'CV analizi başarısız oldu, ancak dosya yine de yüklenecek.'));
    } finally {
      setIsProcessingCV(false);
    }
  };

  const uploadPDFToGoogleSheets = async (file: File, userData: User): Promise<boolean> => {
    try {
      setIsUploading(true);
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:application/pdf;base64, prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Prepare data for Google Apps Script
      const pdfData = {
        action: 'uploadPDF',
        fileName: file.name,
        fileSize: file.size,
        fileData: base64,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company,
        timestamp: new Date().toISOString()
      };

      // Send to Google Apps Script
      const API_URL = 'https://script.google.com/macros/s/AKfycbw6qC8GtrcClw9dCD_GZBZ7muzId_uD9GOserb-L5pJCY9c8zB-E7yH6ZA8v7VB-p9g/exec';
      
      const formData = new FormData();
      Object.entries(pdfData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log('PDF upload result:', result);
      
      return result.includes('success') || result.includes('başarı');
    } catch (error) {
      console.error('PDF upload error:', error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.firstName.trim() || !user.lastName.trim() || !user.company.trim()) {
      setError(t('form.errors.allFields', 'Lütfen tüm alanları doldurunuz.'));
      return;
    }
    if (!consentChecked) {
      setError(t('form.errors.consentRequired', 'Teste başlamak için onay vermeniz gerekmektedir.'));
      return;
    }

    // Upload PDF if selected
    if (selectedFile) {
      setError(null);
      const uploadSuccess = await uploadPDFToGoogleSheets(selectedFile, user);
      if (!uploadSuccess) {
        setError(t('form.errors.pdfUploadFailed', 'PDF yükleme başarısız oldu. Devam etmek istiyor musunuz?'));
        // Allow user to continue even if PDF upload fails
      }
    }

    sessionStorage.setItem('user', JSON.stringify(user));
    navigate('/candidate/test/1');
  };

  const handleBack = () => {
    if (currentStep === 'welcome') {
      navigate('/candidate');
    } else if (currentStep === 'testDetails') {
      setCurrentStep('welcome');
    } else if (currentStep === 'rules') {
      setCurrentStep('testDetails');
    } else if (currentStep === 'form') {
      setCurrentStep('rules');
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 'welcome') {
      setCurrentStep('testDetails');
    } else if (currentStep === 'testDetails') {
      setCurrentStep('rules');
    } else if (currentStep === 'rules') {
      setCurrentStep('form');
    }
  };

  const renderWelcomeStep = () => (
    <div className="step-content welcome-step">
      <div className="step-header">
        <h2 className="step-title">{t('form.welcomeStep.title')}</h2>
        <div className="step-indicator">
          <span className="step-number">1</span>
          <span className="step-total">/ 4</span>
        </div>
      </div>
      
      <div className="mission-content">
        <h3 className="mission-title">{t('form.welcomeStep.missionTitle')}</h3>
        <div className="mission-description">
          <p>{t('form.welcomeStep.missionDescription')}</p>
          <p>{t('form.welcomeStep.journeyDuration')}</p>
        </div>
        
        <div className="mission-highlight">
          {t('form.welcomeStep.missionHighlight')}
        </div>
      </div>

      <button onClick={handleNext} className="next-button">
        {t('buttons.continue', 'Devam Et')}
        <span className="button-arrow">→</span>
      </button>
    </div>
  );

  const renderTestDetailsStep = () => (
    <div className="step-content test-details-step">
      <div className="step-header">
        <h2 className="step-title">{t('form.welcomeStep.testDetails.title')}</h2>
        <div className="step-indicator">
          <span className="step-number">2</span>
          <span className="step-total">/ 4</span>
        </div>
      </div>
      
      <div className="test-details-section">
        <div className="test-description">
          <p>{t('form.welcomeStep.testDetails.description')}</p>
          <p>{t('form.welcomeStep.testDetails.choiceInfo')}</p>
        </div>

        <div className="important-note">
          <p>{t('form.welcomeStep.testDetails.importantNote')}</p>
        </div>

        <div className="key-question-section">
          <h3 className="priorities-title">{t('form.welcomeStep.testPriorities.title')}</h3>
          <p className="key-question">{t('form.welcomeStep.testPriorities.keyQuestion')}</p>
          <ul className="priorities-list">
            <li>{t('form.welcomeStep.testPriorities.priorities.0')}</li>
            <li>{t('form.welcomeStep.testPriorities.priorities.1')}</li>
            <li>{t('form.welcomeStep.testPriorities.priorities.2')}</li>
            <li>{t('form.welcomeStep.testPriorities.priorities.3')}</li>
          </ul>
        </div>

        <div className="test-purpose">
          <p>{t('form.welcomeStep.testPriorities.purpose')}</p>
        </div>
      </div>

      <button onClick={handleNext} className="next-button">
        {t('buttons.continue', 'Devam Et')}
        <span className="button-arrow">→</span>
      </button>
    </div>
  );

  const renderRulesStep = () => (
    <div className="step-content rules-step">
      <div className="step-header">
        <h2 className="step-title">{t('form.rulesStep.title')}</h2>
        <div className="step-indicator">
          <span className="step-number">3</span>
          <span className="step-total">/ 4</span>
        </div>
      </div>
      
      <div className="rules-content">
        <div className="rule-item">
          <div className="rule-icon">
            <Icons.Target size={48} color="#667eea" />
          </div>
          <div className="rule-text">
            <strong>{t('form.rulesStep.rule1.title')}</strong>
            <p>{t('form.rulesStep.rule1.description')}</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">
            <Icons.Refresh size={48} color="#10b981" />
          </div>
          <div className="rule-text">
            <strong>{t('form.rulesStep.rule2.title')}</strong>
            <p>{t('form.rulesStep.rule2.description')}</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">
            <Icons.Check size={48} color="#f59e0b" />
          </div>
          <div className="rule-text">
            <strong>{t('form.rulesStep.rule3.title')}</strong>
            <p>{t('form.rulesStep.rule3.description')}</p>
          </div>
        </div>
        
        <div className="privacy-notice">
          
          <p>{t('form.rulesStep.privacyNotice')}</p>
        </div>
      </div>

      <button onClick={handleNext} className="next-button">
        {t('buttons.understood', 'Anladım, Devam Et')}
        <span className="button-arrow">→</span>
      </button>
    </div>
  );

  const renderFormStep = () => (
    <div className="step-content form-step">
      <div className="step-header">
        <h2 className="step-title">{t('form.formStep.title')}</h2>
        <div className="step-indicator">
          <span className="step-number">4</span>
          <span className="step-total">/ 4</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">{t('form.formStep.firstName')}</label>
          <input
            id="firstName"
            type="text"
            value={user.firstName}
            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            placeholder={t('form.formStep.firstName')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName" className="form-label">{t('form.formStep.lastName')}</label>
          <input
            id="lastName"
            type="text"
            value={user.lastName}
            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            placeholder={t('form.formStep.lastName')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="company" className="form-label">{t('form.formStep.company')}</label>
          <input
            id="company"
            type="text"
            value={user.company}
            onChange={(e) => setUser({ ...user, company: e.target.value })}
            placeholder={t('form.formStep.company')}
            required
          />
        </div>

        <div className="form-group pdf-upload-group">
          <label htmlFor="pdfUpload" className="form-label">
            {t('form.formStep.uploadCV')}
          </label>
          <div className="pdf-upload-container">
            <input
              id="pdfUpload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="pdf-input"
              disabled={isUploading || isProcessingCV}
            />
            <div className="pdf-upload-info">
              {selectedFile ? (
                <div className="selected-file">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  {!isUploading && !isProcessingCV && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="remove-file"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <span>{t('form.formStep.selectFile')}</span>
                </div>
              )}
            </div>
            {isProcessingCV && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <span>{t('form.formStep.processingCV')}</span>
              </div>
            )}
            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <span>{t('form.formStep.uploading')}</span>
              </div>
            )}
          </div>
          {fileError && <div className="file-error">{fileError}</div>}
          <div className="pdf-help-text">
            {t('form.formStep.cvSecurity')}
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="consent-section">
          <div className="consent-checkbox">
            <input
              type="checkbox"
              id="consent"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="consent-input"
            />
            <label htmlFor="consent" className="consent-label">
              <span className="checkbox-custom"></span>
              <span className="consent-text">{t('form.formStep.consent')}</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="start-button"
          disabled={!user.firstName.trim() || !user.lastName.trim() || !user.company.trim() || !consentChecked || isUploading || isProcessingCV}
        >
          {isProcessingCV ? t('form.formStep.processingCV') : isUploading ? t('form.formStep.uploading') : t('buttons.startJourney', 'Yolculuğa Başla')}
        </button>
      </form>
    </div>
  );

  return (
    <div className="dialog-game-container">
      <div className="background-image"></div>
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="wizard-container">
            <div className="wizard-box">
              <button 
                onClick={handleBack}
                className="back-button"
              >
                ← {t('buttons.back', 'Geri')}
              </button>
              
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'testDetails' && renderTestDetailsStep()}
        {currentStep === 'rules' && renderRulesStep()}
        {currentStep === 'form' && renderFormStep()}
            </div>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p className="footer-text">{t('app.copyright', 'OlivinHR 2025. All rights reserved')}</p>
      </div>
    </div>
  );
};

export default FormScreen; 