import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { InviteServiceClient } from '@cgames/services';
import type { Project, ProjectCandidate } from '@cgames/types';
import { MultiEmailInvite } from '../../components/project/MultiEmailInvite';
import { NotesPanel } from '../../components/project/NotesPanel';
import { ActivityTimeline } from '../../components/project/ActivityTimeline';
import { CandidateResultsViewer } from './components/CandidateResultsViewer';

// Simple overlay styles for the full-screen results viewer
const resultsOverlayStyles = `
  .results-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  .results-overlay .modern-results-container {
    width: 95vw;
    height: 95vh;
    max-width: none;
    max-height: none;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 25px 100px rgba(0, 0, 0, 0.5);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('results-overlay-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'results-overlay-styles';
    style.textContent = resultsOverlayStyles;
    document.head.appendChild(style);
  }
}

// Modern toast notification state
interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [candidates, setCandidates] = useState<ProjectCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [, setHrUser] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'invited' | 'completed' | 'in-progress'>('all');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(() => {
    const saved = localStorage.getItem(`project-details-${projectId}`);
    return saved ? JSON.parse(saved) : false;
  });

  // Results panel state
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(false);
  const [selectedCandidateResults, setSelectedCandidateResults] = useState<any>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // Toast notification helper
  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Handle viewing candidate results inline
  const handleViewResults = async (candidate: ProjectCandidate) => {
    try {
      setResultsLoading(true);
      setResultsError(null);
      setIsResultsPanelOpen(true);

      console.log('🔍 [ProjectDashboard] Loading results for candidate:', candidate.email);

      // Get current HR user from auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      // Fetch candidate results from our API
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const response = await fetch(`${apiBaseUrl}/api/hr/getCandidateResults?projectId=${projectId}&hrId=${currentUser.uid}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load results: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load results');
      }

      // Find the specific candidate's results
      const candidateResult = data.data?.results?.find((result: any) => 
        result.candidateEmail === candidate.email
      );

      if (!candidateResult) {
        throw new Error('No results found for this candidate');
      }

      console.log('✅ [ProjectDashboard] Candidate results loaded:', candidateResult);
      setSelectedCandidateResults(candidateResult);

    } catch (error) {
      console.error('❌ [ProjectDashboard] Error loading results:', error);
      setResultsError(error instanceof Error ? error.message : 'Failed to load results');
      showToast('Failed to load candidate results', 'error');
    } finally {
      setResultsLoading(false);
    }
  };

  // Toggle project details with persistence
  const toggleProjectDetails = () => {
    const newState = !isProjectDetailsOpen;
    setIsProjectDetailsOpen(newState);
    localStorage.setItem(`project-details-${projectId}`, JSON.stringify(newState));
  };

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

        // Load project data using API endpoint
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const response = await fetch(`${apiBaseUrl}/api/hr/getProject-simple?projectId=${projectId}&hrId=${user.uid}`);
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Project not found');
          } else {
            throw new Error(data.error || `HTTP ${response.status}: Failed to load project`);
          }
          return;
        }
        
        if (!data.success) {
          setError(data.error || 'Failed to load project');
          return;
        }
        
        setProject(data.project);
        setCandidates(data.candidates || []);
      } catch (err: any) {
        setError(`Failed to load project: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, projectId]);

  const handleMultiInvite = async (emails: string[]) => {
    console.log('🚀 [ProjectDashboard] handleMultiInvite called for:', emails, 'project:', projectId);
    setInviteError(null);
    setInviteLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user || !companyId || !projectId) throw new Error('Not authenticated or missing data');

      console.log('🔄 [ProjectDashboard] Sending invites for', emails.length, 'recipients...');
      
      const results = [];
      const newCandidates: ProjectCandidate[] = [];
      
      // Send invites in parallel
      for (const email of emails) {
        try {
          const result = await InviteServiceClient.createInvite({
            email: email,
            projectId: projectId,
            roleTag: project?.roleInfo?.position || 'Project Assessment'
          });

          results.push({ email, success: true, result });
          
          // Add candidate to local state
          const newCandidate: ProjectCandidate = {
            id: result.invite!.id,
            email: email,
            status: 'Invited',
            dateInvited: new Date().toISOString(),
            projectId: projectId,
            inviteToken: result.invite!.token,
          };
          newCandidates.push(newCandidate);
        } catch (err) {
          console.error('Failed to invite:', email, err);
          results.push({ email, success: false, error: err });
        }
      }

      // Update candidates state
      setCandidates((prev) => [...prev, ...newCandidates]);

      // Update project stats
      if (project && newCandidates.length > 0) {
        const updatedStats = {
          ...project.stats,
          totalCandidates: (project.stats?.totalCandidates || 0) + newCandidates.length,
          invitedCandidates: (project.stats?.invitedCandidates || 0) + newCandidates.length,
        };
        
        const projectRef = doc(db, `companies/${companyId}/projects`, projectId);
        await updateDoc(projectRef, { stats: updatedStats });
        
        setProject({ ...project, stats: updatedStats });
      }

      // Show results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0 && failureCount === 0) {
        showToast(`✅ ${successCount} invitation${successCount !== 1 ? 's' : ''} sent successfully!`, 'success');
      } else if (successCount > 0 && failureCount > 0) {
        showToast(`⚠️ ${successCount} invitations sent, ${failureCount} failed. Check console for details.`, 'info');
      } else {
        showToast(`❌ All invitations failed. Please try again.`, 'error');
      }
      
    } catch (err: any) {
      console.error('🚨 [ProjectDashboard] Multi-invite failed:', err);
      setInviteError(`Failed to send invites: ${err.message}`);
      showToast(`Failed to send invites: ${err.message}`, 'error');
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
      <div className="project-dashboard-loading">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <h2>Loading Project Dashboard</h2>
          <p>Please wait while we prepare your project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-dashboard-error">
        <div className="error-container">
          <div className="error-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2>Project Not Found</h2>
          <p className="error-message">{error || 'The requested project could not be found.'}</p>
          <button onClick={() => navigate('/hr/projects')} className="cta-button">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="project-dashboard">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toast.type === 'success' && (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close"
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <header className="project-header sticky">
        <div className="container">
          <div className="header-content">
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumb">
              <button 
                onClick={() => navigate('/hr/projects')}
                className="breadcrumb-link"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Projects
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{project.name}</span>
            </nav>

            {/* Project Info */}
            <div className="project-info">
              <div className="project-title-section">
                <h1 className="project-title">{project.name}</h1>
                <div className="project-meta">
                  <span className="position-tag">{project.roleInfo?.position || 'Assessment'}</span>
                  <span className="department-tag">{project.roleInfo?.department || 'General'}</span>
                  <span className={`status-badge ${project.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-number">{statusCounts.total}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{statusCounts.invited}</span>
                  <span className="stat-label">Invited</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{statusCounts.inProgress}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{statusCounts.completed}</span>
                  <span className="stat-label">Complete</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="header-actions">
              <button 
                onClick={async () => {
                  await signOut(auth);
                  navigate('/hr/login');
                }}
                className="header-action-btn"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="project-content">
        <div className="container">
          <div className="content-grid">
            {/* Left Column: Invite & Overview */}
            <aside className="left-column">
              {/* Multi-Email Invite Component */}
              <MultiEmailInvite
                onInvite={handleMultiInvite}
                isLoading={inviteLoading}
                rolePosition={project.roleInfo?.position || 'Assessment'}
              />

              {/* Collapsible Project Details */}
              <div className="project-details-card">
                <div className="collapsible-header" onClick={toggleProjectDetails}>
                  <div className="header-left">
                    <div className="header-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="header-text">
                      <h3>Project Details</h3>
                      <p>Assessment configuration and requirements</p>
                    </div>
                  </div>
                  <button className="toggle-button">
                    <svg
                      className={`chevron ${isProjectDetailsOpen ? 'open' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className={`collapsible-content ${isProjectDetailsOpen ? 'open' : ''}`}>
                  <div className="overview-content">
                    <div className="info-section">
                      <h4>Role Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Position</span>
                          <span className="value">{project.roleInfo?.position || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Department</span>
                          <span className="value">{project.roleInfo?.department || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Experience Level</span>
                          <span className="value">{project.roleInfo?.yearsExperience || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Work Mode</span>
                          <span className="value">{project.roleInfo?.workMode || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Location</span>
                          <span className="value">{project.roleInfo?.location || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <h4>Team & Culture</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Team Size</span>
                          <span className="value">{project.customization?.teamSize || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Management Style</span>
                          <span className="value">{project.customization?.managementStyle || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Industry</span>
                          <span className="value">{project.customization?.industryFocus || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <h4>Assessment Configuration</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Duration</span>
                          <span className="value">{project.recommendations?.assessmentDuration || '30'} minutes</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Focus Areas</span>
                          <div className="tag-list">
                            {(project.recommendations?.focusAreas || ['Leadership', 'Communication']).map((area: string, index: number) => (
                              <span key={index} className="focus-tag">{area}</span>
                            ))}
                          </div>
                        </div>
                        <div className="info-item">
                          <span className="label">Key Skills</span>
                          <div className="tag-list">
                            {(project.customization?.keySkills || ['Communication', 'Leadership']).map((skill: string, index: number) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                        <div className="info-item">
                          <span className="label">Suggested Games</span>
                          <div className="tag-list">
                            {(project.recommendations?.suggestedGames || ['Leadership Scenario Game']).map((game: string, index: number) => (
                              <span key={index} className="game-tag">{game}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Panel */}
              <NotesPanel projectId={projectId} />

              {/* Activity Timeline */}
              <ActivityTimeline projectId={projectId} maxItems={5} />
            </aside>

            {/* Right Column: Candidates Management */}
            <main className="right-column">
              <div className="candidates-section">
                <div className="section-header">
                  <div className="section-title">
                    <h2>Candidate Management</h2>
                    <p>Track and manage assessment progress</p>
                  </div>

                  {/* Modern Filter Tabs */}
                  <div className="filter-tabs-modern">
                    <div className="tabs-container">
                      <button 
                        className={`tab-button ${selectedFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('all')}
                      >
                        <span className="tab-label">All Candidates</span>
                        <span className="tab-count">{statusCounts.total}</span>
                      </button>
                      <button 
                        className={`tab-button ${selectedFilter === 'invited' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('invited')}
                      >
                        <span className="tab-label">Invited</span>
                        <span className="tab-count">{statusCounts.invited}</span>
                      </button>
                      <button 
                        className={`tab-button ${selectedFilter === 'in-progress' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('in-progress')}
                      >
                        <span className="tab-label">In Progress</span>
                        <span className="tab-count">{statusCounts.inProgress}</span>
                      </button>
                      <button 
                        className={`tab-button ${selectedFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('completed')}
                      >
                        <span className="tab-label">Completed</span>
                        <span className="tab-count">{statusCounts.completed}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Candidates Content */}
                {filteredCandidates.length === 0 ? (
                  <div className="empty-state-enhanced">
                    <div className="empty-illustration">
                      <svg viewBox="0 0 120 120" fill="none">
                        <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
                        <path d="M60 45c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15zm0 24c-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9-4.029 9-9 9z" fill="#9ca3af" />
                        <path d="M60 30c-16.569 0-30 13.431-30 30s13.431 30 30 30 30-13.431 30-30-13.431-30-30-30zm0 54c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z" fill="#d1d5db" />
                      </svg>
                    </div>
                    <div className="empty-content">
                      <h3>
                        {selectedFilter === 'all' 
                          ? 'No candidates yet' 
                          : `No ${selectedFilter} candidates`}
                      </h3>
                      <p>
                        {selectedFilter === 'all' 
                          ? `Ready to find your next ${project.roleInfo?.position || 'candidate'}? Start by sending your first assessment invitation.`
                          : `No candidates match the "${selectedFilter}" status filter. Try switching to "All Candidates" or invite more people.`}
                      </p>
                      {selectedFilter === 'all' && (
                        <button 
                          onClick={() => document.getElementById('candidate-email')?.focus()}
                          className="empty-cta-button"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                          Send First Invitation
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="candidates-table-container">
                    {/* Desktop Table View */}
                    <div className="table-responsive">
                      <table className="candidates-table-modern">
                        <thead>
                          <tr>
                            <th>Candidate</th>
                            <th>Status</th>
                            <th>Invited</th>
                            <th>Completed</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCandidates.map((candidate) => (
                            <tr key={candidate.id} className="candidate-row">
                              <td>
                                <div className="candidate-cell">
                                  <div className="candidate-avatar">
                                    <span>{candidate.email ? candidate.email.charAt(0).toUpperCase() : '?'}</span>
                                  </div>
                                  <div className="candidate-info">
                                    <div className="candidate-email">{candidate.email || 'No email'}</div>
                                    <div className="candidate-id">ID: {candidate.id ? candidate.id.slice(0, 8) : 'Unknown'}</div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className={`status-badge-modern ${getStatusColor(candidate.status)}`}>
                                  <span className="status-dot"></span>
                                  {candidate.status}
                                </span>
                              </td>
                              <td>
                                <div className="date-cell">
                                  {new Date(candidate.dateInvited).toLocaleDateString()}
                                </div>
                              </td>
                              <td>
                                <div className="date-cell">
                                  {candidate.dateCompleted
                                    ? new Date(candidate.dateCompleted).toLocaleDateString()
                                    : '—'}
                                </div>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  {candidate.status === 'Completed' ? (
                                    <button 
                                      className="action-button primary"
                                      onClick={() => handleViewResults(candidate)}
                                      disabled={resultsLoading}
                                    >
                                      <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                      </svg>
                                      {resultsLoading ? 'Loading...' : 'View Results'}
                                    </button>
                                  ) : (
                                    <div className="pending-indicator">
                                      <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      Pending
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-cards-container">
                      <div className="candidates-cards">
                        {filteredCandidates.map((candidate) => (
                          <div key={candidate.id} className="candidate-card">
                            <div className="candidate-card-header">
                              <div className="candidate-avatar">
                                <span>{candidate.email ? candidate.email.charAt(0).toUpperCase() : '?'}</span>
                              </div>
                              <div className="candidate-info">
                                <div className="candidate-email">{candidate.email || 'No email'}</div>
                                <div className="candidate-id">ID: {candidate.id ? candidate.id.slice(0, 8) : 'Unknown'}</div>
                              </div>
                            </div>
                            
                            <div className="candidate-card-body">
                              <div className="candidate-card-field">
                                <div className="candidate-card-label">Status</div>
                                <div className="candidate-card-value">
                                  <span className={`status-badge-modern ${getStatusColor(candidate.status)}`}>
                                    <span className="status-dot"></span>
                                    {candidate.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="candidate-card-field">
                                <div className="candidate-card-label">Date Invited</div>
                                <div className="candidate-card-value">
                                  {new Date(candidate.dateInvited).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="candidate-card-field">
                                <div className="candidate-card-label">Date Completed</div>
                                <div className="candidate-card-value">
                                  {candidate.dateCompleted
                                    ? new Date(candidate.dateCompleted).toLocaleDateString()
                                    : '—'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="candidate-card-actions">
                              {candidate.status === 'Completed' ? (
                                <button 
                                  className="action-button primary"
                                  onClick={() => {
                                    window.open(`/hr/candidates/${candidate.id}/results?projectId=${projectId}&candidateEmail=${candidate.email}`, '_blank');
                                  }}
                                >
                                  <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                  View Results
                                </button>
                              ) : (
                                <div className="pending-indicator">
                                  <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Pending
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </main>

      {/* Full ResultsScreen Viewer */}
      {isResultsPanelOpen && selectedCandidateResults && (
        <div className="results-overlay" onClick={() => setIsResultsPanelOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CandidateResultsViewer
              candidateResults={selectedCandidateResults}
              onClose={() => setIsResultsPanelOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 