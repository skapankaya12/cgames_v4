import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@cgames/ui-kit';
import IdentityScreen from './pages/candidate/IdentityScreen';
import FormScreen from './pages/candidate/FormScreen';
import TestScreen from './pages/candidate/TestScreen';
import EndingScreen from './pages/candidate/EndingScreen';
import ResultsScreen from './pages/candidate/ResultsScreen';
import IdentityScreen2 from './pages/candidate/Game2/IdentityScreen2';
import TestScreen2 from './pages/candidate/Game2/TestScreen2';
import ResultsScreen2 from './pages/candidate/Game2/ResultsScreen2';
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
            href="/candidate" 
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
            Start Assessment
          </a>
          <a 
            href="/candidate/game2" 
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
            Game 2 Assessment
          </a>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  
  // Show header only on candidate identity screens
  const showHeader = location.pathname === '/candidate' || location.pathname === '/candidate/game2';

  return (
    <div className="app">
      {showHeader && <Header />}
      <Routes>
        {/* Main website landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Candidate routes */}
        <Route path="/candidate" element={<IdentityScreen />} />
        <Route path="/candidate/form" element={<FormScreen />} />
        <Route path="/candidate/test" element={<TestScreen />} />
        <Route path="/candidate/test/:questionNumber" element={<TestScreen />} />
        <Route path="/candidate/ending" element={<EndingScreen />} />
        <Route path="/candidate/results" element={<ResultsScreen />} />
        <Route path="/candidate/game2" element={<IdentityScreen2 />} />
        <Route path="/candidate/game2/test" element={<TestScreen2 />} />
        <Route path="/candidate/game2/results" element={<ResultsScreen2 />} />
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
