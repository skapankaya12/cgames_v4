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

// Placeholder Landing Page Component
function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to BokumunKuşu</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Advanced Leadership Assessment Platform
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/hr" 
            style={{ 
              padding: '12px 24px', 
              background: 'rgba(255,255,255,0.2)', 
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px', 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            HR Dashboard
          </a>
          <a 
            href="/hr/register" 
            style={{ 
              padding: '12px 24px', 
              background: 'rgba(255,255,255,0.1)', 
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
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
