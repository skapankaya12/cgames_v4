import { useNavigate, useSearchParams } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const EngagementIdentityScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    
    // Get token and pass it through navigation
    const token = searchParams.get('token');
    const testUrl = token ? `/candidate/engagement/test?token=${token}` : '/candidate/engagement/test';
    
    console.log('🔄 [EngagementIdentity] Navigating to:', testUrl);
    navigate(testUrl);
  };

  return (
    <SharedIdentityScreen 
      assessmentType="calisan-bagliligi"
      onContinue={handleContinue}
    />
  );
};

export default EngagementIdentityScreen;
