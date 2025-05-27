import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import IdentityScreen from './pages/IdentityScreen';
import FormScreen from './pages/FormScreen';
import TestScreen from './pages/TestScreen';
import EndingScreen from './pages/EndingScreen';
import ResultsScreen from './pages/ResultsScreen';
import IdentityScreen2 from './pages/Game2/IdentityScreen2';
import TestScreen2 from './pages/Game2/TestScreen2';
import ResultsScreen2 from './pages/Game2/ResultsScreen2';
import './App.css';

function AppContent() {
  const location = useLocation();
  
  // Show header only on identity screens
  const showHeader = location.pathname === '/' || location.pathname === '/game2';

  return (
    <div className="app">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<IdentityScreen />} />
        <Route path="/form" element={<FormScreen />} />
        <Route path="/test" element={<TestScreen />} />
        <Route path="/ending" element={<EndingScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/game2" element={<IdentityScreen2 />} />
        <Route path="/game2/test" element={<TestScreen2 />} />
        <Route path="/game2/results" element={<ResultsScreen2 />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
