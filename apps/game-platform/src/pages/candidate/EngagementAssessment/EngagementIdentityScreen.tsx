import { useNavigate } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const EngagementIdentityScreen = () => {
  const navigate = useNavigate();

  const handleContinue = (identityData: any) => {
    // Store identity data for this assessment (use consistent key)
    sessionStorage.setItem('calisan-bagliligi-candidate-data', JSON.stringify(identityData));
    
    // Also save with legacy key for compatibility
    sessionStorage.setItem('engagement-candidate-data', JSON.stringify(identityData));
    
    console.log('💾 [EngagementIdentity] Saved candidate data to both keys:', {
      primary: 'calisan-bagliligi-candidate-data',
      legacy: 'engagement-candidate-data',
      data: identityData
    });
    
    // Navigate to the assessment test
    navigate('/candidate/engagement/test');
  };

  return (
    <SharedIdentityScreen 
      assessmentType="calisan-bagliligi"
      onContinue={handleContinue}
    />
  );
};

export default EngagementIdentityScreen;
