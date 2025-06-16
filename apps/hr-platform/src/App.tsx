import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HrRegister from './pages/hr/HrRegister';
import HrLogin from './pages/hr/HrLogin';
import HrDashboard from './pages/hr/HrDashboard';
import ProjectsOverview from './pages/hr/ProjectsOverview';
import ProjectCreation from './pages/hr/ProjectCreation';
import ProjectDashboard from './pages/hr/ProjectDashboard';
import ProjectSettings from './pages/hr/ProjectSettings';
import Analytics from './pages/hr/Analytics';
import Candidates from './pages/hr/Candidates';
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
        <h1 className="landing-title">Welcome to BokumunKuşu</h1>
        <p className="landing-subtitle">
          Advanced Leadership Assessment Platform
        </p>
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
            href="/hr/register" 
            className="landing-button"
            aria-label="Register new account"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Register
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
        
        {/* HR authentication routes */}
        <Route path="/hr/register" element={<HrRegister />} />
        <Route path="/hr/login" element={<HrLogin />} />
        
        {/* HR main routes - Project-based system */}
        <Route path="/hr" element={<ProjectsOverview />} />
        <Route path="/hr/projects" element={<ProjectsOverview />} />
        <Route path="/hr/projects/new" element={<ProjectCreation />} />
        <Route path="/hr/projects/:projectId" element={<ProjectDashboard />} />
        <Route path="/hr/projects/:projectId/settings" element={<ProjectSettings />} />
        
        {/* HR Analytics and Candidates */}
        <Route path="/hr/analytics" element={<Analytics />} />
        <Route path="/hr/candidates" element={<Candidates />} />
        
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
      <AppContent />
    </Router>
  );
}

export default App;
