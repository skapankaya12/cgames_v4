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

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedAnswers = sessionStorage.getItem('answers');

    if (!storedUser || !storedAnswers) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(storedUser));
    const answers = JSON.parse(storedAnswers);

    // Calculate scores
    const competencyScores: { [key: string]: number } = {};
    competencies.forEach(comp => {
      competencyScores[comp.name] = 0;
    });

    Object.entries(answers).forEach(([questionId, answerId]) => {
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
  }, [navigate]);

  const handleRestart = () => {
    sessionStorage.clear();
    navigate('/');
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

        <button className="restart-button" onClick={handleRestart}>
          Yeniden Başlat
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen; 