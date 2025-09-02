import { useEffect, useState } from 'react';

const SimpleThankYouScreen = () => {
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [assessmentType, setAssessmentType] = useState<string>('');

  useEffect(() => {
    // Get candidate info from various sources
    const engagementData = sessionStorage.getItem('engagement-candidate-data') || sessionStorage.getItem('calisan-bagliligi-candidate-data');
    const teamData = sessionStorage.getItem('team-candidate-data') || sessionStorage.getItem('takim-degerlendirme-candidate-data');
    const managerData = sessionStorage.getItem('manager-candidate-data') || sessionStorage.getItem('yonetici-degerlendirme-candidate-data');
    
    let candidateData = null;
    let assessmentName = '';
    
    if (engagementData) {
      candidateData = JSON.parse(engagementData);
      assessmentName = 'Çalışan Bağlılığı Değerlendirmesi';
    } else if (teamData) {
      candidateData = JSON.parse(teamData);
      assessmentName = 'Takım Değerlendirme Anketi';
    } else if (managerData) {
      candidateData = JSON.parse(managerData);
      assessmentName = 'Yönetici Değerlendirme Anketi';
    }
    
    setCandidateInfo(candidateData);
    setAssessmentType(assessmentName);
    
    console.log('🎉 [SimpleThankYou] Assessment completed:', assessmentName);
    console.log('👤 [SimpleThankYou] Candidate:', candidateData?.email);
  }, []);

  const getAssessmentIcon = (type: string) => {
    if (type.includes('Bağlılığı')) return '💚';
    if (type.includes('Takım')) return '👥';
    if (type.includes('Yönetici')) return '🏆';
    return '✅';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Success Animation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto',
            background: '#10B981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            animation: 'bounce 0.8s ease-in-out'
          }}>
            ✅
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1a202c',
          margin: '0 0 1rem 0'
        }}>
          Tebrikler! 🎉
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          color: '#4a5568',
          margin: '0 0 2rem 0'
        }}>
          {assessmentType} başarıyla tamamlandı
        </p>

        {/* Assessment Type Badge */}
        {assessmentType && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10B981',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            margin: '0 0 2rem 0',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#065f46'
          }}>
            <span style={{ fontSize: '1.5rem' }}>{getAssessmentIcon(assessmentType)}</span>
            {assessmentType}
          </div>
        )}

        {/* Candidate Info */}
        {candidateInfo && (
          <div style={{
            background: '#f7fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            margin: '0 0 2rem 0',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748', textAlign: 'center' }}>
              Katılımcı Bilgileri
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div><strong>İsim:</strong> {candidateInfo.firstName} {candidateInfo.lastName}</div>
              <div><strong>Email:</strong> {candidateInfo.email}</div>
              {candidateInfo.department && <div><strong>Departman:</strong> {candidateInfo.department}</div>}
              {candidateInfo.position && <div><strong>Pozisyon:</strong> {candidateInfo.position}</div>}
            </div>
          </div>
        )}

        {/* Status Updates */}
        <div style={{
          background: '#f0fff4',
          border: '1px solid #9ae6b4',
          borderRadius: '12px',
          padding: '1.5rem',
          margin: '0 0 2rem 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <span style={{ color: '#276749', fontWeight: '600' }}>
              Yanıtlarınız başarıyla kaydedildi
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <span style={{ color: '#276749' }}>
              Sonuçlarınız İK ekibi tarafından analiz edilecek
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            <span style={{ color: '#276749' }}>
              Değerlendirme süreci hakkında size geri dönüş yapılacak
            </span>
          </div>
        </div>

        {/* Next Steps */}
        <div style={{
          textAlign: 'left',
          margin: '2rem 0'
        }}>
          <h3 style={{
            color: '#2d3748',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Sonraki Adımlar
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: '0',
            margin: '0'
          }}>
            <li style={{
              padding: '0.75rem 0',
              position: 'relative',
              paddingLeft: '2.5rem',
              color: '#4a5568'
            }}>
              <span style={{
                position: 'absolute',
                left: '0',
                fontSize: '1.2rem'
              }}>1️⃣</span>
              Yanıtlarınız detaylı olarak analiz edilecek
            </li>
            <li style={{
              padding: '0.75rem 0',
              position: 'relative',
              paddingLeft: '2.5rem',
              color: '#4a5568'
            }}>
              <span style={{
                position: 'absolute',
                left: '0',
                fontSize: '1.2rem'
              }}>2️⃣</span>
              İK ekibi sonuçları değerlendirecek
            </li>
            <li style={{
              padding: '0.75rem 0',
              position: 'relative',
              paddingLeft: '2.5rem',
              color: '#4a5568'
            }}>
              <span style={{
                position: 'absolute',
                left: '0',
                fontSize: '1.2rem'
              }}>3️⃣</span>
              Süreç hakkında size bilgi verilecek
            </li>
          </ul>
        </div>

        {/* Personal Message */}
        {candidateInfo?.firstName && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            padding: '1.5rem',
            borderRadius: '12px',
            margin: '2rem 0'
          }}>
            <p style={{
              margin: '0',
              fontSize: '1.1rem',
              color: '#2d3748',
              fontWeight: '500'
            }}>
              Değerli {candidateInfo.firstName}, zamanınızı ayırdığınız için teşekkür ederiz. 
              Değerlendirme sürecine katılımınız bizim için çok değerli.
            </p>
          </div>
        )}

        {/* Closing */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '1.1rem',
            color: '#2d3748',
            margin: '1rem 0'
          }}>
            Bu pencereyi güvenle kapatabilirsiniz.
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: '#718096',
            margin: '0.5rem 0 0 0'
          }}>
            Sorularınız için: <strong>support@olivinhr.com</strong>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        .thank-you-screen {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
      `}</style>
    </div>
  );
};

export default SimpleThankYouScreen;
