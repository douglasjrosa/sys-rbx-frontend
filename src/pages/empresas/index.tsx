import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente";
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor";
import { FiltroCnpj } from "@/components/empresa/component/fitro/cnpj";
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa";
import { formatDocument } from "@/function/hookDocument";
import { Box, Button, Flex, Heading, chakra, useToast } from "@chakra-ui/react";
import { cnpj } from 'cpf-cnpj-validator';
import { GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export const getStaticProps: GetStaticProps = async () => {
  try {
    const request = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=CNPJ&fields[2]=valor_ultima_compra&fields[3]=ultima_compra&populate=*&pagination[limit]=8000`,{
      headers: {
        Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const dados = await request.json();

    return {
      props: {
        dados,
      },
      revalidate: 5, // Regenerar a cada 60 segundos
    };
  } catch (error) {
    console.error("Erro ao buscar dados:", error);

    return {
      props: {
        dados: [],
      },
      revalidate: 5,
    };
  }
};


function Empresas({ dados }: any) {
  const router = useRouter();
  const { data: session } = useSession();
  const [Data, setData] = useState<any | null>(null);
  const [DataSearch, setDataSearch] = useState<any | null>(null);
  const [DataSearchUser, setDataSearchUser] = useState<any | null>(null);
  const [Text, setText] = useState<boolean>(true);
  const [OPen, setOPen] = useState<boolean>(true);
  const toast = useToast()




  useEffect(() => {
    (async () => {
      setData(dados.data)
      console.log("🚀 ~ file: index.tsx:59 ~ dados:", dados)
      const resultadouser: any = [];
      const resultado: any = [];
      dados.data.forEach((item: any) => {
        const username = item.attributes.user.data?.attributes.username;
        if (session?.user.pemission === "Adm") {
          if (username === session?.user.name) {
            resultadouser.push(item);
          } else if (!username) {
            resultado.push(item);
          } else if (username) {
            if (username !== session?.user.name) {
              resultado.push(item);
            }
          }
        } else {
          if (username === session?.user.name) {
            resultadouser.push(item);
          } else if (!username) {
            resultado.push(item);
          }
        }
      });
      setDataSearchUser(resultadouser)
      setDataSearch(resultado)
    })()
  }, [session?.user.name, session?.user.pemission, toast]);


  function filterCnpj(SearchCNPJ: React.SetStateAction<any>) {
    (async () => {
      const filtro = SearchCNPJ;
      const resultadouser: any = [];
      const resultado: any = [];
      const resultFilter = Data.filter(
        (item: any) =>
          item.attributes.CNPJ.includes(filtro)
      );

      const cnpjValid = cnpj.isValid(filtro);
      if (resultFilter.length === 0 && cnpjValid) {
        setText(false)
        setOPen(false)
        return toast({
          title: `Opa`,
          description: `O CNPJ ${formatDocument(filtro, 'CNPJ')}, não se encontra em nosso registros`,
          status: 'success',
          duration: 9000,
          isClosable: true,
        })
      }
      resultFilter.forEach((item: any) => {
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
            resultado.push(item);
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
      });
      setDataSearchUser(resultadouser)
      setDataSearch(resultado)
    })();
  };




  function filterEmpresa(SearchEmpr: React.SetStateAction<any>) {
    ((): any => {
      const filtro = SearchEmpr.toLowerCase();
      const resultadouser: any = [];
      const resultado: any = [];
      const resultFilter = Data.filter(
        (item: any) =>
          item.attributes.nome.toLowerCase().includes(filtro)
      );


      if (resultFilter.length === 0 && filtro) {
        return toast({
          title: `Opa`,
          description: `A empresa ${filtro}, não se encontra em nosso registros`,
          status: 'success',
          duration: 9000,
          isClosable: true,
        })
      }
      resultFilter.forEach((item: any) => {
        const username = item.attributes.user.data?.attribute.username;
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
      });
      setDataSearchUser(resultadouser)
      setDataSearch(resultado)
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
          <Box hidden>
            <FiltroCnpj empresa={filterCnpj} rrastreio={(resp: any) => {
              setOPen(resp)
              setText(resp)
            }} />
          </Box>
          <Button onClick={() => router.push('/empresas/cadastro')} colorScheme="green">+ Nova Empresa</Button>
        </Flex>
        <Box display={'flex'} flexDirection={{ base: 'column', lg: 'row' }} w={'100%'} h={'80%'} pt={5} gap={10} >
          <CarteiraVendedor data={DataSearchUser} />
          <CarteiraAusente data={DataSearch} />
        </Box>
      </Box>
    </>
  );
}

export default Empresas;
