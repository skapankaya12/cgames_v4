import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '@cgames/ui-kit/styles/hr.css';

interface TeamMember {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  status: string;
  createdAt: number;
}

export default function TeamManagement() {
  const { user, canCreateProjects } = useAuth();
  const navigate = useNavigate();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'employee' as 'admin' | 'employee'
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/hr/login');
      return;
    }
    
    if (!canCreateProjects()) {
      navigate('/hr');
      return;
    }
  }, [user, navigate, canCreateProjects]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setInviteLoading(true);

    try {
      const response = await fetch('/api/hr/inviteTeamMember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inviteForm,
          hrId: user?.uid
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite team member');
      }

      setSuccess(`Invitation sent successfully to ${inviteForm.email}`);
      setInviteForm({ email: '', name: '', role: 'employee' });
      
      // Refresh team members list
      // loadTeamMembers(); // You would implement this
      
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInviteForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  if (!user || !canCreateProjects()) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="hr-page">
      <div className="hr-container">
        <div className="hr-header">
          <h1>Team Management</h1>
          <p>Invite and manage team members for your company</p>
        </div>

        <div className="team-management-content">
          {/* Invite New Team Member Card */}
          <div className="invite-card">
            <h2>Invite New Team Member</h2>
            <p className="card-subtitle">
              Add a new team member to your company's HR platform access
            </p>

            <form onSubmit={handleInviteSubmit} className="invite-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={inviteForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={inviteForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                >
                  <option value="employee">Employee (View-only access)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
                <small className="form-help">
                  Admins can create projects and send invites. Employees have view-only access.
                </small>
              </div>

              {error && (
                <div className="error-message">
                  <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <svg className="success-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}

              <button 
                type="submit" 
                className={`submit-button ${inviteLoading ? 'loading' : ''}`}
                disabled={inviteLoading}
              >
                {inviteLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sending Invitation...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </form>
          </div>

          {/* Team Members List - Placeholder */}
          <div className="team-list-card">
            <h2>Current Team Members</h2>
            <p className="card-subtitle">
              Manage existing team members and their permissions
            </p>
            
            <div className="coming-soon-message">
              <div className="coming-soon-icon">👥</div>
              <h3>Team Member List Coming Soon</h3>
              <p>
                View and manage existing team members, update roles, and monitor access status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 