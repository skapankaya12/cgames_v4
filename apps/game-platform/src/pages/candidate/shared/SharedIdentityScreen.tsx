import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SharedIdentityScreen.css';

interface SharedIdentityScreenProps {
  assessmentType: 'calisan-bagliligi' | 'takim-degerlendirme' | 'yonetici-degerlendirme';
  onContinue: (data: any) => void;
}

const SharedIdentityScreen: React.FC<SharedIdentityScreenProps> = ({ assessmentType, onContinue }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('common');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad alanı zorunludur';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad alanı zorunludur';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
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
    
    // Save form data
    sessionStorage.setItem(`${assessmentType}-identity`, JSON.stringify(formData));
    
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Ad *</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'error' : ''}
                placeholder="Adınızı giriniz"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Soyad *</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'error' : ''}
                placeholder="Soyadınızı giriniz"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="E-posta adresinizi giriniz"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
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
