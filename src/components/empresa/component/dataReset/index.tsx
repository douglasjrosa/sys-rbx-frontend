import { Box, Button, Flex, FormLabel, Select } from "@chakra-ui/react"
import axios from "axios";
import { useEffect, useState } from "react";



export const RestData = (props: { CNPJ: string, onRetorno: any }) => {
  const [Data, setData] = useState<any>([]);
  const [ID, setID] = useState('');


  useEffect(() => {
    (async () => {
      try {
        const response = await axios(`/api/db/empresas/ResetData?CNPJ=${props?.CNPJ}`);
        const dados = response.data;
        setData(dados);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    })()
  }, [props?.CNPJ])

  const salvar = () => {
    const [filter] = Data.filter((item: any) => {
      return item.id == ID
    })
    props.onRetorno(filter)
  }


  return (
    <>
      <Flex gap={3} alignItems={'flex-end'} flexWrap="wrap">
        <Box flex="1" minW="150px" w="full">
          <FormLabel
            htmlFor="frete"
            fontSize="xs"
            fontWeight="md"
            mb={1}
          >
            Historico de atualização
          </FormLabel>
          <Select

            focusBorderColor="#ffff"
            bg='#ffffff12'
            shadow="sm"
            size="xs"
            w="full"
            fontSize="xs"
            rounded="md"
            onChange={(e) => setID(e.target.value)}
          >
            <option style={{ backgroundColor: "#1A202C" }} value=""></option>
            {Data.map((item: any) => {

              const dataDb = item.attributes.data;
              const data = new Date(dataDb);
              const dataFinal = data.toLocaleString();
              return (
                <option key={item.id} style={{ backgroundColor: "#1A202C" }} value={item.id}>{dataFinal}</option>
              )
            })}
          </Select>
        </Box>
        <Button 
          colorScheme="green" 
          size="xs"
          px={4}
          whiteSpace="normal"
          height="auto"
          minH="24px"
          py={1}
          flexShrink={0}
          w={['full', 'auto']}
          onClick={salvar}
        >
          Recuperar
        </Button>
      </Flex>
    </>
  )
}
