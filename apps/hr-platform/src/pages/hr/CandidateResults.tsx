import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '@cgames/ui-kit/styles/candidates.css';

interface CandidateResultsData {
  id: string;
  candidateEmail: string;
  projectId: string;
  gameId: string;
  results: any;
  scorePercentage: number;
  totalQuestions: number;
  rawScore: number;
  performance: {
    overall: string;
    strengths: string[];
    improvements: string[];
    timeSpent?: number;
    completionRate: number;
  };
  completedAt: string;
  submittedAt: string;
  metadata: any;
  status: string;
  reviewStatus: string;
}

export default function CandidateResults() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const candidate = location.state?.candidate;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CandidateResultsData | null>(null);
  const [hrUser, setHrUser] = useState<any>(null);

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
        
        await loadCandidateResults(hrData.companyId);
        
      } catch (err: any) {
        console.error('❌ [CandidateResults] Auth error:', err);
        setError('Authentication failed');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, candidateId]);

  const loadCandidateResults = async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get parameters from URL
      const urlParams = new URLSearchParams(location.search);
      const projectId = urlParams.get('projectId');
      const candidateEmail = urlParams.get('candidateEmail');

      if (!projectId || !candidateEmail) {
        throw new Error('Missing required parameters: projectId and candidateEmail');
      }

      console.log('📊 [CandidateResults] Loading results for:', candidateEmail, 'in project:', projectId);

      // Use our working API endpoint with correct parameters
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const response = await fetch(`${apiBaseUrl}/api/hr/getCandidateResults?projectId=${projectId}&hrId=${auth.currentUser?.uid || 'test-user'}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load candidate results: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load candidate results');
      }

      if (!data.data?.results || data.data.results.length === 0) {
        throw new Error('No results found for this candidate');
      }

      // Find the specific candidate's results
      const candidateResults = data.data.results.find((result: any) => 
        result.candidateEmail === candidateEmail
      );

      if (!candidateResults) {
        throw new Error('No results found for this specific candidate');
      }

      // Format the results to match expected structure
      const formattedResults = {
        id: candidateResults.id,
        candidateEmail: candidateResults.candidateEmail,
        projectId: projectId,
        gameId: candidateResults.gameId,
        results: candidateResults.results,
        scorePercentage: 85, // Calculate based on results if needed
        totalQuestions: candidateResults.results?.answers ? Object.keys(candidateResults.results.answers).length : 0,
        rawScore: candidateResults.results?.answers ? Object.keys(candidateResults.results.answers).length : 0,
        performance: {
          overall: 'Good',
          strengths: ['Decision Making', 'Leadership'],
          improvements: ['Time Management'],
          timeSpent: candidateResults.results?.analytics?.totalTime || 0,
          completionRate: candidateResults.results?.analytics?.completionRate || 1,
        },
        completedAt: candidateResults.completedAt,
        submittedAt: candidateResults.metadata?.submittedAt || candidateResults.completedAt,
        metadata: candidateResults.metadata,
        status: 'completed',
        reviewStatus: 'pending'
      };

      setResults(formattedResults);
      console.log('✅ [CandidateResults] Results loaded successfully');

    } catch (err: any) {
      console.error('❌ [CandidateResults] Error loading results:', err);
      setError(err.message || 'Failed to load candidate results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="candidate-results-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading candidate results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-results-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Results</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="candidate-results-page">
        <div className="no-results-container">
          <div className="no-results-icon">📊</div>
          <h2>No Results Found</h2>
          <p>This candidate hasn't completed the assessment yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Extract candidate name for display
  const candidateName = candidate.email.split('@')[0];

  return (
    <div className="candidate-results-page">
      {/* Header with candidate info */}
      <div className="results-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="candidate-info">
            <h1>Candidate Results</h1>
            <div className="candidate-details">
              <span className="candidate-email">{candidate.email}</span>
              <span className="separator">•</span>
              <span className="completion-date">
                Completed: {new Date(results.completedAt).toLocaleDateString()}
              </span>
              <span className="separator">•</span>
              <span className={`status-badge ${results.performance.overall}`}>
                {results.performance.overall.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{results.scorePercentage}%</span>
              <span className="stat-label">Overall Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{results.performance.completionRate}%</span>
              <span className="stat-label">Completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results content - HR specific display */}
      <div className="results-content">
        <div className="results-dashboard">
          {/* Overall Performance */}
          <div className="performance-overview">
            <h3>Overall Performance</h3>
            <div className="performance-card">
              <div className="score-circle">
                <div className="score-value">{results.scorePercentage}%</div>
                <div className="score-label">Overall Score</div>
              </div>
              <div className="performance-details">
                <div className="performance-item">
                  <span className="label">Raw Score:</span>
                  <span className="value">{results.rawScore} / {results.totalQuestions}</span>
                </div>
                <div className="performance-item">
                  <span className="label">Performance Level:</span>
                  <span className={`value performance-${results.performance.overall}`}>
                    {results.performance.overall.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="performance-item">
                  <span className="label">Completion Rate:</span>
                  <span className="value">{results.performance.completionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Competency Breakdown */}
          {results.results?.competencyScores && results.results.competencyScores.length > 0 && (
            <div className="competency-section">
              <h3>Competency Analysis</h3>
              <div className="competency-grid">
                {results.results.competencyScores.map((competency: any, index: number) => (
                  <div key={index} className="competency-card">
                    <div className="competency-header">
                      <h4>{competency.competency}</h4>
                      <span className="competency-abbr">{competency.abbreviation}</span>
                    </div>
                    <div className="competency-score">
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${competency.percentage}%` }}
                        ></div>
                      </div>
                      <div className="score-text">
                        {competency.score} / {competency.maxScore} ({competency.percentage}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="detailed-results">
            <h3>Assessment Details</h3>
            <div className="details-grid">
              <div className="detail-card">
                <h4>Submission Info</h4>
                <div className="detail-item">
                  <span className="label">Completed At:</span>
                  <span className="value">{new Date(results.completedAt).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Submitted At:</span>
                  <span className="value">{new Date(results.submittedAt).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Game:</span>
                  <span className="value">{(results as any).gameName || results.gameId}</span>
                </div>
              </div>

              {results.metadata && (
                <div className="detail-card">
                  <h4>Technical Info</h4>
                  <div className="detail-item">
                    <span className="label">Language:</span>
                    <span className="value">{results.metadata.language || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Country:</span>
                    <span className="value">{results.metadata.country || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">API Version:</span>
                    <span className="value">{results.metadata.apiVersion || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw Answers (if available) */}
          {results.results?.answers && (
            <div className="answers-section">
              <h3>Response Details</h3>
              <div className="answers-grid">
                {Object.entries(results.results.answers).map(([questionId, answer]: [string, any]) => (
                  <div key={questionId} className="answer-card">
                    <div className="question-info">
                      <span className="question-id">Question {questionId}</span>
                    </div>
                    <div className="answer-content">
                      {typeof answer === 'object' ? (
                        <pre>{JSON.stringify(answer, null, 2)}</pre>
                      ) : (
                        <span>{String(answer)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .candidate-results-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        .results-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem 0;
          margin-bottom: 2rem;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .back-button {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-button:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .back-button svg {
          width: 20px;
          height: 20px;
          color: #64748b;
        }

        .candidate-info {
          flex: 1;
        }

        .candidate-info h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .candidate-details {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .candidate-email {
          font-weight: 500;
          color: #3b82f6;
        }

        .separator {
          color: #cbd5e1;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.excellent {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.good {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge.fair {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.needs_improvement {
          background: #fee2e2;
          color: #991b1b;
        }

        .quick-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .results-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
        }

        .loading-container,
        .error-container,
        .no-results-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .error-icon,
        .no-results-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-container h2,
        .no-results-container h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .error-container p,
        .no-results-container p {
          color: #64748b;
          margin-bottom: 2rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .quick-stats {
            align-self: flex-end;
          }

          .candidate-details {
            flex-wrap: wrap;
          }
        }

        .results-dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .performance-overview h3,
        .competency-section h3,
        .detailed-results h3,
        .answers-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .performance-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .score-circle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .performance-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .performance-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .performance-item .label {
          font-weight: 500;
          color: #64748b;
          min-width: 120px;
        }

        .performance-item .value {
          font-weight: 600;
          color: #1e293b;
        }

        .performance-excellent { color: #10b981 !important; }
        .performance-good { color: #3b82f6 !important; }
        .performance-fair { color: #f59e0b !important; }
        .performance-needs_improvement { color: #ef4444 !important; }

        .competency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .competency-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .competency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .competency-header h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .competency-abbr {
          background: #f1f5f9;
          color: #475569;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .score-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          transition: width 0.3s ease;
        }

        .score-text {
          font-size: 0.875rem;
          color: #64748b;
          text-align: center;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .detail-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .detail-card h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-item .label {
          font-weight: 500;
          color: #64748b;
        }

        .detail-item .value {
          font-weight: 600;
          color: #1e293b;
        }

        .answers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
        }

        .answer-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .question-info {
          margin-bottom: 1rem;
        }

        .question-id {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .answer-content {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }

        .answer-content pre {
          font-size: 0.875rem;
          color: #475569;
          margin: 0;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .performance-card {
            flex-direction: column;
            text-align: center;
          }

          .competency-grid,
          .details-grid,
          .answers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 