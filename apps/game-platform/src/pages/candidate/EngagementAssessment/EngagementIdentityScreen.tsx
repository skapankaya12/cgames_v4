import { useNavigate } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const EngagementIdentityScreen = () => {
  const navigate = useNavigate();

  const handleContinue = (identityData: any) => {
    // Store identity data for this assessment
    sessionStorage.setItem('engagement-candidate-data', JSON.stringify(identityData));
    
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
