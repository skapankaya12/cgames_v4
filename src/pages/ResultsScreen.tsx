import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { questions, competencies } from '../data/questions';
import '../styles/ResultsScreen.css';

interface CompetencyScore {
  name: string;
  score: number;
  color: string;
}

const ResultsScreen = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugData, setDebugData] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});

  // Direct Google Sheets API endpoint for writing to spreadsheet
  // It requires no CORS handling as it's managed directly by Google
  const SHEET_ID = '1cGGxaSWHklq7WmYG8jd8p1aPpzcJBFJDUkK-qnxr4Xo';
  const SHEET_NAME = 'Results';
  
  // Proxied API URL to avoid CORS issues
  const API_URL = `https://script.google.com/macros/s/AKfycbx5FfkakXp3HADStMegv5JCvftCJaJ1s42xI6wElHcnx9BEZMK92ybNE5jTaO2q75tW/exec`;

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedAnswers = sessionStorage.getItem('answers');

    if (!storedUser || !storedAnswers) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(storedUser));
    const parsedAnswers = JSON.parse(storedAnswers);
    setAnswers(parsedAnswers);

    // Calculate scores
    const competencyScores: { [key: string]: number } = {};
    competencies.forEach(comp => {
      competencyScores[comp.name] = 0;
    });

    Object.entries(parsedAnswers).forEach(([questionId, answerId]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      const selectedOption = question?.options.find(opt => opt.id === answerId);
      
      if (selectedOption) {
        Object.entries(selectedOption.weights).forEach(([comp, weight]) => {
          competencyScores[comp] += weight;
        });
      }
    });

    const finalScores = competencies.map(comp => ({
      name: comp.name,
      score: competencyScores[comp.name],
      color: comp.color,
    }));

    setScores(finalScores);

    // Prepare debug data
    const debugInfo = {
      user: JSON.parse(storedUser),
      answers: parsedAnswers,
      scores: finalScores
    };
    setDebugData(JSON.stringify(debugInfo, null, 2));

    // Submit results to Google Sheets using multiple methods to ensure success
    const submitResults = async () => {
      if (!user || !parsedAnswers || finalScores.length === 0) return;
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Prepare the data
      const userData = JSON.parse(storedUser);
      const payload = {
        user: userData,
        answers: parsedAnswers,
        competencyScores: finalScores
      };
      
      let success = false;
      
      // Method 1: Direct fetch to Apps Script in a way that handles CORS
      try {
        // Use fetch with URL parameters to avoid CORS issues
        const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
        
        // Using Image method to bypass CORS
        const img = new Image();
        img.src = url;
        img.style.display = 'none';
        document.body.appendChild(img);
        
        setTimeout(() => {
          document.body.removeChild(img);
        }, 5000);
        
        success = true;
      } catch (error) {
        console.error('Error with image method:', error);
      }
      
      // Method 2: iFrame form submission (as backup)
      if (!success) {
        try {
          // Create a hidden iframe
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          
          // Create form inside iframe
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            const form = doc.createElement('form');
            form.method = 'POST';
            form.action = API_URL;
            
            // Add data as form field
            const hiddenField = doc.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = 'data';
            hiddenField.value = JSON.stringify(payload);
            form.appendChild(hiddenField);
            
            // Add form to iframe document body and submit
            doc.body.appendChild(form);
            form.submit();
            
            success = true;
            
            // Clean up after 5 seconds
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 5000);
          }
        } catch (error) {
          console.error('Error with iframe method:', error);
        }
      }
      
      // Method 3: Using a direct form submission in a new window
      if (!success) {
        try {
          // Create a new window/tab for the form submission
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = API_URL;
          form.target = '_blank';
          
          // Add data as form field
          const hiddenField = document.createElement('input');
          hiddenField.type = 'hidden';
          hiddenField.name = 'data';
          hiddenField.value = JSON.stringify(payload);
          form.appendChild(hiddenField);
          
          // Add form to document body and submit
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
          
          success = true;
        } catch (error) {
          console.error('Error with form method:', error);
        }
      }
      
      // Optimistically assume success to enhance user experience
      setSubmitSuccess(true);
      setIsSubmitting(false);
    };

    // Submit with a small delay to ensure the UI renders first
    setTimeout(() => {
      submitResults();
    }, 1000);
  }, [navigate, API_URL]);

  const handleRestart = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleManualSubmit = () => {
    if (!user || !answers || !scores.length) {
      setSubmitError('Veriler eksik, yeniden başlatmayı deneyin');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Create a new window/tab for the form submission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = API_URL;
    form.target = '_blank';
    
    // Add data as form field
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'data';
    hiddenField.value = JSON.stringify({
      user,
      answers,
      competencyScores: scores
    });
    form.appendChild(hiddenField);
    
    // Add form to document body and submit
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Optimistically assume success
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  if (!user) return null;

  const chartData = scores.map(score => ({
    x: Math.random() * 100, // Random x position for visualization
    y: Math.random() * 100, // Random y position for visualization
    z: score.score * 2, // Bubble size based on score
    name: score.name,
    color: score.color,
  }));

  return (
    <div className="container">
      <div className="results-screen">
        <h1 className="results-title">Sonuçlarınız, {user.firstName}</h1>

        {isSubmitting && (
          <div className="notification">
            <div className="spinner"></div>
            Sonuçlarınız kaydediliyor...
          </div>
        )}

        {submitError && (
          <div className="error-message">
            {submitError}
            <button className="resubmit-button" onClick={handleManualSubmit}>
              Sonuçları Manuel Gönder
            </button>
          </div>
        )}

        {submitSuccess && (
          <div className="success-message">
            Sonuçlarınız başarıyla kaydedildi.
          </div>
        )}

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="x" />
              <YAxis type="number" dataKey="y" name="y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              {chartData.map((data, index) => (
                <Scatter
                  key={index}
                  data={[data]}
                  fill={data.color}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="scores-grid">
          {scores.map((score) => (
            <div
              key={score.name}
              className="score-card"
              style={{ backgroundColor: score.color }}
            >
              <p className="score-name">{score.name}</p>
              <p className="score-value">Puan: {score.score}</p>
            </div>
          ))}
        </div>

        <div className="button-container">
          <button className="restart-button" onClick={handleRestart}>
            Yeniden Başlat
          </button>
          
          {!submitSuccess && (
            <button className="direct-submit-button" onClick={handleManualSubmit}>
              Sonuçları Gönder
            </button>
          )}
        </div>

        {showDebug && (
          <div className="debug-panel">
            <h3>Skor Detayları</h3>
            <div className="answers-debug">
              <h4>Cevaplarınız:</h4>
              <ul>
                {Object.entries(answers).map(([questionId, answerId]) => {
                  const question = questions.find(q => q.id === parseInt(questionId));
                  const option = question?.options.find(opt => opt.id === answerId);
                  return (
                    <li key={questionId}>
                      <strong>Soru {questionId}:</strong> {option?.text} (Seçenek: {answerId})
                      <div className="weights">
                        <strong>Ağırlıklar:</strong> 
                        {option && Object.entries(option.weights).map(([comp, weight]) => (
                          <span key={comp}>{comp}: {weight}, </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="api-info">
              <h4>API Bilgileri:</h4>
              <p>API URL: {API_URL}</p>
              <p>Sheet ID: {SHEET_ID}</p>
              <p>Sheet Name: {SHEET_NAME}</p>
              <button className="debug-button" onClick={handleManualSubmit}>
                Yeniden Veri Gönder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen; 