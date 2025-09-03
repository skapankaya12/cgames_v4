import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import RestrictedSignup from './pages/hr/RestrictedSignup';
import HrLogin from './pages/hr/HrLogin';
import HrDashboard from './pages/hr/HrDashboard';
import ProjectsOverview from './pages/hr/ProjectsOverview';
import ProjectCreation from './pages/hr/ProjectCreation';
import ProjectDashboard from './pages/hr/ProjectDashboard';
import ProjectSettings from './pages/hr/ProjectSettings';
import TeamManagement from './pages/hr/TeamManagement';
import Analytics from './pages/hr/Analytics';
import Candidates from './pages/hr/Candidates';
import CandidateResults from './pages/hr/CandidateResults';
import AdminLogin from './pages/admin/AdminLogin';
import CreateCompany from './pages/admin/CreateCompany';
import './App.css';

// Landing Page Component
function LandingPage() {
  return (
    <div className="full-page-container landing-container">
      <div className="landing-background">
        <div className="landing-shapes">
          <div className="landing-shape"></div>
          <div className="landing-shape"></div>
          <div className="landing-shape"></div>
        </div>
      </div>
      
      <div className="landing-content">
        <div className="landing-logo">
          <img src="/HR.png" alt="OlivinHR" className="olivinhr-logo" />
        </div>
        <div className="landing-actions">
          <a 
            href="/hr" 
            className="landing-button primary"
            aria-label="Access HR Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
            HR Dashboard
          </a>
          <a 
            href="/admin/login" 
            className="landing-button"
            aria-label="Super Admin Login"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l3.257-3.257A6 6 0 1118 8zm-6-2a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
            Admin Access
          </a>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div className="app">
      <Routes>
        {/* Main website landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin authentication routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected admin routes */}
        <Route 
          path="/admin/create-company" 
          element={
            <ProtectedRoute requiredRole="super_admin">
              <CreateCompany />
            </ProtectedRoute>
          } 
        />
        
        {/* HR authentication routes */}
        <Route path="/hr/register" element={<RestrictedSignup />} />
        <Route path="/hr/signup" element={<RestrictedSignup />} />
        <Route path="/signup" element={<RestrictedSignup />} />
        <Route path="/register" element={<RestrictedSignup />} />
        <Route path="/hr/login" element={<HrLogin />} />
        
        {/* HR main routes - Project-based system */}
        <Route path="/hr" element={<ProjectsOverview />} />
        <Route path="/hr/projects" element={<ProjectsOverview />} />
        <Route 
          path="/hr/projects/new" 
          element={
            <ProtectedRoute requiredRole="hr_user" requiredHrRole="admin">
              <ProjectCreation />
            </ProtectedRoute>
          }
        />
        <Route path="/hr/projects/:projectId" element={<ProjectDashboard />} />
        <Route 
          path="/hr/projects/:projectId/settings" 
          element={
            <ProtectedRoute requiredRole="hr_user" requiredHrRole="admin">
              <ProjectSettings />
            </ProtectedRoute>
          }
        />
        
        {/* Team Management - Admin only */}
        <Route 
          path="/hr/team" 
          element={
            <ProtectedRoute requiredRole="hr_user" requiredHrRole="admin">
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        
        {/* HR Analytics and Candidates */}
        <Route path="/hr/analytics" element={<Analytics />} />
        <Route path="/hr/candidates" element={<Candidates />} />
        <Route path="/hr/candidates/:candidateId/results" element={<CandidateResults />} />
        
        {/* Legacy HR dashboard route for backwards compatibility */}
        <Route path="/hr/dashboard" element={<HrDashboard />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
