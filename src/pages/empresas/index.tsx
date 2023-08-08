import Loading from "@/components/elements/loading";
import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente";
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor";
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa";
import { Box, Button, Flex, Heading, chakra, useToast } from "@chakra-ui/react";
import { GetServerSideProps, GetStaticProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


function Empresas({user,livre,interacoes}: any) {
  const router = useRouter();
  const { data: session } = useSession();
  const [DataSearch, setDataSearch] = useState<any | null>({ status: 0, data: [] });
  const [DataSearchUser, setDataSearchUser] = useState<any | null>({ status: 0, data: [] });
  const toast = useToast()

  function filterEmpresa(SearchEmpr: React.SetStateAction<any>) {
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
          duration: 9000,
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
                    render: () => (
                      <Box color='white' py={1} px={3} bg='yellow.600' textAlign={'center'} rounded={8}>
                        <chakra.p>{item.attributes.nome}</chakra.p>
                        <chakra.p>CNPJ: {item.attributes.CNPJ}</chakra.p>
                        <chakra.p> Carteira: {item.attributes.user.data?.attributes.username}</chakra.p>
                      </Box>
                    ),
                    status: 'warning',
                    duration: 9000,
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
                    duration: 9000,
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
        <Heading>Empresas</Heading>
        <Flex w={'100%'} py={'2rem'} justifyContent={'space-between'} flexDir={'row'} alignItems={'self-end'} px={6} gap={6} borderBottom={'1px'} borderColor={'white'} mb={'1rem'}>
          <Box>
            <FiltroEmpresa empresa={filterEmpresa} />
          </Box>
          <Button onClick={() => router.push('/empresas/cadastro')} colorScheme="green">+ Nova Empresa</Button>
        </Flex>
        <Box display={'flex'} flexDirection={{ base: 'column', lg: 'row' }} w={'100%'} h={'80%'} pt={5} gap={10} >
          <CarteiraVendedor filtro={DataSearchUser} />
          <CarteiraAusente filtro={DataSearch} />
        </Box>
      </Box>
    </>
  );
}

export default Empresas;
