import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import '@cgames/ui-kit/styles/hr.css';

interface SharedIdentityScreenProps {
  assessmentType: 'calisan-bagliligi' | 'takim-degerlendirme' | 'yonetici-degerlendirme';
  onContinue: (data: any) => void;
}

const SharedIdentityScreen: React.FC<SharedIdentityScreenProps> = ({ assessmentType, onContinue }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const { t } = useTranslation('common');
  
  const [formData, setFormData] = useState({
    department: '',
    position: '',
    experience: '',
    workMode: 'office'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const assessmentTitles = {
    'calisan-bagliligi': 'Çalışan Bağlılığı Değerlendirmesi',
    'takim-degerlendirme': 'Takım Değerlendirme Anketi',
    'yonetici-degerlendirme': 'Yönetici Değerlendirme Anketi'
  };

  const assessmentDescriptions = {
    'calisan-bagliligi': 'Bu değerlendirme, organizasyona olan bağlılığınızı ve çalışma motivasyonunuzu anlamak için tasarlanmıştır.',
    'takim-degerlendirme': 'Bu anket, ekibinizin etkinliğini ve iş birliği düzeyini değerlendirmek için hazırlanmıştır.',
    'yonetici-degerlendirme': 'Bu değerlendirme, yöneticinizin liderlik etkinliğini ve yönetim becerilerini anlamak için tasarlanmıştır.'
  };

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
      newErrors.department = 'Departman alanı zorunludur';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Pozisyon alanı zorunludur';
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = 'Deneyim alanı zorunludur';
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
              {assessmentTitles[assessmentType]}
            </h1>
            <p className="page-subtitle">
              {assessmentDescriptions[assessmentType]}
            </p>
          </div>

          <form className="create-company-form" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div className="form-section">
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#6b7280' }}>
                Değerlendirmeye başlamadan önce lütfen aşağıdaki bilgileri doldurunuz:
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
                    Departman *
                  </div>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`form-input ${errors.department ? 'error' : ''}`}
                    placeholder="Departmanınızı giriniz"
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
                    Pozisyon *
                  </div>
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`form-input ${errors.position ? 'error' : ''}`}
                    placeholder="Pozisyonunuzu giriniz"
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
                    Deneyim Süresi *
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
                    <option value="">Seçiniz</option>
                    <option value="0-1">0-1 yıl</option>
                    <option value="1-3">1-3 yıl</option>
                    <option value="3-5">3-5 yıl</option>
                    <option value="5-10">5-10 yıl</option>
                    <option value="10+">10+ yıl</option>
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
                    Çalışma Şekli
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
                    <option value="office">Ofis</option>
                    <option value="remote">Uzaktan</option>
                    <option value="hybrid">Hibrit</option>
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
                  {isLoading ? 'Yükleniyor...' : 'Devam Et'}
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
              All rights reserved. OlivinHR 2025.
            </p>
            <p style={{ margin: '0' }}>
              Need Help? Contact our support team at <strong>info@olivinhr.com</strong>
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
