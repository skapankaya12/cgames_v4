import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/IdentityScreen.css';

interface User {
  firstName: string;
  lastName: string;
  company: string;
}

const IdentityScreen2 = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ firstName: '', lastName: '', company: '' });
  const [error, setError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setFileError('Lütfen sadece PDF dosyası seçin.');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
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
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }
    if (!consentChecked) {
      setError('Teste başlamak için onay vermeniz gerekmektedir.');
      return;
    }

    // Upload PDF if selected
    if (selectedFile) {
      setError(null);
      const uploadSuccess = await uploadPDFToGoogleSheets(selectedFile, user);
      if (!uploadSuccess) {
        setError('PDF yükleme başarısız oldu. Devam etmek istiyor musunuz?');
        // Allow user to continue even if PDF upload fails
      }
    }

    sessionStorage.setItem('user2', JSON.stringify(user));
    navigate('/game2/test');
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Video autoplay failed:', error);
      });
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
  };

  return (
    <div className="dialog-game-container">
      <video 
        ref={videoRef}
        className={`background-video ${videoLoaded ? 'loaded' : ''}`}
        src="/videoidentityscreen.mp4"
        playsInline
        muted
        loop
        autoPlay
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      >
        Your browser does not support the video tag.
      </video>
      
      {!videoLoaded && !videoError && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {videoError && (
        <div className="video-error">
          <p>Video yüklenemedi</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Yeniden Dene
          </button>
        </div>
      )}

      <div className="hero-section">
        <div className="hero-content">
          <div className="signup-container">
            <div className="signup-box">
              <h2 className="welcome-title">Hoş geldin!</h2>
              <div className="mission-text">
                <div className="coming-soon-banner">
                  <h3>🚀 Coming Soon</h3>
                  <p>Game 2 is currently under development. New challenges and scenarios are being prepared for you!</p>
                </div>
                <p>İkinci galaktik görevin yakında hazır olacak.</p>
                <p>Yeni senaryolar, farklı kararlar ve daha da zorlu liderlik testleri seni bekliyor.</p>
                <p>Bu oyun da aynı yapıda olacak: kimlik girişi, test soruları ve sonuçlar.</p>
                
                <div className="rules-section">
                  <p><strong>Yakında:</strong></p>
                  <p>• Yeni galaktik senaryolar</p>
                  <p>• Farklı liderlik zorlukları</p>
                  <p>• Gelişmiş analiz sistemi</p>
                  <p>• Karşılaştırmalı sonuçlar</p>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName2" className="form-label">İsim</label>
                  <input
                    id="firstName2"
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    placeholder="İsminizi girin"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName2" className="form-label">Soyisim</label>
                  <input
                    id="lastName2"
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    placeholder="Soyisminizi girin"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company2" className="form-label">Şirket</label>
                  <input
                    id="company2"
                    type="text"
                    value={user.company}
                    onChange={(e) => setUser({ ...user, company: e.target.value })}
                    placeholder="Şirketinizi girin"
                    required
                  />
                </div>

                <div className="form-group pdf-upload-group">
                  <label htmlFor="pdfUpload2" className="form-label">
                    CV/Özgeçmiş (PDF) - İsteğe Bağlı
                  </label>
                  <div className="pdf-upload-container">
                    <input
                      id="pdfUpload2"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="pdf-input"
                      disabled={isUploading}
                    />
                    <div className="pdf-upload-info">
                      {selectedFile ? (
                        <div className="selected-file">
                          <span className="file-icon">📄</span>
                          <span className="file-name">{selectedFile.name}</span>
                          <span className="file-size">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          {!isUploading && (
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
                          <span>PDF dosyası seçin (Maksimum 10MB)</span>
                        </div>
                      )}
                    </div>
                    {isUploading && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div className="progress-fill"></div>
                        </div>
                        <span>Yükleniyor...</span>
                      </div>
                    )}
                  </div>
                  {fileError && <div className="file-error">{fileError}</div>}
                  <div className="pdf-help-text">
                    CV'niz analiz için güvenli şekilde saklanacak ve sadece test sonuçlarınızla birlikte kullanılacaktır.
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                
                <div className="consent-section">
                  <div className="consent-checkbox">
                    <input
                      type="checkbox"
                      id="consent2"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="consent-input"
                    />
                    <label htmlFor="consent2" className="consent-label">
                      <span className="checkbox-custom"></span>
                      <span className="consent-text">Onaylıyorum</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="start-button"
                  disabled={!user.firstName.trim() || !user.lastName.trim() || !user.company.trim() || !consentChecked || isUploading}
                >
                  {isUploading ? 'Yükleniyor...' : 'Demo Yolculuğa Başla'}
                </button>
              </form>
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

export default IdentityScreen2; 