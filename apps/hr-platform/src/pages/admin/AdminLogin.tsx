import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '@cgames/ui-kit/styles/hr.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, loading, error: authError, isSuperAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated as super admin
  useEffect(() => {
    if (user && isSuperAdmin()) {
      navigate('/admin/create-company');
    } else if (user && !isSuperAdmin()) {
      setError('This login is for super administrators only. Please use the HR login.');
    }
  }, [user, navigate, isSuperAdmin]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('🔄 [AdminLogin] Attempting super admin login:', formData.email);
      
      await signIn(formData.email, formData.password);
      
      // The useEffect above will handle redirect after successful auth
      
    } catch (err: any) {
      console.error('❌ [AdminLogin] Login failed:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <div className="hr-login-page">
      <div className="hr-login-container">
        <div className="hr-login-card">
          <div className="login-logo">
            <img src="/teklogo.png" alt="Tek Logo" className="logo-image" />
          </div>
          
          <div className="admin-header">
            <h1 className="admin-title">Admin Portal</h1>
            <p className="admin-description">Only for OlivinHR team</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {(error || authError) && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error || authError}
              </div>
            )}

            <div className="form-group">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email Address"
                  required
                  disabled={isLoading || loading}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Password"
                  required
                  disabled={isLoading || loading}
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading || loading}
              className={`login-button ${(isLoading || loading) ? 'loading' : ''}`}
            >
              {(isLoading || loading) ? (
                <div className="loading-spinner"></div>
              ) : (
                'Sign In as Admin'
              )}
            </button>

            <div className="admin-links">
              <button 
                type="button"
                onClick={() => navigate('/hr/login')}
                className="admin-link-button"
                disabled={isLoading || loading}
              >
                HR User Login
              </button>
              <span className="link-separator">•</span>
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="admin-link-button"
                disabled={isLoading || loading}
              >
                Back to Home
              </button>
            </div>

            <div className="support-info">
              <p className="support-contact">
                Need help? Contact our support team at <a href="mailto:info@olivinhr.com">info@olivinhr.com</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 