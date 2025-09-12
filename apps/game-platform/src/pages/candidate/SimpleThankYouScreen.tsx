import { useEffect } from 'react';
import '@cgames/ui-kit/styles/hr.css';

const SimpleThankYouScreen = () => {
  useEffect(() => {
    // Log completion for debugging purposes
    const engagementData = sessionStorage.getItem('engagement-candidate-data') || sessionStorage.getItem('calisan-bagliligi-candidate-data');
    const teamData = sessionStorage.getItem('team-candidate-data') || sessionStorage.getItem('takim-degerlendirme-candidate-data');
    const managerData = sessionStorage.getItem('manager-candidate-data') || sessionStorage.getItem('yonetici-degerlendirme-candidate-data');
    
    let assessmentName = '';
    let candidateData = null;
    
    if (engagementData) {
      candidateData = JSON.parse(engagementData);
      assessmentName = 'Employee Engagement Assessment';
    } else if (teamData) {
      candidateData = JSON.parse(teamData);
      assessmentName = 'Team Evaluation Survey';
    } else if (managerData) {
      candidateData = JSON.parse(managerData);
      assessmentName = 'Manager Evaluation Survey';
    }
    
    console.log('[SimpleThankYou] Assessment completed:', assessmentName);
    console.log('[SimpleThankYou] Candidate:', candidateData?.email);
  }, []);

  return (
    <div className="hr-login-page">
      <div className="hr-login-container">
        <div className="hr-login-card">
          <div className="login-logo">
            <img src="/HR.png" alt="OlivinHR" className="logo-image" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#374151',
              margin: '0 0 1rem 0'
            }}>
              Your form is submitted.
            </h1>
            
            <div style={{
              color: '#6b7280',
              fontSize: '1rem',
              margin: '0'
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                You will be notified about the results. You can close this window.
              </p>
              <p style={{ margin: '0' }}>
                Please contact <strong>info@olivinhr.com</strong> for any questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleThankYouScreen;
