import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IdentityScreen from './pages/IdentityScreen';
import TestScreen from './pages/TestScreen';
import ResultsScreen from './pages/ResultsScreen';

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <Router>
        <Routes>
          <Route path="/" element={<IdentityScreen />} />
          <Route path="/test" element={<TestScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
