import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { InviteServiceClient } from '@cgames/services';
import type { Candidate } from '@cgames/types';
import '@cgames/ui-kit/styles/hr.css';
import '@cgames/ui-kit/styles/navigation.css';

// Results Modal Component
const ResultsModal = ({ candidate, onClose }: { candidate: any, onClose: () => void }) => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/get-results?candidateEmail=${encodeURIComponent(candidate.email)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch results: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setResults(data.result);
        } else {
          throw new Error(data.error || 'Failed to fetch results');
        }
        
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [candidate.email]);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Assessment Results</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={onClose} className="button secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Assessment Results</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          <div className="no-results">
            <p>No assessment results found for this candidate.</p>
            <button onClick={onClose} className="button secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Assessment Results - {candidate.email}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          <div className="results-content">
            <div className="score-section">
              <h4>Overall Score</h4>
              <div className="score-display">
                <span className="score-value">{results.totalScore || 'N/A'}</span>
                <span className="score-label">/ 100</span>
              </div>
            </div>
            
            {results.competencyBreakdown && (
              <div className="competency-section">
                <h4>Competency Breakdown</h4>
                <div className="competency-list">
                  {Object.entries(results.competencyBreakdown).map(([competency, score]: [string, any]) => (
                    <div key={competency} className="competency-item">
                      <span className="competency-name">{competency}</span>
                      <span className="competency-score">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.completionTime && (
              <div className="timing-section">
                <h4>Completion Time</h4>
                <p>{Math.round(results.completionTime / 60000)} minutes</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="button primary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default function HrDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Invite form state
  const [newEmail, setNewEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  
  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'invited' | 'completed' | 'in-progress'>('all');
  
  // Results modal state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [hrUser, setHrUser] = useState<any>(null);

  // NEW: License limit state
  const [licenseLimits, setLicenseLimits] = useState<{
    licenseCount: number;
    usedLicensesCount: number;
    availableLicenses: number;
    canSendInvite: boolean;
    loading: boolean;
  }>({
    licenseCount: 0,
    usedLicensesCount: 0,
    availableLicenses: 0,
    canSendInvite: true,
    loading: true
  });

  const navigate = useNavigate();
  const auth = getAuth();

  // NEW: Fetch license limits using API endpoint
  useEffect(() => {
    const fetchLicenseLimits = async () => {
      if (!hrUser?.id) return;
      
      try {
        console.log('🔄 [HrDashboard] Fetching license limits via API...');
        
        const response = await fetch(`/api/hr/getLicenseInfo?hrId=${hrUser.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: Failed to fetch license info`);
        }
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch license info');
        }
        
        const { licenseInfo } = data;
        setLicenseLimits({
          licenseCount: licenseInfo.licenseCount,
          usedLicensesCount: licenseInfo.usedLicensesCount,
          availableLicenses: licenseInfo.availableLicenses,
          canSendInvite: licenseInfo.canSendInvite,
          loading: false
        });
        
        console.log(`📊 [HrDashboard] License limits - Total: ${licenseInfo.licenseCount}, Used: ${licenseInfo.usedLicensesCount}, Available: ${licenseInfo.availableLicenses}`);
        
        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          console.warn('⚠️ [HrDashboard] License warnings:', data.warnings);
        }
        
      } catch (err: any) {
        console.error('❌ [HrDashboard] Error fetching license limits:', err);
        setLicenseLimits(prev => ({ ...prev, loading: false }));
      }
    };

    fetchLicenseLimits();
  }, [hrUser?.id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/hr');
        return;
      }

      try {
        const userRef = doc(db, 'hrUsers', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setHrUser(userData);
          setCompanyId(userData.companyId);
        } else {
          console.error('HR user document not found');
          navigate('/hr');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/hr');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleInvite = async () => {
    console.log('🚀 [HrDashboard] handleInvite called for:', newEmail);
    
    // NEW: Check license limits before sending invite
    if (!licenseLimits.canSendInvite) {
      setInviteError('License limit reached. No available invites remaining.');
      return;
    }

    setInviteError(null);
    setInviteLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user || !companyId) throw new Error('Not authenticated or no company ID');

      console.log('🔄 [HrDashboard] Using InviteServiceClient.createInvite...');
      
      // Use our proper invite service instead of direct Firestore
      const result = await InviteServiceClient.createInvite({
        email: newEmail,
        // Add roleTag: 'General Assessment' for dashboard invites
        roleTag: 'General Assessment'
      });

      console.log('✅ [HrDashboard] Invite created successfully:', result);

      // Add the candidate to local state (for UI display)
      setCandidates((prev) => [
        ...prev,
        {
          id: result.invite!.id,
          email: newEmail,
          status: 'Invited',
          dateInvited: new Date().toISOString(),
          inviteToken: result.invite!.token, // Store token for reference
        },
      ]);
      
      // NEW: Update license limits after successful invite
      setLicenseLimits(prev => ({
        ...prev,
        usedLicensesCount: prev.usedLicensesCount + 1,
        availableLicenses: prev.availableLicenses - 1,
        canSendInvite: prev.availableLicenses - 1 > 0
      }));
      
      setNewEmail('');
      
      // Show success message
      alert(`✅ Invitation sent successfully to ${newEmail}! They will receive an email with assessment instructions.`);
      
    } catch (err: any) {
      console.error('🚨 [HrDashboard] Invite failed:', err);
      
      // NEW: Handle license limit errors specifically
      if (err.message && err.message.includes('License limit reached')) {
        setInviteError('License limit reached. No available invites remaining.');
        // Refresh license limits
        if (companyId) {
          const companyDoc = await getDoc(doc(db, 'companies', companyId));
          const companyData = companyDoc.data();
          if (companyData) {
            setLicenseLimits({
              licenseCount: companyData.licenseCount || 0,
              usedLicensesCount: companyData.usedLicensesCount || 0,
              availableLicenses: (companyData.licenseCount || 0) - (companyData.usedLicensesCount || 0),
              canSendInvite: ((companyData.licenseCount || 0) - (companyData.usedLicensesCount || 0)) > 0,
              loading: false
            });
          }
        }
      } else {
        setInviteError(`Failed to send invite: ${err.message}`);
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleViewResults = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowResultsModal(true);
  };

  const closeResultsModal = () => {
    setSelectedCandidate(null);
    setShowResultsModal(false);
  };

  useEffect(() => {
    const loadCandidates = async () => {
      if (!companyId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const candidatesCollection = collection(db, `companies/${companyId}/candidates`);
        const candidatesSnapshot = await getDocs(candidatesCollection);
        
        const candidatesList: Candidate[] = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Candidate));
        
        setCandidates(candidatesList);
      } catch (err: any) {
        console.error('Error loading candidates:', err);
        setError('Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [companyId]);

  // Filter candidates based on selected filter
  const filteredCandidates = candidates.filter(candidate => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'invited') return candidate.status === 'Invited';
    if (selectedFilter === 'completed') return candidate.status === 'Completed';
    if (selectedFilter === 'in-progress') return candidate.status === 'InProgress';
    return true;
  });

  // Status counts for filter tabs
  const statusCounts = {
    total: candidates.length,
    invited: candidates.filter(c => c.status === 'Invited').length,
    inProgress: candidates.filter(c => c.status === 'InProgress').length,
    completed: candidates.filter(c => c.status === 'Completed').length,
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/hr');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="hr-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-dashboard">
        <div className="error-state">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="button primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-dashboard">
      <div className="hr-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1>HR Dashboard</h1>
              <p>Manage your recruitment assessments and candidates</p>
            </div>
            <div className="header-right">
              <div className="user-info">
                <span className="user-name">{hrUser?.email}</span>
                <button onClick={handleSignOut} className="sign-out-button">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invite Section */}
        <div className="invite-section">
          <div className="section-card">
            <div className="card-header">
              <h2>Invite New Candidate</h2>
              <p>Send assessment invitations to potential candidates</p>
              
              {/* NEW: License limits display */}
              <div className="license-info" style={{ 
                marginTop: '1rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px',
                backgroundColor: licenseLimits.canSendInvite ? '#f0f9ff' : '#fef2f2',
                border: licenseLimits.canSendInvite ? '1px solid #0ea5e9' : '1px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {licenseLimits.loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    <span>Checking license availability...</span>
                  </>
                ) : (
                  <>
                    <svg 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      style={{ 
                        width: '20px', 
                        height: '20px',
                        color: licenseLimits.canSendInvite ? '#0ea5e9' : '#ef4444'
                      }}
                    >
                      {licenseLimits.canSendInvite ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      )}
                    </svg>
                    <span style={{ 
                      color: licenseLimits.canSendInvite ? '#0f172a' : '#dc2626',
                      fontWeight: '500'
                    }}>
                      {licenseLimits.availableLicenses} remaining invites 
                      ({licenseLimits.usedLicensesCount}/{licenseLimits.licenseCount} used)
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="invite-form">
              <div className="input-group">
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter candidate's email address"
                    className="invite-input"
                    required
                    disabled={!licenseLimits.canSendInvite} // NEW: Disable when no licenses available
                  />
                </div>
                <button 
                  onClick={handleInvite} 
                  disabled={inviteLoading || !newEmail.trim() || !licenseLimits.canSendInvite} // NEW: Disable when no licenses
                  className={`invite-button ${inviteLoading ? 'loading' : ''} ${!licenseLimits.canSendInvite ? 'disabled' : ''}`}
                >
                  {inviteLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Sending...
                    </>
                  ) : !licenseLimits.canSendInvite ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      No Invites Left
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      Send Invite
                    </>
                  )}
                </button>
              </div>
              {inviteError && (
                <div className="error-message">
                  <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {inviteError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="candidates-section">
          <div className="section-card">
            <div className="card-header">
              <div className="header-left">
                <h2>Candidate Management</h2>
                <p>Track and manage your assessment candidates</p>
              </div>
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  All ({statusCounts.total})
                </button>
                <button 
                  className={`filter-tab ${selectedFilter === 'invited' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('invited')}
                >
                  Invited ({statusCounts.invited})
                </button>
                <button 
                  className={`filter-tab ${selectedFilter === 'in-progress' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('in-progress')}
                >
                  In Progress ({statusCounts.inProgress})
                </button>
                <button 
                  className={`filter-tab ${selectedFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('completed')}
                >
                  Completed ({statusCounts.completed})
                </button>
              </div>
            </div>

            <div className="table-container">
              {filteredCandidates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No candidates found</h3>
                  <p>
                    {selectedFilter === 'all' 
                      ? 'Start by inviting candidates to your assessment.'
                      : `No candidates with "${selectedFilter}" status.`
                    }
                  </p>
                </div>
              ) : (
                <table className="candidates-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Date Invited</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td>
                          <div className="candidate-email">
                            <span className="email">{candidate.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${candidate.status.toLowerCase().replace(' ', '-')}`}>
                            {candidate.status}
                          </span>
                        </td>
                        <td>
                          {new Date(candidate.dateInvited).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {candidate.status === 'Completed' && (
                              <button
                                onClick={() => handleViewResults(candidate)}
                                className="action-button view"
                                title="View Results"
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                View Results
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Results Modal */}
        {showResultsModal && selectedCandidate && (
          <ResultsModal 
            candidate={selectedCandidate} 
            onClose={closeResultsModal} 
          />
        )}
      </div>
    </div>
  );
} 