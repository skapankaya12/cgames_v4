import { useNavigate } from 'react-router-dom';
import SharedIdentityScreen from '../shared/SharedIdentityScreen';

const ManagerIdentityScreen = () => {
  const navigate = useNavigate();

  const handleContinue = (identityData: any) => {
    // Store identity data for this assessment (use consistent key)
    sessionStorage.setItem('yonetici-degerlendirme-candidate-data', JSON.stringify(identityData));
    
    // Also save with legacy key for compatibility
    sessionStorage.setItem('manager-candidate-data', JSON.stringify(identityData));
    
    console.log('💾 [ManagerIdentity] Saved candidate data to both keys:', {
      primary: 'yonetici-degerlendirme-candidate-data',
      legacy: 'manager-candidate-data',
      data: identityData
    });
    
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
