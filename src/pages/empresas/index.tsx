import { useRouter } from "next/router";
import { Box, Button, Flex, FormLabel, Input, Select, useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor";
import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente";
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa";
import { FiltroCnpj } from "@/components/empresa/component/fitro/cnpj";


function Empresas() {
  const router = useRouter();
  const { data: session } = useSession();
  const [Data, setData] = useState<any | null>(null);
  const [DataUser, setDataUser] = useState<any | null>(null);
  const toast = useToast()




  useEffect(() => {
    (async () => {
      await fetch("/api/db/empresas/getEmpresamin")
        .then((Response) => Response.json())
        .then((resposta: any) => setData(resposta))
        .catch((err) => console.log)
      await fetch(`/api/db/empresas/getEmpresamin?Vendedor=${session?.user.name}`)
        .then((Response) => Response.json())
        .then((resposta: any) => setDataUser(resposta))
        .catch((err) => console.log)
    })()
  }, [session?.user.name]);

  function filterCnpj(SearchCNPJ: React.SetStateAction<any>) {
    setData(null);
    setDataUser(null);
    (async () => {
      if (!SearchCNPJ) {
        await fetch("/api/db/empresas/getEmpresamin")
          .then((Response) => Response.json())
          .then((resposta: any) => setData(resposta))
          .catch((err) => console.log)
        await fetch(`/api/db/empresas/getEmpresamin?Vendedor=${session?.user.name}`)
          .then((Response) => Response.json())
          .then((resposta: any) => setDataUser(resposta))
          .catch((err) => console.log)
      } else {
        await fetch(`/api/db/empresas/search?CNPJ=${SearchCNPJ}&BUSCA=1`)
          .then((Response) => Response.json())
          .then((resposta: any) => {
            setData(resposta)
            const filtro = resposta.filter((i: any) => i.attributes.user.data.attributes.username !== session?.user.name)
            if(filtro.length > 0){
              const mapa = filtro.map((i: any) => {
                return toast({
                    title: `O clienete ${i.attributes.nome}`,
                    description: `pertence ao vendedor(a) ${i.attributes.user.data.attributes.username}`,
                    status: 'warning',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right',
                  })
              })
              return mapa
            }
          })
          .catch((err) => console.log)
        await fetch(`/api/db/empresas/search?Vendedor=${session?.user.name}&CNPJ=${SearchCNPJ}&BUSCA=1`)
          .then((Response) => Response.json())
          .then((resposta: any) => {
            setDataUser(resposta)
            const filtro = resposta.filter((i: any) => i.attributes.user.data.attributes.username !== session?.user.name)
            if(filtro.length > 0){
              const mapa = filtro.map((i: any) => {
                return toast({
                    title: `O clienete ${i.attributes.nome}`,
                    description: `pertence ao vendedor(a) ${i.attributes.user.data.attributes.username}`,
                    status: 'warning',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right',
                  })
              })
              return mapa
            }
          })
          .catch((err) => console.log)
      }

    })()
  };

  function filterEmpresa(SearchEmpr: React.SetStateAction<any>) {
    setData(null);
    setDataUser(null);
    (async () => {
      if (!SearchEmpr) {
        await fetch("/api/db/empresas/getEmpresamin")
          .then((Response) => Response.json())
          .then((resposta: any) => setData(resposta))
          .catch((err) => console.log)
        await fetch(`/api/db/empresas/getEmpresamin?Vendedor=${session?.user.name}`)
          .then((Response) => Response.json())
          .then((resposta: any) => setDataUser(resposta))
          .catch((err) => console.log)
      } else {
        await fetch(`/api/db/empresas/search?EMPRESA=${SearchEmpr}&BUSCA=1`)
          .then((Response) => Response.json())
        .then((resposta: any) => {
          setData(resposta)
          const filtro = resposta.filter((i: any) => i.attributes.user.data.attributes.username !== session?.user.name)
          if(filtro.length > 0){
            const mapa = filtro.map((i: any) => {
              return toast({
                	title: `O clienete ${i.attributes.nome}`,
                	description: `pertence ao vendedor(a) ${i.attributes.user.data.attributes.username}`,
                	status: 'warning',
                	duration: 9000,
                	isClosable: true,
                  position: 'top-right',
              	})
            })
            return mapa
          }
        })
          .catch((err) => console.log)
        await fetch(`/api/db/empresas/search?Vendedor=${session?.user.name}&EMPRESA=${SearchEmpr}&BUSCA=1`)
          .then((Response) => Response.json())
          .then((resposta: any) => {
            setDataUser(resposta)
            const filtro = resposta.filter((i: any) => i.attributes.user.data.attributes.username !== session?.user.name)
            if(filtro.length > 0){
              const mapa = filtro.map((i: any) => {
                return toast({
                    title: `O clienete ${i.attributes.nome}`,
                    description: `pertence ao vendedor(a) ${i.attributes.user.data.attributes.username}`,
                    status: 'warning',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right',
                  })
              })
              return mapa
            }
          })
          .catch((err) => console.log)
      }
    })()
  };

  return (
    <>
      <Box w={'100%'} h={'100%'} bg={'gray.800'} color={'white'} px={5} py={2}>
        <Flex w={'100%'} h={'15%'} justifyContent={'space-between'} alignItems={'center'}>
          <Box>
            <FiltroEmpresa empresa={filterEmpresa} />
          </Box>
          <Box>
            <FiltroCnpj empresa={filterCnpj} />
          </Box>
          <Flex justifyContent={'center'} mt={'6'}>
            <Button onClick={() => router.push('/empresas/cadastro')} colorScheme="green">+ Nova Empresa</Button>
          </Flex>
        </Flex>
        <Box display={'flex'} flexDirection={{ base: 'column', lg: 'row' }} w={'100%'} h={'85%'} gap={10}>
          <CarteiraVendedor data={DataUser} />
          <CarteiraAusente data={Data} />
        </Box>
      </Box>
    </>
  );
}

export default Empresas;
