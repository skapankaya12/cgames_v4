import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IdentityScreen from './pages/IdentityScreen';
import TestScreen from './pages/TestScreen';
import ResultsScreen from './pages/ResultsScreen';
import './App.css';

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<IdentityScreen />} />
          <Route path="/test" element={<TestScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
