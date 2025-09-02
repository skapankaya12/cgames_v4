import { useNavigate, useSearchParams } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const TeamIdentityScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleContinue = (identityData: any) => {
    // Store identity data for this assessment (use consistent key)
    sessionStorage.setItem('takim-degerlendirme-candidate-data', JSON.stringify(identityData));
    
    // Also save with legacy key for compatibility
    sessionStorage.setItem('team-candidate-data', JSON.stringify(identityData));
    
    console.log('💾 [TeamIdentity] Saved candidate data to both keys:', {
      primary: 'takim-degerlendirme-candidate-data',
      legacy: 'team-candidate-data',
      data: identityData
    });
    
    // Get token and pass it through navigation
    const token = searchParams.get('token');
    const testUrl = token ? `/candidate/team/test?token=${token}` : '/candidate/team/test';
    
    console.log('🔄 [TeamIdentity] Navigating to:', testUrl);
    navigate(testUrl);
  };

  return (
    <SharedIdentityScreen 
      assessmentType="takim-degerlendirme"
      onContinue={handleContinue}
    />
  );
};

export default TeamIdentityScreen;
