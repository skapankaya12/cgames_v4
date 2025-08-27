import { useNavigate } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const ManagerIdentityScreen = () => {
  const navigate = useNavigate();

  const handleContinue = (identityData: any) => {
    // Store identity data for this assessment
    sessionStorage.setItem('manager-candidate-data', JSON.stringify(identityData));
    
    // Navigate to the assessment test
    navigate('/candidate/manager/test');
  };

  return (
    <SharedIdentityScreen 
      assessmentType="yonetici-degerlendirme"
      onContinue={handleContinue}
    />
  );
};

export default ManagerIdentityScreen;
