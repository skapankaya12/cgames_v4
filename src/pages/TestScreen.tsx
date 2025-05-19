import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { questions } from '../data/questions';
import { TestState } from '../types';

const TestScreen = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [testState, setTestState] = useState<TestState>({
    currentQuestion: 0,
    answers: {},
    isComplete: false,
  });
  const [showForwardingLine, setShowForwardingLine] = useState(false);

  const currentQuestion = questions[testState.currentQuestion];

  const handleAnswer = (value: string) => {
    setTestState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: value }
    }));
    setShowForwardingLine(true);
  };

  const handleNext = () => {
    if (testState.currentQuestion === questions.length - 1) {
      sessionStorage.setItem('answers', JSON.stringify(testState.answers));
      navigate('/results');
    } else {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
      setShowForwardingLine(false);
    }
  };

  const progress = ((testState.currentQuestion + 1) / questions.length) * 100;

  return (
    <Container maxW="600px" py={8}>
      <VStack spacing={8}>
        <Progress value={progress} w="100%" colorScheme="blue" />
        <Heading size="md">Soru {testState.currentQuestion + 1} / {questions.length}</Heading>
        
        <Box w="100%" p={6} borderWidth={1} borderRadius="lg">
          <VStack spacing={6} align="stretch">
            <Text fontSize="lg">{currentQuestion.text}</Text>
            
            <RadioGroup
              value={testState.answers[currentQuestion.id] || ''}
              onChange={handleAnswer}
            >
              <Stack spacing={4}>
                {currentQuestion.options.map(option => (
                  <Radio key={option.id} value={option.id}>
                    {option.text}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>

            {showForwardingLine && (
              <Box
                p={4}
                bg="blue.50"
                borderRadius="md"
                borderWidth={1}
                borderColor="blue.200"
              >
                <Text color="blue.700" fontStyle="italic">
                  {currentQuestion.forwardingLine}
                </Text>
              </Box>
            )}

            <Button
              colorScheme="blue"
              onClick={handleNext}
              isDisabled={!testState.answers[currentQuestion.id]}
            >
              {testState.currentQuestion === questions.length - 1 ? 'Bitir' : 'İlerle'}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default TestScreen; 