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
          source: sources[Math.floor(Math.random() * sources.length)]
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return '#3B82F6';
      case 'in-progress': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'hired': return '#059669';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'application': return '#8B5CF6';
      case 'assessment': return '#3B82F6';
      case 'interview': return '#F59E0B';
      case 'offer': return '#10B981';
      case 'hired': return '#059669';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
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
                  <div className="table-row header">
                    <div className="table-cell candidate-info">Candidate</div>
                    <div className="table-cell project">Project</div>
                    <div className="table-cell status">Status</div>
                    <div className="table-cell stage">Stage</div>
                    <div className="table-cell score">Score</div>
                    <div className="table-cell source">Source</div>
                    <div className="table-cell invited">Invited</div>
                    <div className="table-cell actions">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {filteredAndSortedCandidates.map((candidate) => (
                    <div key={candidate.id} className="table-row">
                      <div className="table-cell candidate-info">
                        <div className="candidate-details">
                          <div className="candidate-avatar">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="candidate-text">
                            <div className="candidate-name">{candidate.name}</div>
                            <div className="candidate-email">{candidate.email}</div>
                            <div className="candidate-role">{candidate.position}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-cell project">
                        <div className="project-badge">
                          {candidate.projectName}
                        </div>
                        <div className="department-text">{candidate.department}</div>
                      </div>
                      
                      <div className="table-cell status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(candidate.status) }}
                        >
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="table-cell stage">
                        <span 
                          className="stage-badge"
                          style={{ backgroundColor: getStageColor(candidate.stage) }}
                        >
                          {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                        </span>
                      </div>
                      
                      <div className="table-cell score">
                        {candidate.score ? (
                          <div className="score-display">
                            <span className="score-value">{candidate.score}</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{ width: `${candidate.score}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="no-score">-</span>
                        )}
                      </div>
                      
                      <div className="table-cell source">
                        <span className="source-text">{candidate.source}</span>
                      </div>
                      
                      <div className="table-cell invited">
                        <div className="date-info">
                          <span className="date-text">
                            {new Date(candidate.invitedAt).toLocaleDateString()}
                          </span>
                          <span className="days-ago">
                            {Math.floor((Date.now() - new Date(candidate.invitedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </span>
                        </div>
                      </div>
                      
                      <div className="table-cell actions">
                        <div className="action-buttons">
                          <button className="action-btn view" title="View Details">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="action-btn edit" title="Edit Candidate">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button className="action-btn message" title="Send Message">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </button>
                        </div>
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
    </>
  );
} 