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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <span className="logo-text">Admin Portal</span>
          </div>
          <h1>Super Admin Login</h1>
          <p>Access the company management system</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || authError) && (
            <div className="error-message">
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error || authError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="admin@company.com"
              required
              disabled={isLoading || loading}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading || loading}
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading || loading}
            className={`auth-button ${(isLoading || loading) ? 'loading' : ''}`}
          >
            {(isLoading || loading) ? (
              <>
                <div className="loading-spinner-small"></div>
                Signing In...
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L12.586 9H5a1 1 0 100 2h7.586l-2.293 2.293z" clipRule="evenodd" />
                </svg>
                Sign In as Admin
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="auth-links">
            <button 
              onClick={() => navigate('/hr/login')}
              className="link-button"
              disabled={isLoading || loading}
            >
              HR User Login
            </button>
            <span className="separator">•</span>
            <button 
              onClick={() => navigate('/')}
              className="link-button"
              disabled={isLoading || loading}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 