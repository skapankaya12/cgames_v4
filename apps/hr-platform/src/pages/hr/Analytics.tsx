import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Project } from '@types/project';
import Navigation from '@ui/Navigation';
import '../../styles/navigation.css';
import '../../styles/analytics.css';

interface AnalyticsData {
  totalProjects: number;
  totalCandidates: number;
  averageTimeToHire: number;
  conversionRate: number;
  topPerformingRoles: Array<{
    position: string;
    department: string;
    candidateCount: number;
    completionRate: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    projects: number;
    candidates: number;
    hires: number;
  }>;
  departmentBreakdown: Array<{
    department: string;
    projectCount: number;
    candidateCount: number;
  }>;
}

export default function Analytics() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hrUser, setHrUser] = useState<any>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const calculateAnalytics = (projects: Project[]): AnalyticsData => {
    const totalProjects = projects.length;
    const totalCandidates = projects.reduce((sum, p) => sum + p.stats.totalCandidates, 0);
    const totalCompleted = projects.reduce((sum, p) => sum + p.stats.completedCandidates, 0);
    const totalInvited = projects.reduce((sum, p) => sum + p.stats.invitedCandidates, 0);
    
    const conversionRate = totalInvited > 0 ? (totalCompleted / totalInvited) * 100 : 0;
    
    // Calculate average time to hire (mockup - would need actual data)
    const averageTimeToHire = 25; // days
    
    // Top performing roles
    const rolePerformance = new Map<string, {
      position: string;
      department: string;
      candidateCount: number;
      completedCount: number;
    }>();
    
    projects.forEach(project => {
      const key = `${project.roleInfo.position}-${project.roleInfo.department}`;
      if (!rolePerformance.has(key)) {
        rolePerformance.set(key, {
          position: project.roleInfo.position,
          department: project.roleInfo.department,
          candidateCount: 0,
          completedCount: 0
        });
      }
      const role = rolePerformance.get(key)!;
      role.candidateCount += project.stats.totalCandidates;
      role.completedCount += project.stats.completedCandidates;
    });
    
    const topPerformingRoles = Array.from(rolePerformance.values())
      .map(role => ({
        position: role.position,
        department: role.department,
        candidateCount: role.candidateCount,
        completionRate: role.candidateCount > 0 ? (role.completedCount / role.candidateCount) * 100 : 0
      }))
      .sort((a, b) => b.candidateCount - a.candidateCount)
      .slice(0, 5);
    
    // Department breakdown
    const departmentMap = new Map<string, { projectCount: number; candidateCount: number }>();
    projects.forEach(project => {
      const dept = project.roleInfo.department;
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, { projectCount: 0, candidateCount: 0 });
      }
      const deptData = departmentMap.get(dept)!;
      deptData.projectCount += 1;
      deptData.candidateCount += project.stats.totalCandidates;
    });
    
    const departmentBreakdown = Array.from(departmentMap.entries()).map(([department, data]) => ({
      department,
      ...data
    }));
    
    // Monthly trends (mockup - would need actual date-based data)
    const monthlyTrends = [
      { month: 'Jan', projects: 5, candidates: 45, hires: 12 },
      { month: 'Feb', projects: 7, candidates: 52, hires: 15 },
      { month: 'Mar', projects: 6, candidates: 48, hires: 14 },
      { month: 'Apr', projects: 8, candidates: 63, hires: 18 },
      { month: 'May', projects: 9, candidates: 71, hires: 22 },
      { month: 'Jun', projects: 11, candidates: 89, hires: 28 }
    ];
    
    return {
      totalProjects,
      totalCandidates,
      averageTimeToHire,
      conversionRate,
      topPerformingRoles,
      monthlyTrends,
      departmentBreakdown
    };
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
        setAnalyticsData(calculateAnalytics(projectsList));
      } catch (err: any) {
        setError(`Failed to load analytics: ${err.message}`);
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
          <p>Loading analytics...</p>
        </div>
      </>
    );
  }

  if (error || !analyticsData) {
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
          <h2>Unable to load analytics</h2>
          <p>{error || 'No data available'}</p>
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
                <h1>Analytics Dashboard</h1>
                <p>Insights into your recruitment process and performance metrics</p>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Key Metrics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analyticsData.totalProjects}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon candidates">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analyticsData.totalCandidates}</div>
                <div className="stat-label">Total Candidates</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon time">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analyticsData.averageTimeToHire}</div>
                <div className="stat-label">Avg. Days to Hire</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon conversion">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analyticsData.conversionRate.toFixed(1)}%</div>
                <div className="stat-label">Conversion Rate</div>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            {/* Top Performing Roles */}
            <div className="analytics-card">
              <div className="card-header">
                <h3>Top Performing Roles</h3>
                <p>Roles with highest candidate volume and completion rates</p>
              </div>
              <div className="analytics-content">
                {analyticsData.topPerformingRoles.map((role, index) => (
                  <div key={index} className="role-performance-item">
                    <div className="role-info">
                      <div className="role-title">{role.position}</div>
                      <div className="role-department">{role.department}</div>
                    </div>
                    <div className="role-metrics">
                      <div className="metric">
                        <span className="metric-value">{role.candidateCount}</span>
                        <span className="metric-label">Candidates</span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{role.completionRate.toFixed(1)}%</span>
                        <span className="metric-label">Success Rate</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="analytics-card">
              <div className="card-header">
                <h3>Department Breakdown</h3>
                <p>Project and candidate distribution by department</p>
              </div>
              <div className="analytics-content">
                {analyticsData.departmentBreakdown.map((dept, index) => (
                  <div key={index} className="department-item">
                    <div className="department-name">{dept.department}</div>
                    <div className="department-stats">
                      <div className="stat-pill">
                        <span className="stat-value">{dept.projectCount}</span>
                        <span className="stat-label">Projects</span>
                      </div>
                      <div className="stat-pill">
                        <span className="stat-value">{dept.candidateCount}</span>
                        <span className="stat-label">Candidates</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="analytics-card full-width">
              <div className="card-header">
                <h3>Recruitment Trends</h3>
                <p>Monthly overview of projects, candidates, and successful hires</p>
              </div>
              <div className="analytics-content">
                <div className="trends-chart">
                  {analyticsData.monthlyTrends.map((month, index) => (
                    <div key={index} className="trend-month">
                      <div className="month-label">{month.month}</div>
                      <div className="trend-bars">
                        <div className="trend-bar">
                          <div 
                            className="bar projects" 
                            style={{ height: `${(month.projects / 12) * 100}%` }}
                            title={`${month.projects} projects`}
                          ></div>
                        </div>
                        <div className="trend-bar">
                          <div 
                            className="bar candidates" 
                            style={{ height: `${(month.candidates / 100) * 100}%` }}
                            title={`${month.candidates} candidates`}
                          ></div>
                        </div>
                        <div className="trend-bar">
                          <div 
                            className="bar hires" 
                            style={{ height: `${(month.hires / 30) * 100}%` }}
                            title={`${month.hires} hires`}
                          ></div>
                        </div>
                      </div>
                      <div className="trend-values">
                        <span className="projects-value">{month.projects}</span>
                        <span className="candidates-value">{month.candidates}</span>
                        <span className="hires-value">{month.hires}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color projects"></div>
                    <span>Projects</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color candidates"></div>
                    <span>Candidates</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color hires"></div>
                    <span>Hires</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiring Funnel */}
            <div className="analytics-card full-width">
              <div className="card-header">
                <h3>Recruitment Funnel</h3>
                <p>Candidate flow through your recruitment process</p>
              </div>
              <div className="analytics-content">
                <div className="funnel">
                  <div className="funnel-stage">
                    <div className="funnel-bar" style={{ width: '100%' }}>
                      <span className="funnel-label">Invited</span>
                      <span className="funnel-value">{projects.reduce((sum, p) => sum + p.stats.invitedCandidates, 0)}</span>
                    </div>
                  </div>
                  <div className="funnel-stage">
                    <div className="funnel-bar" style={{ width: '75%' }}>
                      <span className="funnel-label">In Progress</span>
                      <span className="funnel-value">{projects.reduce((sum, p) => sum + p.stats.inProgressCandidates, 0)}</span>
                    </div>
                  </div>
                  <div className="funnel-stage">
                    <div className="funnel-bar" style={{ width: '50%' }}>
                      <span className="funnel-label">Completed Assessment</span>
                      <span className="funnel-value">{projects.reduce((sum, p) => sum + p.stats.completedCandidates, 0)}</span>
                    </div>
                  </div>
                  <div className="funnel-stage">
                    <div className="funnel-bar" style={{ width: '25%' }}>
                      <span className="funnel-label">Hired</span>
                      <span className="funnel-value">{Math.floor(projects.reduce((sum, p) => sum + p.stats.completedCandidates, 0) * 0.3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 