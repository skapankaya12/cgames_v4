import { useNavigate } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const TeamIdentityScreen = () => {
  const navigate = useNavigate();

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
    
    // Navigate to the assessment test
    navigate('/candidate/team/test');
  };

  return (
    <SharedIdentityScreen 
      assessmentType="takim-degerlendirme"
      onContinue={handleContinue}
    />
  );
};

export default TeamIdentityScreen;
