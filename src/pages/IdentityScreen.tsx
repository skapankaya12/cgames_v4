import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Container,
  useToast,
} from '@chakra-ui/react';
import { User } from '../types';

const IdentityScreen = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState<User>({ firstName: '', lastName: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.firstName.trim() || !user.lastName.trim()) {
      toast({
        title: 'Hata',
        description: 'Lütfen adınızı ve soyadınızı giriniz.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    sessionStorage.setItem('user', JSON.stringify(user));
    navigate('/test');
  };

  return (
    <Container maxW="600px" py={8}>
      <VStack spacing={8}>
        <Heading>Hoş Geldiniz</Heading>
        <Box as="form" w="100%" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Adınız</FormLabel>
              <Input
                value={user.firstName}
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                placeholder="Adınızı giriniz"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Soyadınız</FormLabel>
              <Input
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                placeholder="Soyadınızı giriniz"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="100%"
              isDisabled={!user.firstName.trim() || !user.lastName.trim()}
            >
              Başla
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default IdentityScreen; 