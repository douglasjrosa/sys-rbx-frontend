import { useRouter } from "next/router";
import { Box, Button, Flex, FormLabel, Input, Select } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor";
import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente";


function Empresas() {
  const router = useRouter();
  const { data: session } = useSession();
  const [Data, setData] = useState<any | null>(null);
  const [DataUser, setDataUser] = useState<any | null>(null);
  const [SearchCNPJ, setSearchCNPJ] = useState<string>('')
  const [SearchEmpr, setSearchEmpr] = useState<string>('')


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

  const filterCnpj = async () => {
    setData(null)
    setDataUser(null)
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
      await fetch(`/api/db/empresas/search?CNPJ=${SearchCNPJ}`)
        .then((Response) => Response.json())
        .then((resposta: any) => {
          setData(resposta)
        })
        .catch((err) => console.log)
      await fetch(`/api/db/empresas/search?Vendedor=${session?.user.name}&CNPJ=${SearchCNPJ}`)
        .then((Response) => Response.json())
        .then((resposta: any) => setDataUser(resposta))
        .catch((err) => console.log)
    }
  };

  const filterEmpresa = async () => {
    setData(null)
    setDataUser(null)
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
      await fetch(`/api/db/empresas/search?EMPRESA=${SearchEmpr}`)
        .then((Response) => Response.json())
        .then((resposta: any) => setData(resposta))
        .catch((err) => console.log)
      await fetch(`/api/db/empresas/search?Vendedor=${session?.user.name}&EMPRESA=${SearchEmpr}`)
        .then((Response) => Response.json())
        .then((resposta: any) => setDataUser(resposta))
        .catch((err) => console.log)
    }
  };

  return (
    <>
      <Box w={'100%'} h={'100%'} bg={'gray.800'} color={'white'} px={5} py={2}>
        <Flex w={'100%'} h={'15%'} justifyContent={'space-between'} alignItems={'center'}>
          <Box>
            <FormLabel
              fontSize="xs"
              fontWeight="md"
            >
              Empresa
            </FormLabel>
            <Flex gap={5}>
              <Input
                type="text"
                borderColor="white"
                focusBorderColor="white"
                rounded="md"
                onChange={(e) => setSearchEmpr(e.target.value)}
                value={SearchEmpr}
              />
              <Button px={8} onClick={filterEmpresa} colorScheme="green">Filtro</Button>
            </Flex>
          </Box>
          <Box>
            <FormLabel
              fontSize="xs"
              fontWeight="md"
            >
              CNPJ
            </FormLabel>
            <Flex gap={5}>
              <Input
                type="text"
                borderColor="white"
                focusBorderColor="white"
                rounded="md"
                onChange={(e) => setSearchCNPJ(e.target.value)}
                value={SearchCNPJ}
              />
              <Button px={8} onClick={filterCnpj} colorScheme="green">Filtro</Button>
            </Flex>
          </Box>
          <Flex justifyContent={'center'} mt={'6'}>
            <Button onClick={() => router.push('/empresas/cadastro') } colorScheme="green">+ Nova Empresa</Button>
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
