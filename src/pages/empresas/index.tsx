import { useRouter } from "next/router";
import { Box, Button, Flex, FormLabel, Input, Select, Tooltip, useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor";
import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente";
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa";
import { FiltroCnpj } from "@/components/empresa/component/fitro/cnpj";
import { formatDocument } from "@/function/hookDocument";
import { cnpj } from 'cpf-cnpj-validator';


function Empresas() {
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
      await fetch("/api/db/empresas/getEmpresamin?EMPRESAS=true")
        .then((Response) => Response.json())
        .then((resposta: any) => {
          setData(resposta)
          const resultadouser: any = [];
          const resultado: any = [];
          resposta.forEach((item: any) => {
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
        })
        .catch((err) => console.log)
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
          description: `O CNPJ ${formatDocument(filtro, 'CNPJ')}, não se enconta em nosso registros`,
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
                return toast({
                  title: `O clienete ${item.attributes.nome}`,
                  description: `pertence ao vendedor(a) ${item.attributes.user.data?.attributes.username}`,
                  status: 'warning',
                  duration: 9000,
                  isClosable: true,
                  position: 'top-right',
                })
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
                return toast({
                  title: `O clienete ${item.attributes.nome}`,
                  description: `pertence ao vendedor(a) ${item.attributes.user.data?.attributes.username}`,
                  status: 'warning',
                  duration: 9000,
                  isClosable: true,
                  position: 'top-right',
                })
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
          description: `O CNPJ ${filtro}, não se enconta em nosso registros`,
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
                return toast({
                  title: `O clienete ${item.attributes.nome}`,
                  description: `pertence ao vendedor(a) ${item.attributes.user.data?.attributes.username}`,
                  status: 'warning',
                  duration: 9000,
                  isClosable: true,
                  position: 'top-right',
                })
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
                return toast({
                  title: `O clienete ${item.attributes.nome}`,
                  description: `pertence ao vendedor(a) ${item.attributes.user.data?.attributes.username}`,
                  status: 'warning',
                  duration: 9000,
                  isClosable: true,
                  position: 'top-right',
                })
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
      <Box w={'100%'} h={'100%'} bg={'gray.800'} color={'white'} px={5} py={2} >
        <Flex w={'100%'} py={5} pb={5} justifyContent={'space-between'} alignItems={'center'} px={6} gap={6}>
          <Flex justifyContent={'space-between'} gap={6}>
          <Box>
            <FiltroEmpresa empresa={filterEmpresa} />
          </Box>
          <Box>
            <FiltroCnpj empresa={filterCnpj} rrastreio={(resp: any)=> {
              setOPen(resp)
              setText(resp)
            }} />
          </Box>
          </Flex>
          <Flex justifyContent={'center'} mt={'5'} me={{ md: 2,lg:10}}>
            <Tooltip hasArrow label={Text ? 'Antes de cadastar, verifique se o CNPJ da empresa se enconta em nosso registros': ''} bg='red.600' isOpen={OPen}>
              <Button isDisabled={OPen} onClick={() => router.push('/empresas/cadastro')} colorScheme="green">+ Nova Empresa</Button>
            </Tooltip>
          </Flex>
        </Flex>
        <Box display={'flex'} flexDirection={{ base: 'column', lg: 'row' }} w={'100%'} h={'85%'} pt={5} gap={10} >
          <CarteiraVendedor data={DataSearchUser} />
          <CarteiraAusente data={DataSearch} />
        </Box>
      </Box>
    </>
  );
}

export default Empresas;
