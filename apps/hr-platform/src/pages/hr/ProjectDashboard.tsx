import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Project, ProjectCandidate } from '@cgames/types';

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [candidates, setCandidates] = useState<ProjectCandidate[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [, setHrUser] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'invited' | 'completed' | 'in-progress'>('all');

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

        if (!projectId) {
          setError('Project ID not found');
          return;
        }

        // Load project data
        const projectDocRef = doc(db, `companies/${userCompanyId}/projects`, projectId);
        const projectSnap = await getDoc(projectDocRef);
        
        if (!projectSnap.exists()) {
          setError('Project not found');
          return;
        }
        
        const projectData = { id: projectSnap.id, ...projectSnap.data() } as Project;
        setProject(projectData);

        // Load project candidates
        const q = query(collection(db, `companies/${userCompanyId}/projects/${projectId}/candidates`));
        const snapshot = await getDocs(q);
        const list: ProjectCandidate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          projectId: projectId,
          ...(doc.data() as Omit<ProjectCandidate, 'id' | 'projectId'>),
        }));
        setCandidates(list);
      } catch (err: any) {
        setError(`Failed to load project: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, projectId]);

  const handleInvite = async () => {
    setInviteError(null);
    setInviteLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !companyId || !projectId) throw new Error('Not authenticated or missing data');

      const newDocRef = doc(collection(db, `companies/${companyId}/projects/${projectId}/candidates`));
      await setDoc(newDocRef, {
        email: newEmail,
        status: 'Invited',
        dateInvited: new Date().toISOString(),
        projectId: projectId,
      });

      const newCandidate: ProjectCandidate = {
        id: newDocRef.id,
        email: newEmail,
        status: 'Invited',
        dateInvited: new Date().toISOString(),
        projectId: projectId,
      };

      setCandidates((prev) => [...prev, newCandidate]);

      // Update project stats
      if (project) {
        const updatedStats = {
          ...project.stats,
          totalCandidates: project.stats.totalCandidates + 1,
          invitedCandidates: project.stats.invitedCandidates + 1,
        };
        
        const projectRef = doc(db, `companies/${companyId}/projects`, projectId);
        await updateDoc(projectRef, { stats: updatedStats });
        
        setProject({ ...project, stats: updatedStats });
      }

      setNewEmail('');
    } catch (err: any) {
      setInviteError(`Failed to invite: ${err.message}`);
    } finally {
      setInviteLoading(false);
    }
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
        <p>Loading project dashboard...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="hr-dashboard-error">
        <div className="error-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/hr/projects')} className="retry-button">
          Back to Projects
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
            <button 
              onClick={() => navigate('/hr/projects')}
              className="back-button"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Projects
            </button>
            <div className="dashboard-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="logo-text">BokumunKuşu</span>
            </div>
            <div className="header-info">
              <h1>{project.name}</h1>
              <p>{project.roleInfo.position} • {project.roleInfo.department}</p>
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
        {/* Project Info Card */}
        <div className="project-info-section">
          <div className="section-card">
            <div className="card-header">
              <h2>Project Overview</h2>
              <span className={`status-badge ${project.status === 'active' ? 'status-active' : 'status-completed'}`}>
                {project.status}
              </span>
            </div>
            <div className="project-overview">
              <div className="overview-grid">
                <div className="overview-section">
                  <h4>Role Information</h4>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="label">Position:</span>
                      <span className="value">{project.roleInfo.position}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Department:</span>
                      <span className="value">{project.roleInfo.department}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Level:</span>
                      <span className="value">{project.roleInfo.roleTitle}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Experience:</span>
                      <span className="value">{project.roleInfo.yearsExperience || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Work Mode:</span>
                      <span className="value">{project.roleInfo.workMode}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Location:</span>
                      <span className="value">{project.roleInfo.location || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="overview-section">
                  <h4>Team & Culture</h4>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="label">Team Size:</span>
                      <span className="value">{project.customization.teamSize || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Management Style:</span>
                      <span className="value">{project.customization.managementStyle}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Industry:</span>
                      <span className="value">{project.customization.industryFocus || 'Not specified'}</span>
                    </div>
                    {project.customization.keySkills.length > 0 && (
                      <div className="info-item">
                        <span className="label">Key Skills:</span>
                        <div className="tag-list">
                          {project.customization.keySkills.map((skill: string, index: number) => (
                            <span key={index} className="tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overview-section">
                  <h4>Assessment Configuration</h4>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="label">Duration:</span>
                      <span className="value">{project.recommendations.assessmentDuration} minutes</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Focus Areas:</span>
                      <div className="tag-list">
                        {project.recommendations.focusAreas.map((area: string, index: number) => (
                          <span key={index} className="tag focus-area">{area}</span>
                        ))}
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="label">Suggested Games:</span>
                      <div className="tag-list">
                        {project.recommendations.suggestedGames.map((game: string, index: number) => (
                          <span key={index} className="tag game">{game}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              <p>Send assessment invitations for {project.roleInfo.position} position</p>
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
                <p>Track candidates for {project.roleInfo.position}</p>
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
                    ? 'Start by inviting candidates for this position.'
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
                                onClick={() => {/* Load and show candidate results modal */}}
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
    </div>
  );
} 