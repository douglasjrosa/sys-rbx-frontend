import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  VStack,
  Divider,
  Text,
  Card,
  CardBody,
  Center,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Perfil() {
  const { data: session } = useSession();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast({
        title: 'As senhas não coincidem',
        description: 'Verifique se a nova senha e a confirmação são iguais.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);
    try {
      const data: any = { username: name, email };
      if (password) {
        data.password = password;
      }

      await axios.put(`/api/db/user/put/${session?.user?.id}`, data);

      toast({
        title: 'Perfil atualizado',
        description: 'Seus dados foram salvos com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.message || 'Ocorreu um erro ao salvar as alterações.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Box
      minH="100vh"
      w="full"
      bgImage="url('/img/porto-santos-1080x675.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
    >
      {/* Overlay para escurecer o fundo e melhorar o contraste */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={0}
      />

      <Center position="relative" zIndex={1} minH="100vh" py={12}>
        <Container maxW="container.sm">
          <VStack spacing={6} align="stretch">
            <Card
              variant="outline"
              bg="gray.800"
              borderColor="gray.700"
              shadow="2xl"
              borderRadius="xl"
              color="white"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  <Box textAlign="center" mb={2}>
                    <Heading size="xl" color="white" mb={2}>Perfil</Heading>
                    <Text color="gray.300">Gerencie suas informações e senha</Text>
                    <Divider mt={4} borderColor="gray.600" />
                  </Box>

                  <form onSubmit={handleSubmit}>
                    <Stack spacing={6}>
                      <FormControl isRequired>
                      <FormLabel fontWeight="bold" color="gray.300">Nome</FormLabel>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome de usuário"
                        variant="filled"
                        bg="gray.700"
                        border="none"
                        _hover={{ bg: "gray.600" }}
                        _focus={{ bg: "gray.600", borderColor: "blue.400" }}
                        color="white"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="bold" color="gray.300">E-mail</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        variant="filled"
                        bg="gray.700"
                        border="none"
                        _hover={{ bg: "gray.600" }}
                        _focus={{ bg: "gray.600", borderColor: "blue.400" }}
                        color="white"
                      />
                    </FormControl>

                    <Divider borderColor="gray.600" />

                    <Box>
                      <Text fontWeight="bold" mb={4} fontSize="lg" color="blue.300">
                        Alterar Senha
                      </Text>
                      <Stack spacing={4}>
                        <FormControl>
                          <FormLabel color="gray.300">Nova Senha</FormLabel>
                          <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Deixe vazio para não alterar"
                            variant="filled"
                            bg="gray.700"
                            border="none"
                            _hover={{ bg: "gray.600" }}
                            _focus={{ bg: "gray.600", borderColor: "blue.400" }}
                            color="white"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color="gray.300">Confirmar Nova Senha</FormLabel>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a nova senha"
                            variant="filled"
                            bg="gray.700"
                            border="none"
                            _hover={{ bg: "gray.600" }}
                            _focus={{ bg: "gray.600", borderColor: "blue.400" }}
                            color="white"
                          />
                        </FormControl>
                      </Stack>
                    </Box>

                    <Button
                      mt={4}
                      colorScheme="blue"
                      size="lg"
                      isLoading={loading}
                      type="submit"
                      width="full"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      Salvar Alterações
                    </Button>
                    </Stack>
                  </form>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Center>
    </Box>
  );
}

export default Perfil;
