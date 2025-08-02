import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'hr_user';
  requiredHrRole?: 'admin' | 'employee';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredHrRole,
  fallback 
}) => {
  const { user, loading, hasRole, hasHrRole } = useAuth();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return fallback || (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h2>Authentication Required</h2>
          <p>Please log in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/hr/login'}
            className="button primary"
            style={{ marginTop: '1rem' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Required role: <strong>{requiredRole}</strong></p>
          <p>Your role: <strong>{user.role || 'none'}</strong></p>
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

  // Check HR role requirement
  if (requiredHrRole && !hasHrRole(requiredHrRole)) {
    return fallback || (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2>Insufficient Permissions</h2>
          <p>You need {requiredHrRole} privileges to access this page.</p>
          <p>Your HR role: <strong>{user.hrRole || 'none'}</strong></p>
          <button 
            onClick={() => window.location.href = '/hr'}
            className="button secondary"
            style={{ marginTop: '1rem' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // HR user validation
  if (user.role === 'hr_user' && !user.companyId) {
    return fallback || (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>Account Setup Required</h2>
          <p>Your account is not associated with a company.</p>
          <p>Please contact support to complete your account setup.</p>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}; 