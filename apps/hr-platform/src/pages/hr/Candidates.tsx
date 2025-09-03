import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Project } from '@cgames/types';
import { Navigation } from '@cgames/ui-kit';
import '@cgames/ui-kit/styles/hr.css';
import '@cgames/ui-kit/styles/navigation.css';
import '@cgames/ui-kit/styles/candidates.css';

interface CandidateData {
  id: string;
  email: string;
  status: 'Invited' | 'InProgress' | 'Completed';
  dateInvited: string;
  dateCompleted?: string;
  inviteToken?: string;
  totalScore?: number;
  competencyBreakdown?: Record<string, number>;
  lastOpenedAt?: string;
}

export default function Candidates() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [searchParams] = useSearchParams();
  
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hrUser, setHrUser] = useState<any>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  
  // Filter states
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'email' | 'dateInvited' | 'totalScore' | 'status'>('dateInvited');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load projects and HR user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/hr/login');
        return;
      }

      try {
        const hrUserDoc = await getDoc(doc(db, 'hrUsers', user.uid));
        if (hrUserDoc.exists()) {
          const userData = hrUserDoc.data();
          setHrUser(userData);
          setCompanyId(userData.companyId);
          
          // Fetch company data
          try {
            const companyDocRef = doc(db, 'companies', userData.companyId);
            const companyDocSnap = await getDoc(companyDocRef);
            if (companyDocSnap.exists()) {
              setCompanyData(companyDocSnap.data());
            }
          } catch (companyError) {
            console.warn('Could not fetch company data:', companyError);
          }
        } else {
          console.error('HR user document not found');
          navigate('/hr/login');
        }
      } catch (error) {
        console.error('Error fetching HR user:', error);
        navigate('/hr/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      if (!companyId) return;
      
      try {
        console.log('🔄 [Candidates] Loading projects for company:', companyId);
        
        const projectsQuery = query(collection(db, `companies/${companyId}/projects`));
        const projectsSnapshot = await getDocs(projectsQuery);
        
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        
        setProjects(projectsList);
        console.log(`✅ [Candidates] Loaded ${projectsList.length} projects`);
        
        // If there's a projectId in URL params, select it
        const projectIdFromUrl = searchParams.get('projectId');
        if (projectIdFromUrl && projectsList.some(p => p.id === projectIdFromUrl)) {
          setSelectedProject(projectIdFromUrl);
        }
        
      } catch (err) {
        console.error('❌ [Candidates] Error loading projects:', err);
        setError('Failed to load projects');
      }
    };

    loadProjects();
  }, [companyId, searchParams]);

  // Load candidates for selected project
  useEffect(() => {
    const loadCandidates = async () => {
      if (!companyId || !hrUser?.id || selectedProject === 'all') {
        setCandidates([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [Candidates] Loading candidates for project:', selectedProject);
        
        // Use our new API endpoint
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const response = await fetch(`${apiBaseUrl}/api/hr/getProjectCandidates?projectId=${selectedProject}&hrId=${hrUser.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: Failed to load candidates`);
        }
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load candidates');
        }
        
        setCandidates(data.candidates || []);
        console.log(`✅ [Candidates] Loaded ${data.candidates?.length || 0} candidates`);
        
      } catch (err: any) {
        console.error('❌ [Candidates] Error loading candidates:', err);
        setError(`Failed to load candidates: ${err.message}`);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [companyId, hrUser?.id, selectedProject]);

  // Filter and sort candidates
  const filteredAndSortedCandidates = candidates
    .filter(candidate => {
      // Status filter
      if (selectedStatus !== 'all' && candidate.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      
      // Search filter
      if (searchTerm && !candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'dateInvited':
          aValue = new Date(a.dateInvited).getTime();
          bValue = new Date(b.dateInvited).getTime();
          break;
        case 'totalScore':
          aValue = a.totalScore || 0;
          bValue = b.totalScore || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Status counts
  const statusCounts = {
    all: candidates.length,
    invited: candidates.filter(c => c.status === 'Invited').length,
    inProgress: candidates.filter(c => c.status === 'InProgress').length,
    completed: candidates.filter(c => c.status === 'Completed').length,
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Invited': return 'status-invited';
      case 'InProgress': return 'status-in-progress';  
      case 'Completed': return 'status-completed';
      default: return 'status-default';
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return (
        <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="sort-icon active" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="sort-icon active" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  if (loading && selectedProject === 'all') {
    return (
      <div className="hr-dashboard">
        <Navigation 
          hrUser={hrUser}
          companyData={companyData}
        />
        <div className="hr-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading candidates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-dashboard">
      <Navigation 
        hrUser={hrUser}
        companyData={companyData}
      />
      <div className="hr-content">
        <div className="candidates-page">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <h1>Candidate Management</h1>
              <p>View and manage candidates across all your assessment projects</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="filters-section">
            <div className="filters-card">
              <div className="filters-row">
                {/* Project Filter */}
                <div className="filter-group">
                  <label htmlFor="project-filter">Project</label>
                  <select
                    id="project-filter"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="filter-group">
                  <label htmlFor="status-filter">Status</label>
                  <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status ({statusCounts.all})</option>
                    <option value="invited">Invited ({statusCounts.invited})</option>
                    <option value="inprogress">In Progress ({statusCounts.inProgress})</option>
                    <option value="completed">Completed ({statusCounts.completed})</option>
                  </select>
                </div>

                {/* Search */}
                <div className="filter-group">
                  <label htmlFor="search">Search</label>
                  <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                      id="search"
                      type="text"
                      placeholder="Search by email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="candidates-section">
            <div className="section-card">
              {selectedProject === 'all' ? (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <h3>Select a Project</h3>
                  <p>Choose a project from the dropdown above to view its candidates.</p>
                </div>
              ) : loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading candidates...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <h3>Error Loading Candidates</h3>
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="button primary"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredAndSortedCandidates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No Candidates Found</h3>
                  <p>
                    {searchTerm 
                      ? `No candidates match your search "${searchTerm}"`
                      : selectedStatus !== 'all'
                      ? `No candidates with "${selectedStatus}" status`
                      : 'No candidates have been invited to this project yet.'
                    }
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="candidates-table">
                    <thead>
                      <tr>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('email')}
                        >
                          Email
                          {getSortIcon('email')}
                        </th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('status')}
                        >
                          Status
                          {getSortIcon('status')}
                        </th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('dateInvited')}
                        >
                          Date Invited
                          {getSortIcon('dateInvited')}
                        </th>
                        <th>Date Completed</th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('totalScore')}
                        >
                          Score
                          {getSortIcon('totalScore')}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedCandidates.map((candidate) => (
                        <tr key={candidate.id}>
                          <td>
                            <div className="candidate-info">
                              <span className="email">{candidate.email}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(candidate.status)}`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td>
                            {new Date(candidate.dateInvited).toLocaleDateString()}
                          </td>
                          <td>
                            {candidate.dateCompleted 
                              ? new Date(candidate.dateCompleted).toLocaleDateString()
                              : '—'
                            }
                          </td>
                          <td>
                            {candidate.totalScore !== undefined 
                              ? `${candidate.totalScore}/100`
                              : '—'
                            }
                          </td>
                          <td>
                            <div className="action-buttons">
                              {candidate.status === 'Completed' && (
                                <button
                                  className="action-button view"
                                  onClick={() => {
                                    // Navigate to dedicated results page
                                    navigate(`/hr/candidates/${candidate.id}/results`, { 
                                      state: { candidate } 
                                    });
                                  }}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 