import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
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
import { CompetencyScore } from '../types';

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
    <Container maxW="800px" py={8}>
      <VStack spacing={8}>
        <Heading>Sonuçlarınız, {user.firstName}</Heading>

        <Box w="100%" h="400px">
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
        </Box>

        <SimpleGrid columns={2} spacing={4} w="100%">
          {scores.map((score) => (
            <Box
              key={score.name}
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={score.color}
              color="white"
            >
              <Text fontWeight="bold">{score.name}</Text>
              <Text>Puan: {score.score}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Button colorScheme="blue" onClick={handleRestart}>
          Yeniden Başlat
        </Button>
      </VStack>
    </Container>
  );
};

export default ResultsScreen; 