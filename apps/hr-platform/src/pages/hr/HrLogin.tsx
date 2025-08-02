import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';

export default function HrLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        <div className="hr-auth-card">
          <div className="hr-auth-header">
            <div className="hr-auth-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="logo-text">BokumunKuşu</span>
            </div>
            <h1 className="hr-auth-title">Welcome Back</h1>
            <p className="hr-auth-subtitle">Sign in to your HR dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="hr-auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Work Email</label>
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
                  placeholder="Enter your work email"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="hr-auth-footer">
            <p className="auth-link-text">
              Need access? 
              <a href="/hr/register" className="auth-link">Contact your admin</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 