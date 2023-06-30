import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  chakra,
  useToast,
} from "@chakra-ui/react";
import { memo, useEffect, useMemo, useState } from "react";
import { BtCreate } from "../../components/negocios/component/butonCreate";
import { PowerBi } from "@/components/negocios/bi";
import { getAllDaysOfMonth } from "@/function/Datearray";
import axios from "axios";
import { useSession } from "next-auth/react";
import { mask, unMask } from "remask";


function SetUser() {
  const [Setor, setSetor] = useState('')
  const [Nome, setNome] = useState('')
  const [Senha, setSenha] = useState('')
  const [SenhaA, setSenhaA] = useState('')
  const [ReSenha, setReSenha] = useState('')
  const { data: session } = useSession()
  const toast = useToast()

  useEffect(() => {
    (async () => {
      try {
        const response = await axios(`/api/db/user/get?username=${session?.user.name}`)
        console.log("🚀 ~ file: index.tsx:37 ~ useEffect ~ response:", response.data)
        const [resposta] = response.data
        const { username, setor } = resposta
        setNome(username)
        setSetor(setor)
      } catch (error: any) {
        console.log(error)
      }
    })()
  }, [session?.user.name])


  const salvar = async () => {
    if (Senha === ReSenha) {
      const data = {
        data: {
          passwordAtual: SenhaA,
          password: Senha,
          setor: Setor,
          nome: Nome,
          primeiro_acesso: false,
        }
      }
      await axios(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/auth/change-password`,
        {
          method: "POST",
          data: {
            identifier: session?.user.name,
            password: data.data.passwordAtual,
            currentPassword: data.data.password,
            passwordConfirmation: data.data.password,
          },
          headers: {
            Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          console.log(
            "🚀 ~ file: [id].ts:49 ~ .then ~ response.data:",
            response.data
          );
        })
        .catch((error) => {
          console.log("🚀 ~ file: [id].ts:53 ~ error:", error.response);
        });

      await axios(`/api/db/user/put/${session?.user.id}`, {
        method: 'PUT',
        data: data,
      })
        .then((resposnse: any) => console.log(resposnse.data))
        .catch((error: any) => console.log(error))
    } else {
      toast({
        title: "A senha de ser igual",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  return (
    <>
      <Box display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        w={'100%'}
        h={'100%'}
        bg="#f5f8cc"
      >
        <Box
          p={10}
        >
          <Box>
            <Flex justifyContent={'center'} alignContent={'center'}>
              <SimpleGrid display={{ base: "initial", md: "grid" }}>
                <GridItem>
                  <Box mt={[10, 0]}>
                    <SimpleGrid
                      display={{
                        base: "initial",
                        md: "grid",
                      }}
                      columns={{
                        md: 3,
                      }}
                      spacing={{
                        md: 6,
                      }}
                    >
                      <GridItem
                        colSpan={{
                          md: 1,
                        }}
                      >
                        <Box px={[4, 0]}>
                          <Heading fontSize="lg" fontWeight="medium" lineHeight="6">
                            Dados pessoais
                          </Heading>
                          <Text
                            mt={1}
                            fontSize="sm"
                            color="gray.600"
                            w={'340px'}
                          >
                            Como éssa é sua primeira vez aqui, por segurança precisamos trocar su senha, e algumas informaçôes.
                          </Text>
                        </Box>
                      </GridItem>
                      <GridItem
                        mt={[5, null, 0]}
                        colSpan={{
                          md: 2,
                        }}
                      >
                        <chakra.form
                          method="POST"
                          shadow="base"
                          rounded={[null, "md"]}
                          overflow={{
                            sm: "hidden",
                          }}
                        >
                          <Stack
                            px={4}
                            py={5}
                            p={[null, 6]}
                            bg="white"
                            spacing={6}
                          >
                            <SimpleGrid columns={6} spacing={6}>
                              <FormControl as={GridItem} colSpan={[6]}>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="md"
                                  color="gray.700"
                                >
                                  Nome completo
                                </FormLabel>
                                <Input
                                  type="text"
                                  mt={1}
                                  focusBorderColor="brand.400"
                                  shadow="sm"
                                  size="sm"
                                  w="full"
                                  rounded="md"
                                  value={Nome}
                                  onChange={(e) => setNome(e.target.value)}
                                />
                              </FormControl>



                              <FormControl as={GridItem} colSpan={[6, 4]}>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="md"
                                  color="gray.700"
                                >
                                  senha Atual
                                </FormLabel>
                                <Input
                                  type="password"
                                  mt={1}
                                  focusBorderColor="brand.400"
                                  shadow="sm"
                                  size="sm"
                                  w="full"
                                  rounded="md"
                                  value={SenhaA}
                                  onChange={(e) => setSenhaA(e.target.value)}
                                />
                              </FormControl>

                              <FormControl as={GridItem} colSpan={[6, 3]}>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="md"
                                  color="gray.700"
                                >
                                  senha
                                </FormLabel>
                                <Input
                                  type="password"
                                  mt={1}
                                  focusBorderColor="brand.400"
                                  shadow="sm"
                                  size="sm"
                                  w="full"
                                  rounded="md"
                                  value={Senha}
                                  onChange={(e) => setSenha(e.target.value)}
                                />
                              </FormControl>

                              <FormControl as={GridItem} colSpan={[6, 3]}>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="md"
                                  color="gray.700"
                                >
                                  repetir senha
                                </FormLabel>
                                <Input
                                  type="password"
                                  mt={1}
                                  focusBorderColor="brand.400"
                                  shadow="sm"
                                  size="sm"
                                  w="full"
                                  rounded="md"
                                  value={ReSenha}
                                  onChange={(e) => setReSenha(e.target.value)}
                                />
                              </FormControl>

                              <FormControl as={GridItem} colSpan={[6, 3]}>
                                <FormLabel
                                  htmlFor="country"
                                  fontSize="sm"
                                  fontWeight="md"
                                  color="gray.700"
                                >
                                  Setor
                                </FormLabel>
                                <Select
                                  placeholder="Selecione um setor"
                                  mt={1}
                                  focusBorderColor="brand.400"
                                  shadow="sm"
                                  size="sm"
                                  w="full"
                                  rounded="md"
                                  value={Setor}
                                  onChange={(e) => setSetor(e.target.value)}
                                >
                                  <option value={'Administração'}>Administração</option>
                                  <option value={'Ti'}>T.I</option>
                                  <option value={'Vendas'}>Vendas</option>
                                  <option value={'Expedição'}>Expedição</option>
                                </Select>
                              </FormControl>

                            </SimpleGrid>
                          </Stack>
                          <Box
                            px={{
                              base: 4,
                              sm: 6,
                            }}
                            py={3}
                            bg="gray.50"
                            textAlign="right"
                          >
                            <Button
                              colorScheme="whatsapp"
                              _focus={{
                                shadow: "",
                              }}
                              fontWeight="md"
                              onClick={salvar}
                            >
                              Save
                            </Button>
                          </Box>
                        </chakra.form>
                      </GridItem>
                    </SimpleGrid>
                  </Box>
                </GridItem>
              </SimpleGrid>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default memo(SetUser)
