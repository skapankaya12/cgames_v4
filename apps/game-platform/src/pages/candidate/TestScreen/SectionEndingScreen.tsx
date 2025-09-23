import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSectionById } from '../../../data/sections';
import { getTranslatedQuestions } from '../../../utils/questionsUtils';
import { SectionEndText } from './components/SectionEndText';

const SectionEndingScreen = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams<{ sectionId: string }>();
  const { i18n } = useTranslation('common');
  
  const sectionIdNumber = sectionId ? parseInt(sectionId, 10) : null;
  const section = sectionIdNumber ? getSectionById(sectionIdNumber) : null;
  const questions = getTranslatedQuestions();

  // Safety check
  if (!section) {
    console.error(`[SectionEndingScreen] Invalid section ID: ${sectionId}`);
    navigate('/candidate/test/1');
    return null;
  }

  // Handle section end continue
  const handleSectionEndContinue = async () => {
    const completedSections = JSON.parse(sessionStorage.getItem('completedSections') || '[]');
    const sectionEndKey = `section_${section.id}_end`;
    
    if (!completedSections.includes(sectionEndKey)) {
      completedSections.push(sectionEndKey);
      sessionStorage.setItem('completedSections', JSON.stringify(completedSections));
    }

    console.log(`[SectionEndingScreen] Completed section ${section.id} end screen`);

    // If this was the last section, submit results and navigate to simple thank you page
    if (section.id === 4) {
      console.log(`[SectionEndingScreen] Last section completed, submitting results...`);
      
      try {
        // Get invite data from session storage (same as GameFlowContext)
        const inviteDataStr = sessionStorage.getItem('currentInvite');
        if (!inviteDataStr) {
          console.error('❌ [SectionEndingScreen] No invite data found in session storage with key "currentInvite"');
          throw new Error('Missing invite data');
        }
        
        const inviteData = JSON.parse(inviteDataStr);
        const candidateEmail = inviteData.candidateEmail;
        
        if (!candidateEmail) {
          console.error('❌ [SectionEndingScreen] No candidate email found in invite data');
          throw new Error('Missing candidate email');
        }
        
        // Get test answers from session storage
        const testAnswers = JSON.parse(sessionStorage.getItem('testAnswers') || '{}');
        const testStartTime = sessionStorage.getItem('testStartTime');
        
        // Prepare submission data in same format as working assessments
        const submissionData = {
          token: inviteData.token,
          candidateEmail: candidateEmail,
          candidateInfo: {
            email: candidateEmail,
            // Add other candidate info if available
          },
          assessmentType: 'space-mission',
          assessmentName: 'Space Mission Leadership Assessment',
          answers: testAnswers,
          completionTime: testStartTime ? Date.now() - parseInt(testStartTime) : null,
          completedAt: new Date().toISOString(),
          totalQuestions: questions.length,
          completedQuestions: Object.keys(testAnswers).length,
          gameMetadata: {
            questionIds: questions.map(q => q.id),
            language: i18n.language,
            startTime: testStartTime,
            endTime: new Date().toISOString()
          }
        };

        console.log('📊 [SectionEndingScreen] Submitting space mission results...');
        console.log('  - Token:', submissionData.token ? 'VALID' : 'INVALID');
        console.log('  - CandidateEmail:', submissionData.candidateEmail || 'MISSING');
        console.log('  - Assessment Type:', submissionData.assessmentType);
        console.log('  - Answers count:', Object.keys(submissionData.answers).length);
        
        // Submit directly to API (same as working assessments)
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.olivinhr.com';
        const response = await fetch(`${apiBaseUrl}/api/candidate/submitResult`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const responseData = await response.json();
        console.log('✅ [SectionEndingScreen] Space mission results submitted successfully!', responseData);
        
      } catch (error) {
        console.error('❌ [SectionEndingScreen] Failed to submit space mission results:', error);
        // Continue to thank you page even if submission fails
      }
      
      // Navigate to simple thank you page
      navigate('/candidate/simple-thank-you');
      return;
    }

    // For sections 1-3, navigate to the onboarding screen of the next section
    if (section.id < 4) {
      const nextSectionId = section.id + 1;
      console.log(`[SectionEndingScreen] Navigating from section ${section.id} to next section ${nextSectionId} onboarding`);
      
      // Navigate to the next section's onboarding screen
      navigate(`/candidate/test/section/${nextSectionId}/onboarding`);
      return;
    }
  };

  return (
    <SectionEndText
      section={section}
      onContinue={handleSectionEndContinue}
      isLastSection={section.id === 4}
    />
  );
};

export default SectionEndingScreen;
