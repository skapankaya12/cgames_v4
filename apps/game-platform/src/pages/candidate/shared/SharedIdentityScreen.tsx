import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '@cgames/ui-kit/styles/hr.css';

interface SharedIdentityScreenProps {
  assessmentType: 'calisan-bagliligi' | 'takim-degerlendirme' | 'yonetici-degerlendirme';
  onContinue: (data: any) => void;
}

const SharedIdentityScreen: React.FC<SharedIdentityScreenProps> = ({ assessmentType, onContinue }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('common');
  
  const [formData, setFormData] = useState({
    department: '',
    position: '',
    experience: '',
    workMode: 'office'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    // Check if we have a valid token
    const token = searchParams.get('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Store token for later use in test screen
    sessionStorage.setItem(`${assessmentType}-token`, token);
    console.log('💾 [SharedIdentityScreen] Stored token for assessment:', assessmentType, token.substring(0, 8) + '...');

    // Load any saved form data
    const savedData = sessionStorage.getItem(`${assessmentType}-identity`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.warn('Failed to parse saved identity data:', error);
      }
    }
  }, [assessmentType, navigate, searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.department.trim()) {
      newErrors.department = t('assessments.form.errors.departmentRequired');
    }
    
    if (!formData.position.trim()) {
      newErrors.position = t('assessments.form.errors.positionRequired');
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = t('assessments.form.errors.experienceRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    console.log('💾 [SharedIdentityScreen] Saving identity data:');
    console.log('  - Assessment Type:', assessmentType);
    console.log('  - Form Data:', {
      department: formData.department,
      position: formData.position,
      experience: formData.experience,
      workMode: formData.workMode
    });
    
    // Save form data with both keys for compatibility
    const storageKey1 = `${assessmentType}-identity`;
    const storageKey2 = `${assessmentType}-candidate-data`;
    
    sessionStorage.setItem(storageKey1, JSON.stringify(formData));
    sessionStorage.setItem(storageKey2, JSON.stringify(formData));
    
    console.log('  - Saved to keys:', [storageKey1, storageKey2]);
    
    // Call parent callback
    onContinue(formData);
  };

  return (
    <div className="hr-login-page">
      <div className="hr-login-container">
        <div className="hr-login-card">
          <div className="login-logo">
            <img src="/HR.png" alt="OlivinHR" className="logo-image" />
          </div>

          <div className="page-header">
            <h1 className="page-title">
              {t(`assessments.titles.${assessmentType}`)}
            </h1>
            <p className="page-subtitle">
              {t(`assessments.descriptions.${assessmentType}`)}
            </p>
          </div>

          <form className="create-company-form" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div className="form-section">
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#6b7280' }}>
                {t('assessments.form.instructions')}
              </p>

              <div className="form-row">
                <div className="form-group">
                  <div style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    background: 'transparent',
                    border: 'none'
                  }}>
                    {t('assessments.form.department')} *
                  </div>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`form-input ${errors.department ? 'error' : ''}`}
                    placeholder={t('assessments.form.departmentPlaceholder')}
                    style={{ 
                      fontSize: '0.9rem',
                      textAlign: 'start',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '0.75rem'
                    }}
                  />
                  {errors.department && <span className="field-error">{errors.department}</span>}
                </div>
                
                <div className="form-group">
                  <div style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    background: 'transparent',
                    border: 'none'
                  }}>
                    {t('assessments.form.position')} *
                  </div>
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`form-input ${errors.position ? 'error' : ''}`}
                    placeholder={t('assessments.form.positionPlaceholder')}
                    style={{ 
                      fontSize: '0.9rem',
                      textAlign: 'start',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '0.75rem'
                    }}
                  />
                  {errors.position && <span className="field-error">{errors.position}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    background: 'transparent',
                    border: 'none'
                  }}>
                    {t('assessments.form.experience')} *
                  </div>
                  <select
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className={`form-input ${errors.experience ? 'error' : ''}`}
                    style={{ 
                      fontSize: '0.9rem', 
                      textAlign: 'start',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '0.75rem'
                    }}
                  >
                    <option value="">{t('assessments.form.experienceSelect')}</option>
                    <option value="0-1">{t('assessments.form.experienceOptions.0-1')}</option>
                    <option value="1-3">{t('assessments.form.experienceOptions.1-3')}</option>
                    <option value="3-5">{t('assessments.form.experienceOptions.3-5')}</option>
                    <option value="5-10">{t('assessments.form.experienceOptions.5-10')}</option>
                    <option value="10+">{t('assessments.form.experienceOptions.10+')}</option>
                  </select>
                  {errors.experience && <span className="field-error">{errors.experience}</span>}
                </div>
                
                <div className="form-group">
                  <div style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    background: 'transparent',
                    border: 'none'
                  }}>
                    {t('assessments.form.workMode')}
                  </div>
                  <select
                    id="workMode"
                    value={formData.workMode}
                    onChange={(e) => handleInputChange('workMode', e.target.value)}
                    className="form-input"
                    style={{ 
                      fontSize: '0.9rem', 
                      textAlign: 'start',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '0.75rem'
                    }}
                  >
                    <option value="office">{t('assessments.form.workModes.office')}</option>
                    <option value="remote">{t('assessments.form.workModes.remote')}</option>
                    <option value="hybrid">{t('assessments.form.workModes.hybrid')}</option>
                  </select>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginTop: '2rem',
                background: 'transparent',
                border: 'none',
                padding: '0'
              }}>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    maxWidth: '300px',
                    padding: '0.875rem 1.5rem',
                    background: '#708238',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.background = '#5a6b2d';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.background = '#708238';
                    }
                  }}
                >
                  {isLoading ? t('status.loading') : t('buttons.continue')}
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid #e5e7eb', 
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              {t('footer.copyright')}
            </p>
            <p style={{ margin: '0' }}>
              {t('footer.support')} <strong>{t('footer.email')}</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Custom styles for placeholder styling */}
      <style>{`
        .form-input::placeholder {
          font-size: 0.85rem !important;
          text-align: start !important;
          color: #9ca3af !important;
        }
        .form-input::-webkit-input-placeholder {
          font-size: 0.85rem !important;
          text-align: start !important;
          color: #9ca3af !important;
        }
        .form-input::-moz-placeholder {
          font-size: 0.85rem !important;
          text-align: start !important;
          color: #9ca3af !important;
        }
        .form-input:-ms-input-placeholder {
          font-size: 0.85rem !important;
          text-align: start !important;
          color: #9ca3af !important;
        }
        
        /* Focus states for inputs */
        .form-input:focus {
          outline: none !important;
          border-color: #708238 !important;
          box-shadow: 0 0 0 3px rgba(112, 130, 56, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default SharedIdentityScreen;
