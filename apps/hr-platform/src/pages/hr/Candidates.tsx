import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Project } from '@cgames/types';
import { Navigation } from '@cgames/ui-kit';
import '@cgames/ui-kit/styles/hr.css';
import '@cgames/ui-kit/styles/navigation.css';
import '@cgames/ui-kit/styles/candidates.css';


interface Candidate {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  status: 'invited' | 'in-progress' | 'completed' | 'hired' | 'rejected';
  invitedAt: string;
  completedAt?: string;
  score?: number;
  stage: 'application' | 'assessment' | 'interview' | 'offer' | 'hired' | 'rejected';
  notes?: string;
  source?: string;
  gameType?: string;
}

export default function Candidates() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hrUser, setHrUser] = useState<any>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'invitedAt' | 'score' | 'status'>('invitedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');

  // Mock candidate data - in a real app, this would come from Firestore
  const generateMockCandidates = (projects: Project[]): Candidate[] => {
    const mockCandidates: Candidate[] = [];
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Jessica', 'William', 'Amanda'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    const stages = ['application', 'assessment', 'interview', 'offer', 'hired', 'rejected'] as const;
    const statuses = ['invited', 'in-progress', 'completed', 'hired', 'rejected'] as const;
    const sources = ['LinkedIn', 'Company Website', 'Referral', 'Job Board', 'University', 'Recruiter'];

    projects.forEach((project) => {
      const candidateCount = Math.floor(Math.random() * 8) + 3; // 3-10 candidates per project
      
      for (let i = 0; i < candidateCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const stage = stages[Math.floor(Math.random() * stages.length)];
        const invitedDaysAgo = Math.floor(Math.random() * 30) + 1;
        const invitedAt = new Date(Date.now() - invitedDaysAgo * 24 * 60 * 60 * 1000).toISOString();
        
        mockCandidates.push({
          id: `${project.id}-candidate-${i}`,
          projectId: project.id,
          projectName: project.name,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
          phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          position: project.roleInfo.position,
          department: project.roleInfo.department,
          status,
          stage,
          invitedAt,
          completedAt: status === 'completed' ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() : undefined,
          score: status === 'completed' ? Math.floor(Math.random() * 40) + 60 : undefined,
          notes: Math.random() > 0.7 ? 'Strong technical background, good communication skills' : undefined,
          source: sources[Math.floor(Math.random() * sources.length)],
          gameType: Math.random() > 0.5 ? 'Leadership Scenario Game' : undefined
        });
      }
    });

    return mockCandidates;
  };

  const filteredAndSortedCandidates = candidates
    .filter(candidate => {
      if (selectedProject !== 'all' && candidate.projectId !== selectedProject) return false;
      if (selectedStatus !== 'all' && candidate.status !== selectedStatus) return false;
      if (selectedStage !== 'all' && candidate.stage !== selectedStage) return false;
      if (searchTerm && !candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'invitedAt':
          aValue = new Date(a.invitedAt).getTime();
          bValue = new Date(b.invitedAt).getTime();
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });



  const handleChangeGame = (candidateId: string) => {
    setSelectedCandidate(candidateId);
    setShowGameModal(true);
  };

  const handleResendInvite = async (candidateId: string) => {
    // Implementation for resending invite
    console.log('Resending invite for:', candidateId);
  };

  const handleViewResults = (candidateId: string) => {
    // Implementation for viewing results
    console.log('Viewing results for:', candidateId);
  };

  const handleUpdateGame = (game: string) => {
    // Implementation for updating game
    console.log('Updating game for candidate:', selectedCandidate, 'to:', game);
    setShowGameModal(false);
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
          navigate('/hr/login');
          return;
        }
        
        const hrData = hrDocSnap.data();
        setHrUser(hrData);
        const userCompanyId = hrData.companyId as string;

        // Load projects
        const q = query(collection(db, `companies/${userCompanyId}/projects`));
        const snapshot = await getDocs(q);
        const projectsList: Project[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Project, 'id'>),
        }));
        
        setProjects(projectsList);
        setCandidates(generateMockCandidates(projectsList));
      } catch (err: any) {
        setError(`Failed to load candidates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) {
    return (
      <>
        <Navigation 
          isCollapsed={isNavCollapsed} 
          setIsCollapsed={setIsNavCollapsed} 
          hrUser={hrUser} 
        />
        <div className="hr-dashboard-loading" style={{ marginLeft: isNavCollapsed ? '72px' : '280px' }}>
          <div className="loading-spinner-large"></div>
          <p>Loading candidates...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation 
          isCollapsed={isNavCollapsed} 
          setIsCollapsed={setIsNavCollapsed} 
          hrUser={hrUser} 
        />
        <div className="hr-dashboard-error" style={{ marginLeft: isNavCollapsed ? '72px' : '280px' }}>
          <div className="error-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2>Unable to load candidates</h2>
          <p>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation 
        isCollapsed={isNavCollapsed} 
        setIsCollapsed={setIsNavCollapsed} 
        hrUser={hrUser} 
      />
      
      <div className="hr-dashboard" style={{ marginLeft: isNavCollapsed ? '72px' : '280px', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-info">
                <h1>Candidate Pipeline</h1>
                <p>Manage and track all candidates across your recruitment projects</p>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Quick Stats */}
          <div className="stats-grid candidate-stats">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-number">{candidates.length}</div>
                <div className="stat-label">Total Candidates</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-number">{candidates.filter(c => c.status === 'in-progress').length}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-number">{candidates.filter(c => c.status === 'completed').length}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-number">{candidates.filter(c => c.status === 'hired').length}</div>
                <div className="stat-label">Hired</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="candidates-controls">
            <div className="search-section">
              <div className="search-input">
                <svg viewBox="0 0 20 20" fill="currentColor" className="search-icon">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="Search candidates by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filters-section">
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="invited">Invited</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>

              <select 
                value={selectedStage} 
                onChange={(e) => setSelectedStage(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Stages</option>
                <option value="application">Application</option>
                <option value="assessment">Assessment</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>

              <select 
                value={`${sortBy}-${sortOrder}`} 
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="filter-select"
              >
                <option value="invitedAt-desc">Newest First</option>
                <option value="invitedAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
              </select>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="candidates-section">
            <div className="section-card">
              <div className="candidates-table">
                <div className="table-header">
                  <div className="table-cell candidate">Candidate</div>
                  <div className="table-cell status">Status</div>
                  <div className="table-cell game">Game</div>
                  <div className="table-cell date">Date Invited</div>
                  <div className="table-cell date">Date Completed</div>
                  <div className="table-cell actions">Actions</div>
                </div>

                <div className="table-body">
                  {filteredAndSortedCandidates.map((candidate) => (
                    <div key={candidate.id} className="table-row">
                      <div className="table-cell candidate">
                        <div className="candidate-info">
                          <div className="candidate-avatar">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="candidate-details">
                            <span className="candidate-name">{candidate.name}</span>
                            <span className="candidate-id">ID: {candidate.id?.substring(0, 8) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-cell status">
                        <span 
                          className={`status-badge ${candidate.status}`}
                        >
                          {candidate.status === 'invited' && '📧 Pending'}
                          {candidate.status === 'in-progress' && '🎮 In Progress'}
                          {candidate.status === 'completed' && '✅ Completed'}
                          {candidate.status === 'hired' && '✅ Hired'}
                          {candidate.status === 'rejected' && '❌ Rejected'}
                        </span>
                      </div>

                      <div className="table-cell game">
                        <span className="game-tag">{candidate.gameType || 'Leadership Scenario Game'}</span>
                      </div>

                      <div className="table-cell date">
                        {candidate.invitedAt ? new Date(candidate.invitedAt).toLocaleDateString() : '—'}
                      </div>

                      <div className="table-cell date">
                        {candidate.status === 'completed' ? new Date(candidate.completedAt || '').toLocaleDateString() : '—'}
                      </div>

                      <div className="table-cell actions">
                        {candidate.status === 'invited' && (
                          <div className="action-buttons">
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleResendInvite(candidate.id)}
                            >
                              Resend
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => handleChangeGame(candidate.id)}
                            >
                              Change Game
                            </button>
                          </div>
                        )}
                        {candidate.status === 'completed' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewResults(candidate.id)}
                          >
                            View Results
                          </button>
                        )}
                        {candidate.status === 'in-progress' && (
                          <span className="status-text">In Progress...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {filteredAndSortedCandidates.length === 0 && (
                <div className="empty-state">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="empty-icon">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <h3>No candidates found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Selection Modal */}
      {showGameModal && (
        <div className="modal-overlay" onClick={() => setShowGameModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Assessment Game</h3>
              <button 
                className="modal-close"
                onClick={() => setShowGameModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Select a new game for this candidate:</p>
              <div className="game-selection">
                {['Leadership Scenario Game', 'Team Building Simulation', 'Crisis Management Scenarios', 
                  'Strategic Planning Exercise', 'Negotiation Simulation', 'Communication Challenges'].map(game => (
                  <label key={game} className="game-option">
                    <input 
                      type="radio" 
                      name="selectedGame" 
                      value={game}
                      onChange={() => {}}
                    />
                    <span className="game-title">{game}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowGameModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleUpdateGame('Leadership Scenario Game')}
              >
                Update Game
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 