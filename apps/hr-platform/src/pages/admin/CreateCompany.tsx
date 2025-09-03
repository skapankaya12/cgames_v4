import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateCompanyRequest, CreateCompanyResponse } from '@cgames/types';
import '@cgames/ui-kit/styles/hr.css';

interface FormData {
  companyName: string;
  licenseCount: number;
  maxUsers: number;
  maxProjects: number;
  hrEmail: string;
  hrName: string;
}

interface FormErrors {
  companyName?: string;
  licenseCount?: string;
  maxUsers?: string;
  maxProjects?: string;
  hrEmail?: string;
  hrName?: string;
  general?: string;
}

const CreateCompany: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    licenseCount: 100,
    maxUsers: 10,
    maxProjects: 5,
    hrEmail: '',
    hrName: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<CreateCompanyResponse | null>(null);

  // Redirect if not super admin
  if (!isSuperAdmin()) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Super admin privileges are required to create companies.</p>
          <button 
            onClick={() => window.history.back()}
            className="button secondary"
            style={{ marginTop: '1rem' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    // License count validation
    if (!formData.licenseCount || formData.licenseCount < 1) {
      newErrors.licenseCount = 'License count must be at least 1';
    } else if (formData.licenseCount > 10000) {
      newErrors.licenseCount = 'License count cannot exceed 10,000';
    }

    // Max users validation
    if (!formData.maxUsers || formData.maxUsers < 1) {
      newErrors.maxUsers = 'Max users must be at least 1';
    } else if (formData.maxUsers > 1000) {
      newErrors.maxUsers = 'Max users cannot exceed 1,000';
    }

    // Max projects validation
    if (!formData.maxProjects || formData.maxProjects < 1) {
      newErrors.maxProjects = 'Max projects must be at least 1';
    } else if (formData.maxProjects > 500) {
      newErrors.maxProjects = 'Max projects cannot exceed 500';
    }

    // HR email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.hrEmail.trim()) {
      newErrors.hrEmail = 'HR admin email is required';
    } else if (!emailRegex.test(formData.hrEmail)) {
      newErrors.hrEmail = 'Please enter a valid email address';
    }

    // HR name validation
    if (!formData.hrName.trim()) {
      newErrors.hrName = 'HR admin name is required';
    } else if (formData.hrName.trim().length < 2) {
      newErrors.hrName = 'HR admin name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      console.log('🔄 [CreateCompany] Creating company:', formData);
      
      const requestData: CreateCompanyRequest = {
        companyName: formData.companyName.trim(),
        licenseCount: formData.licenseCount,
        maxUsers: formData.maxUsers,
        maxProjects: formData.maxProjects,
        hrEmail: formData.hrEmail.trim(),
        hrName: formData.hrName.trim()
      };

      // Get the actual Firebase ID token for authentication
      const { auth } = await import('../../firebase');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication token not available');
      }

      // Always hit the main API domain to avoid SPA rewrite conflicts
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const response = await fetch(`${apiBaseUrl}/api/superadmin/createCompany`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(requestData)
      });

      // Some platforms may return empty body on 405/500; guard parsing
      let result: CreateCompanyResponse;
      const text = await response.text();
      try {
        result = text ? JSON.parse(text) : ({ success: response.ok } as CreateCompanyResponse);
      } catch {
        result = { 
          success: false, 
          error: `Unexpected response: ${text?.slice(0, 200)}`,
          company: { id: '', name: '', licenseCount: 0, maxUsers: 0, usedLicensesCount: 0 },
          hrUser: { id: '', email: '', name: '', role: 'admin', companyId: '' }
        };
      }

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to create company`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create company');
      }

      console.log('✅ [CreateCompany] Company created successfully:', result);
      setSuccess(result);
      
      // Reset form
      setFormData({
        companyName: '',
        licenseCount: 100,
        maxUsers: 10,
        maxProjects: 5,
        hrEmail: '',
        hrName: ''
      });
      
    } catch (err: any) {
      console.error('❌ [CreateCompany] Error:', err);
      setErrors({ general: err.message || 'Failed to create company' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setSuccess(null);
    setErrors({});
  };

  if (success) {
    return (
      <div className="hr-login-page create-company-page-wrapper">
        <div className="create-company-page">
          <div className="create-company-container">
            <div className="create-company-card">
              <div className="login-logo">
                <img src="/HR.png" alt="OlivinHR" className="logo-image" />
              </div>
              
              <div className="success-message">
                <svg className="success-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h2 className="success-title">Company Created Successfully!</h2>
              </div>
              
              <div className="success-details">
                <div className="detail-section">
                  <h3 className="detail-section-title">Company Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Company Name:</span>
                      <span className="detail-value">{success.company.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Company ID:</span>
                      <span className="detail-value">{success.company.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">License Count:</span>
                      <span className="detail-value">{success.company.licenseCount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Max Users:</span>
                      <span className="detail-value">{success.company.maxUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="detail-section-title">HR Admin Created</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{success.hrUser.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{success.hrUser.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Role:</span>
                      <span className="detail-value">Admin</span>
                    </div>
                  </div>
                </div>

                <div className="next-steps">
                  <h3 className="detail-section-title">Next Steps</h3>
                  <ul className="steps-list">
                    <li>✅ Company created successfully in the database</li>
                    <li>✅ HR admin account has been set up</li>
                    <li>📧 Welcome email sent with login credentials</li>
                    <li>🚀 HR admin can now access the platform and start creating projects</li>
                  </ul>
                </div>
              </div>

              <div className="success-actions">
                <button 
                  onClick={handleCreateAnother}
                  className="login-button"
                  style={{ marginBottom: '1rem' }}
                >
                  Create Another Company
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="forgot-password"
                  style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#708238' }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-login-page create-company-page-wrapper">
      <div className="create-company-page">
        <div className="create-company-container">
          <div className="create-company-card">
            <div className="login-logo">
              <img src="/HR.png" alt="OlivinHR" className="logo-image" />
            </div>
            
            <div className="page-header">
              <h1 className="page-title">Create New Company</h1>
              <p className="page-subtitle">Set up a new company with an initial HR administrator</p>
            </div>

            <form onSubmit={handleSubmit} className="create-company-form">
              {errors.general && (
                <div className="error-message">
                  <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.general}
                </div>
              )}

              <div className="form-section">
                <h2 className="section-title">Company Information</h2>
                
                <div className="form-group">
                  <label htmlFor="companyName" className="form-label">Company Name *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clipRule="evenodd" />
                    </svg>
                    <input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="e.g., Acme Corporation"
                      className={`form-input ${errors.companyName ? 'error' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.companyName && (
                    <span className="field-error">{errors.companyName}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="licenseCount" className="form-label">License Count *</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <input
                        id="licenseCount"
                        type="number"
                        min="1"
                        max="10000"
                        value={formData.licenseCount}
                        onChange={(e) => handleInputChange('licenseCount', parseInt(e.target.value) || 0)}
                        className={`form-input ${errors.licenseCount ? 'error' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.licenseCount && (
                      <span className="field-error">{errors.licenseCount}</span>
                    )}
                    <small className="field-help">Number of assessment invites this company can send</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxUsers" className="form-label">Max HR Users *</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <input
                        id="maxUsers"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.maxUsers}
                        onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 0)}
                        className={`form-input ${errors.maxUsers ? 'error' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.maxUsers && (
                      <span className="field-error">{errors.maxUsers}</span>
                    )}
                    <small className="field-help">Maximum number of HR users for this company</small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="maxProjects" className="form-label">Max Projects *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                    <input
                      id="maxProjects"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.maxProjects}
                      onChange={(e) => handleInputChange('maxProjects', parseInt(e.target.value) || 0)}
                      className={`form-input ${errors.maxProjects ? 'error' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.maxProjects && (
                    <span className="field-error">{errors.maxProjects}</span>
                  )}
                  <small className="field-help">Maximum number of recruitment projects this company can create</small>
                </div>
              </div>

              <div className="form-section">
                <h2 className="section-title">HR Administrator</h2>
                <p className="section-description">
                  This person will become the initial admin for the company
                </p>
                
                <div className="form-group">
                  <label htmlFor="hrName" className="form-label">Full Name *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <input
                      id="hrName"
                      type="text"
                      value={formData.hrName}
                      onChange={(e) => handleInputChange('hrName', e.target.value)}
                      placeholder="e.g., John Smith"
                      className={`form-input ${errors.hrName ? 'error' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.hrName && (
                    <span className="field-error">{errors.hrName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="hrEmail" className="form-label">Email Address *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <input
                      id="hrEmail"
                      type="email"
                      value={formData.hrEmail}
                      onChange={(e) => handleInputChange('hrEmail', e.target.value)}
                      placeholder="e.g., john.smith@company.com"
                      className={`form-input ${errors.hrEmail ? 'error' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.hrEmail && (
                    <span className="field-error">{errors.hrEmail}</span>
                  )}
                  <small className="field-help">
                    This email will receive login instructions and become the admin account
                  </small>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`login-button ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Create Company'
                )}
              </button>
            </form>



            <div className="support-info">
              <p className="support-contact">
                Need help? Contact our support team at <a href="mailto:info@olivinhr.com">info@olivinhr.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany; 