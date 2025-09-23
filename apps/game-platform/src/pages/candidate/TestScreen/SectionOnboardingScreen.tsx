import { useNavigate, useParams } from 'react-router-dom';
import { getSectionById } from '../../../data/sections';
import { SectionOnboarding } from './components/SectionOnboarding';

const SectionOnboardingScreen = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams<{ sectionId: string }>();
  
  const sectionIdNumber = sectionId ? parseInt(sectionId, 10) : null;
  const section = sectionIdNumber ? getSectionById(sectionIdNumber) : null;

  // Safety check
  if (!section) {
    console.error(`[SectionOnboardingScreen] Invalid section ID: ${sectionId}`);
    navigate('/candidate/test/1');
    return null;
  }

  // Handle section onboarding continue
  const handleSectionOnboardingContinue = () => {
    const completedSections = JSON.parse(sessionStorage.getItem('completedSections') || '[]');
    const currentSectionKey = `section_${section.id}_onboarding`;
    
    if (!completedSections.includes(currentSectionKey)) {
      completedSections.push(currentSectionKey);
      sessionStorage.setItem('completedSections', JSON.stringify(completedSections));
    }

    console.log(`[SectionOnboardingScreen] Completed onboarding for section ${section.id}, navigating to question ${section.questionRange.start}`);
    
    // Navigate to the first question of this section
    navigate(`/candidate/test/${section.questionRange.start}`);
  };

  return (
    <SectionOnboarding
      section={section}
      onContinue={handleSectionOnboardingContinue}
    />
  );
};

export default SectionOnboardingScreen;
