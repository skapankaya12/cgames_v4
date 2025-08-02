import { useNavigate } from 'react-router-dom';
import '@cgames/ui-kit/styles/hr.css';

export default function RestrictedSignup() {
  const navigate = useNavigate();

  return (
    <div className="hr-auth-page">
      <div className="hr-auth-background">
        <div className="hr-auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="hr-auth-container">
        <div className="hr-auth-card register-card">
          <div className="hr-auth-header">
            <div className="hr-auth-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="logo-text">OlivinHR</span>
            </div>
            <div className="restricted-signup-content">
              <div className="restricted-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem', color: '#6366F1' }}>
                🔐
              </div>
              <h1 className="hr-auth-title">Account Creation Restricted</h1>
              <p className="hr-auth-subtitle" style={{ marginBottom: '2rem' }}>
                To join the platform, your company administrator must invite you.
              </p>
              
              <div className="info-box" style={{ 
                backgroundColor: '#F3F4F6', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>How to get access:</h3>
                <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#6B7280' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Contact your HR administrator or company admin</li>
                  <li style={{ marginBottom: '0.5rem' }}>Request access to the leadership assessment platform</li>
                  <li style={{ marginBottom: '0.5rem' }}>They will send you an invitation to create your account</li>
                  <li>Use the invite link to complete your registration</li>
                </ol>
              </div>

              <div className="action-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => navigate('/hr/login')}
                  className="submit-button"
                  style={{ flex: 1, maxWidth: '200px' }}
                >
                  Go to Login
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="submit-button"
                  style={{ 
                    flex: 1, 
                    maxWidth: '200px', 
                    backgroundColor: '#6B7280',
                    borderColor: '#6B7280'
                  }}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
          
          <div className="hr-auth-footer">
            <p className="auth-link-text" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Are you a company administrator? 
              <a href="/admin/login" className="auth-link">Admin Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 