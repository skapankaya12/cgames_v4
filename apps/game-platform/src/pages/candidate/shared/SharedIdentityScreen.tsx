import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import './SharedIdentityScreen.css';

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
    'takim-degerlendirme': 'Bu anket, ekibinizin etkinliğini ve işbirliği düzeyini değerlendirmek için hazırlanmıştır.',
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
    <div className="shared-identity-screen">
      <div className="identity-container">
        <div className="identity-header">
          <div className="assessment-badge">
            {assessmentType === 'calisan-bagliligi' && '💼'}
            {assessmentType === 'takim-degerlendirme' && '👥'}
            {assessmentType === 'yonetici-degerlendirme' && '👔'}
          </div>
          <h1 className="assessment-title">
            {assessmentTitles[assessmentType]}
          </h1>
          <p className="assessment-description">
            {assessmentDescriptions[assessmentType]}
          </p>
        </div>

        <form className="identity-form" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          <div className="form-intro">
            <p>Değerlendirmeye başlamadan önce lütfen aşağıdaki bilgileri doldurunuz:</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Departman *</label>
              <input
                type="text"
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={errors.department ? 'error' : ''}
                placeholder="Departmanınızı giriniz"
              />
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="position">Pozisyon *</label>
              <input
                type="text"
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={errors.position ? 'error' : ''}
                placeholder="Pozisyonunuzu giriniz"
              />
              {errors.position && <span className="error-message">{errors.position}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience">Deneyim Süresi *</label>
              <select
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className={errors.experience ? 'error' : ''}
              >
                <option value="">Seçiniz</option>
                <option value="0-1">0-1 yıl</option>
                <option value="1-3">1-3 yıl</option>
                <option value="3-5">3-5 yıl</option>
                <option value="5-10">5-10 yıl</option>
                <option value="10+">10+ yıl</option>
              </select>
              {errors.experience && <span className="error-message">{errors.experience}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="workMode">Çalışma Şekli</label>
              <select
                id="workMode"
                value={formData.workMode}
                onChange={(e) => handleInputChange('workMode', e.target.value)}
              >
                <option value="office">Ofis</option>
                <option value="remote">Uzaktan</option>
                <option value="hybrid">Hibrit</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="continue-button"
              disabled={isLoading}
            >
              {isLoading ? 'Yükleniyor...' : 'Devam Et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharedIdentityScreen;
