import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Play from './pages/candidate/Play';
import IdentityScreen from './pages/candidate/IdentityScreen';
import FormScreen from './pages/candidate/FormScreen';
import TestScreen from './pages/candidate/TestScreen';
import EndingScreen from './pages/candidate/EndingScreen';
import ResultsScreen from './pages/candidate/ResultsScreen';
import IdentityScreen2 from './pages/candidate/Game2/IdentityScreen2';
import TestScreen2 from './pages/candidate/Game2/TestScreen2';
import ResultsScreen2 from './pages/candidate/Game2/ResultsScreen2';
import './App.css';

// Simple header component to replace @cgames/ui-kit Header
function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>BokumunKuşu Assessment</h1>
      </div>
    </header>
  );
}

// Placeholder Landing Page Component
function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Welcome to BokumunKuşu</h1>
        <p>Advanced Leadership Assessment Platform</p>
        <div className="landing-buttons">
          <a href="/candidate" className="landing-button">
            Start Assessment
          </a>
          <a href="/candidate/game2" className="landing-button secondary">
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
        
        {/* Play route for invite tokens */}
        <Route path="/play" element={<Play />} />
        
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
