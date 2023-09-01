import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente";
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor";
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa";
import { Box, Button, Flex, Heading, chakra, useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

/**
 * This function filters the list of empresas based on the given SearchEmpr parameter.
 *
 * @param {React.SetStateAction<any>} SearchEmpr - The value to filter the empresas list.
 * @return {AnyCnameRecord} This function does not return anything.
 */

function Empresas(): any {
  const router = useRouter();
  const { data: session } = useSession();
  const [DataSearch, setDataSearch] = useState<any | null>({ status: 0, data: [] });
  const [DataSearchUser, setDataSearchUser] = useState<any | null>({ status: 0, data: [] });
  const toast = useToast()

  function filterEmpresa(SearchEmpr: React.SetStateAction<any>): any {
    (async () => {
      const filtro = SearchEmpr.toLowerCase();
      const resultadouser: any = [];
      const resultado: any = [];
      const resultFilter = await fetch(`/api/db/empresas/search/empresa?EMPRESA=${filtro}`)
      const response = await resultFilter.json()
      if (response.length === 0 && filtro) {
        return toast({
          title: `Opa`,
          description: `A empresa ${filtro}, não se encontra em nosso registros`,
          status: 'success',
          duration: 2500,
          isClosable: true,
        })
      }
      response.forEach((item: any) => {
        const username = item.attributes.user.data?.attributes.username;
        if (session?.user.pemission === "Adm") {
          if (username === session?.user.name) {
            resultadouser.push(item);
          } else if (!username) {
            resultado.push(item);
          } else if (username) {

            if (username !== session?.user.name) {
              resultado.push(item);
              if (filtro) {
                if (session?.user.pemission !== "Adm") {
                  return toast({
                    render: (): any => (
                      <Box color='white' py={1} px={3} bg='yellow.600' textAlign={'center'} rounded={8}>
                        <chakra.p>{item.attributes.nome}</chakra.p>
                        <chakra.p>CNPJ: {item.attributes.CNPJ}</chakra.p>
                        <chakra.p> Carteira: {item.attributes.user.data?.attributes.username}</chakra.p>
                      </Box>
                    ),
                    status: 'warning',
                    duration: 2500,
                    isClosable: true,
                    position: 'top',
                  })
                }
              }
            }
          }
        } else {
          if (username === session?.user.name) {
            resultadouser.push(item);
          } else if (!username) {

            resultado.push(item);
          } else if (username) {
            if (username !== session?.user.name) {
              if (filtro) {
                if (session?.user.pemission !== "Adm") {
                  return toast({
                    render: () => (
                      <Box color='white' py={1} px={3} bg='yellow.600' textAlign={'center'} rounded={8}>
                        <chakra.p>{item.attributes.nome}</chakra.p>
                        <chakra.p>CNPJ: {item.attributes.CNPJ}</chakra.p>
                        <chakra.p> Carteira: {item.attributes.user.data?.attributes.username}</chakra.p>
                      </Box>
                    ),
                    status: 'warning',
                    duration: 2500,
                    isClosable: true,
                    position: 'top',
                  })
                }
              }
            }
          }
        }
      })

      if (filtro.length === 0) {
        setDataSearchUser({ status: 0, data: [] })
        setDataSearch({ status: 0, data: [] })
      } else {
        setDataSearchUser({ status: 1, data: resultadouser })
        setDataSearch({ status: 1, data: resultado })
      }
    })();
  };

  return (
    <>
      <Box w={'100%'} h={'100%'} bg={'gray.800'} color={'white'} px={5} py={2} fontSize={'0.8rem'}>
        <Heading size={'lg'}>Empresas</Heading>
        <Flex w={'100%'} py={'1rem'} justifyContent={'space-between'} flexDir={'row'} alignItems={'self-end'} px={6} gap={6} borderBottom={'1px'} borderColor={'white'} mb={'1rem'}>
          <Box>
            <FiltroEmpresa empresa={filterEmpresa} />
          </Box>
          <Button size={'sm'} onClick={() => router.push('/empresas/cadastro')} colorScheme="green">+ Nova Empresa</Button>
        </Flex>
        <Box display={'flex'} flexDirection={{ base: 'column', lg: 'row' }} w={'100%'} h={'76%'} pt={5} gap={5} >
          <CarteiraVendedor filtro={DataSearchUser} />
          <CarteiraAusente filtro={DataSearch} />
        </Box>
      </Box>
    </>
  );
}

export default Empresas;
