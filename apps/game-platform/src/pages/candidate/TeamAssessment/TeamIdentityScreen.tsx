import { useNavigate } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const TeamIdentityScreen = () => {
  const navigate = useNavigate();

  const handleContinue = (identityData: any) => {
    // Store identity data for this assessment
    sessionStorage.setItem('team-candidate-data', JSON.stringify(identityData));
    
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
