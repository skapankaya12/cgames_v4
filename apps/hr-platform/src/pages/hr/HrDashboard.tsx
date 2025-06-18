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
          <div className="error-state">
            <h3>Error Loading Results</h3>
            <p>{error}</p>
            <button onClick={onClose} className="button-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>Assessment Results - {candidate.email}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          {results && (
            <div className="results-overview">
              <div className="results-summary">
                <div className="summary-card">
                  <h3>Overall Score</h3>
                  <div className="score-display">
                    <span className="score">{results.results.totalScore}</span>
                    <span className="max-score">/ {results.results.maxScore}</span>
                    <span className="percentage">
                      ({Math.round((results.results.totalScore / results.results.maxScore) * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="summary-card">
                  <h3>Assessment Details</h3>
                  <p><strong>Game:</strong> {results.selectedGame}</p>
                  <p><strong>Submitted:</strong> {new Date(results.submittedAt).toLocaleString()}</p>
                  <p><strong>Role:</strong> {results.invite?.roleTag || 'General Assessment'}</p>
                </div>
              </div>

              <div className="competency-breakdown">
                <h3>Competency Breakdown</h3>
                <div className="competency-grid">
                  {results.results.competencyScores.map((comp: any, index: number) => (
                    <div key={index} className="competency-item">
                      <div className="competency-header">
                        <span className="competency-name">{comp.competency}</span>
                        <span className="competency-score">{comp.score}/{comp.maxScore}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${comp.percentage}%` }}
                        ></div>
                      </div>
                      <span className="competency-percentage">{comp.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {results.candidateInfo && (
                <div className="candidate-info">
                  <h3>Candidate Information</h3>
                  <div className="info-grid">
                    <p><strong>Name:</strong> {results.candidateInfo.firstName} {results.candidateInfo.lastName}</p>
                    <p><strong>Email:</strong> {results.candidateInfo.email}</p>
                    {results.candidateInfo.company && (
                      <p><strong>Company:</strong> {results.candidateInfo.company}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="button-primary">Close</button>
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

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/hr/login');
        return;
      }
      try {
        const hrDocRef = doc(db, 'hrUsers', user.uid);
        const hrDocSnap = await getDoc(hrDocRef);
        
        if (!hrDocSnap.exists()) {
          await signOut(auth);
          navigate('/hr/login');
          return;
        }
        
        const hrData = hrDocSnap.data();
        setHrUser(hrData);
        const userCompanyId = hrData.companyId as string;
        setCompanyId(userCompanyId);

        const q = query(collection(db, `companies/${userCompanyId}/candidates`));
        const snapshot = await getDocs(q);
        const list: Candidate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Candidate, 'id'>),
        }));
        setCandidates(list);
      } catch (err: any) {
        setError(`Failed to load candidates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleInvite = async () => {
    console.log('🚀 [HrDashboard] handleInvite called for:', newEmail);
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
      
      setNewEmail('');
      
      // Show success message
      alert(`✅ Invitation sent successfully to ${newEmail}! They will receive an email with assessment instructions.`);
      
    } catch (err: any) {
      console.error('🚨 [HrDashboard] Invite failed:', err);
      setInviteError(`Failed to send invite: ${err.message}`);
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

  const filteredCandidates = candidates.filter(candidate => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'invited') return candidate.status === 'Invited';
    if (selectedFilter === 'completed') return candidate.status === 'Completed';
    if (selectedFilter === 'in-progress') return candidate.status === 'InProgress';
    return true;
  });

  const getStatusCounts = () => {
    return {
      total: candidates.length,
      invited: candidates.filter(c => c.status === 'Invited').length,
      completed: candidates.filter(c => c.status === 'Completed').length,
      inProgress: candidates.filter(c => c.status === 'InProgress').length,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Invited': return 'status-invited';
      case 'InProgress': return 'status-progress';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="hr-dashboard-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-dashboard-error">
        <div className="error-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="hr-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="dashboard-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="logo-text">OlivinHR</span>
            </div>
            <div className="header-info">
              <h1>Welcome back, {hrUser?.fullName || 'HR Manager'}</h1>
              <p>{hrUser?.companyName || 'Your Company'}</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={async () => {
                await signOut(auth);
                navigate('/hr/login');
              }}
              className="logout-button"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{statusCounts.total}</div>
              <div className="stat-label">Total Candidates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon invited">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{statusCounts.invited}</div>
              <div className="stat-label">Invitations Sent</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{statusCounts.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{statusCounts.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* Invite Section */}
        <div className="invite-section">
          <div className="section-card">
            <div className="card-header">
              <h2>Invite New Candidate</h2>
              <p>Send assessment invitations to potential candidates</p>
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
                  />
                </div>
                <button 
                  onClick={handleInvite} 
                  disabled={inviteLoading || !newEmail.trim()}
                  className={`invite-button ${inviteLoading ? 'loading' : ''}`}
                >
                  {inviteLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Sending...
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

            {filteredCandidates.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3>No candidates found</h3>
                <p>
                  {selectedFilter === 'all' 
                    ? 'Start by inviting your first candidate above.'
                    : `No candidates with "${selectedFilter}" status.`
                  }
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="candidates-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Status</th>
                      <th>Date Invited</th>
                      <th>Date Completed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td>
                          <div className="candidate-cell">
                            <div className="candidate-avatar">
                              {candidate.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="candidate-info">
                              <div className="candidate-email">{candidate.email}</div>
                              <div className="candidate-id">ID: {candidate.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </td>
                        <td>{new Date(candidate.dateInvited).toLocaleDateString()}</td>
                        <td>
                          {candidate.dateCompleted
                            ? new Date(candidate.dateCompleted).toLocaleDateString()
                            : '—'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {candidate.status === 'Completed' ? (
                              <button 
                                className="action-button primary"
                                onClick={() => handleViewResults(candidate)}
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                View Results
                              </button>
                            ) : (
                              <button className="action-button disabled" disabled>
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                                Pending
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
  );
} 