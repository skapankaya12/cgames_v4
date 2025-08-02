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

      const response = await fetch('/api/superadmin/createCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(requestData)
      });

      const result: CreateCompanyResponse = await response.json();

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
      <div className="admin-dashboard">
        <div className="admin-content">
          <div className="success-container">
            <div className="success-card">
              <div className="success-header">
                <div className="success-icon">✅</div>
                <h2>Company Created Successfully!</h2>
              </div>
              
              <div className="success-content">
                <div className="company-details">
                  <h3>Company Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Company Name:</span>
                      <span className="value">{success.company.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Company ID:</span>
                      <span className="value">{success.company.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">License Count:</span>
                      <span className="value">{success.company.licenseCount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Max Users:</span>
                      <span className="value">{success.company.maxUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="hr-admin-details">
                  <h3>HR Admin Created</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{success.hrUser.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{success.hrUser.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Role:</span>
                      <span className="value">Admin</span>
                    </div>
                  </div>
                </div>

                <div className="next-steps">
                  <h3>Next Steps</h3>
                  <ul>
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
                  className="button primary"
                >
                  Create Another Company
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="button secondary"
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
    <div className="admin-dashboard">
      <div className="admin-content">
        <div className="create-company-container">
          <div className="page-header">
            <h1>Create New Company</h1>
            <p>Set up a new company with an initial HR administrator</p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="error-message global-error">
                  <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.general}
                </div>
              )}

              <div className="form-section">
                <h3>Company Information</h3>
                
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className={errors.companyName ? 'error' : ''}
                    disabled={loading}
                  />
                  {errors.companyName && (
                    <span className="field-error">{errors.companyName}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="licenseCount">License Count *</label>
                    <input
                      id="licenseCount"
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.licenseCount}
                      onChange={(e) => handleInputChange('licenseCount', parseInt(e.target.value) || 0)}
                      className={errors.licenseCount ? 'error' : ''}
                      disabled={loading}
                    />
                    {errors.licenseCount && (
                      <span className="field-error">{errors.licenseCount}</span>
                    )}
                    <small className="field-help">Number of assessment invites this company can send</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxUsers">Max HR Users *</label>
                    <input
                      id="maxUsers"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.maxUsers}
                      onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 0)}
                      className={errors.maxUsers ? 'error' : ''}
                      disabled={loading}
                    />
                    {errors.maxUsers && (
                      <span className="field-error">{errors.maxUsers}</span>
                    )}
                    <small className="field-help">Maximum number of HR users for this company</small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="maxProjects">Max Projects *</label>
                  <input
                    id="maxProjects"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.maxProjects}
                    onChange={(e) => handleInputChange('maxProjects', parseInt(e.target.value) || 0)}
                    className={errors.maxProjects ? 'error' : ''}
                    disabled={loading}
                  />
                  {errors.maxProjects && (
                    <span className="field-error">{errors.maxProjects}</span>
                  )}
                  <small className="field-help">Maximum number of recruitment projects this company can create</small>
                </div>
              </div>

              <div className="form-section">
                <h3>HR Administrator</h3>
                <p className="section-description">
                  This person will become the initial admin for the company
                </p>
                
                <div className="form-group">
                  <label htmlFor="hrName">Full Name *</label>
                  <input
                    id="hrName"
                    type="text"
                    value={formData.hrName}
                    onChange={(e) => handleInputChange('hrName', e.target.value)}
                    placeholder="e.g., John Smith"
                    className={errors.hrName ? 'error' : ''}
                    disabled={loading}
                  />
                  {errors.hrName && (
                    <span className="field-error">{errors.hrName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="hrEmail">Email Address *</label>
                  <input
                    id="hrEmail"
                    type="email"
                    value={formData.hrEmail}
                    onChange={(e) => handleInputChange('hrEmail', e.target.value)}
                    placeholder="e.g., john.smith@company.com"
                    className={errors.hrEmail ? 'error' : ''}
                    disabled={loading}
                  />
                  {errors.hrEmail && (
                    <span className="field-error">{errors.hrEmail}</span>
                  )}
                  <small className="field-help">
                    This email will receive login instructions and become the admin account
                  </small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className={`button primary ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Creating Company...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create Company
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany; 