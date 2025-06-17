import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface TokenValidationResponse {
  valid: boolean;
  gameId?: string;
  candidateEmail?: string;
  error?: string;
}

const Play: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    validateTokenAndRedirect();
  }, [token]);

  const validateTokenAndRedirect = async () => {
    try {
      setLoading(true);
      
      // Use current domain for API calls
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/invites/validate?token=${token}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token validation failed: ${response.status} ${errorText}`);
      }

      const result: TokenValidationResponse = await response.json();
      
      if (!result.valid) {
        throw new Error(result.error || 'Invalid or expired invitation token');
      }

      // Store token for later use during assessment submission
      sessionStorage.setItem('inviteToken', token);
      if (result.candidateEmail) {
        sessionStorage.setItem('candidateEmail', result.candidateEmail);
      }

      // Redirect based on gameId
      const gameId = result.gameId || 'leadership-scenario';
      
      if (gameId === 'advanced-assessment') {
        navigate('/candidate/game2');
      } else {
        // Default to leadership scenario route
        navigate('/candidate');
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate invitation token');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please contact the person who sent you this invitation for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Play; 