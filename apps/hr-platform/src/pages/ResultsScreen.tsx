
import { SharedResultsScreen } from './shared/ResultsScreen';

/**
 * ResultsScreen wrapper component that uses the shared implementation
 * This eliminates code duplication between different result screen instances
 */
const ResultsScreen = () => {
  return <SharedResultsScreen />;
};

export default ResultsScreen; 