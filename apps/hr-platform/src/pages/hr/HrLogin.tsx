import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';

export default function HrLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && user.role === 'hr_user' && user.companyId) {
      navigate('/hr');
    } else if (user && user.role === 'super_admin') {
      navigate('/admin/create-company');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user exists in hrUsers collection
      const hrUserRef = doc(db, 'hrUsers', result.user.uid);
      const hrUserDoc = await getDoc(hrUserRef);
      
      if (!hrUserDoc.exists()) {
        setError('Access denied. This login is for HR users only.');
        await auth.signOut();
        return;
      }

      const hrUserData = hrUserDoc.data();
      
      if (!hrUserData.companyId) {
        setError('Your account is not associated with a company. Please contact support.');
        await auth.signOut();
        return;
      }

      // Check if this is first login with temporary password
      if (hrUserData.status === 'pending_first_login') {
        console.log('⚠️ [HrLogin] First login detected - user should change password');
        // You might want to show a message or redirect to password change
        // For now, we'll let them continue with a console warning
      }

      console.log('✅ [HrLogin] HR user authenticated:', hrUserData.role);
      
      // AuthContext will handle the redirect via useEffect above
      
    } catch (err: any) {
      console.error('❌ [HrLogin] Login failed:', err);
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    try {
      setResetLoading(true);
      setError(null);
      
      console.log('🔄 [HrLogin] Sending password reset email to:', email);
      
      await sendPasswordResetEmail(auth, email);
      
      setResetEmailSent(true);
      console.log('✅ [HrLogin] Password reset email sent successfully');
      
    } catch (err: any) {
      console.error('❌ [HrLogin] Password reset error:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="hr-login-page">
      <div className="hr-login-container">
        <div className="hr-login-card">
          <div className="login-logo">
            <img src="/HR.png" alt="OlivinHR" className="logo-image" />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username"
                  className="form-input"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {resetEmailSent && (
              <div className="success-message">
                <svg className="success-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Password reset email sent! Check your email for instructions.
              </div>
            )}

            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing in...
                </>
              ) : (
                'Log in'
              )}
            </button>

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
} 