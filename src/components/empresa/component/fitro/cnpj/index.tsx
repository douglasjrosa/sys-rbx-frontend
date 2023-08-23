import { cleanString, formatDocument } from "@/function/hookDocument"
import { Button, Flex, FormLabel, Input } from "@chakra-ui/react"
import { useEffect, useState } from "react"

export const FiltroCnpj = (props: { empresa: any, rrastreio: any}) => {
  const [SearchCNPJ, setSearchCNPJ] = useState<string>('')
  const [SearchCNPJMask, setSearchCNPJMask] = useState<string>('')

  const Pesqisa = () => {
    props.empresa(SearchCNPJ)
  }

  const getValue =(e: any) =>{
    const value = e.target.value
    const clear = cleanString(value, 14)
    const typeDoc = 'CNPJ'
    const mask = formatDocument(clear, typeDoc)
    setSearchCNPJ(clear)
    setSearchCNPJMask(mask)
  }

  useEffect(()=>{
    if(!SearchCNPJ){
      props.rrastreio(true)
    }
  }, [SearchCNPJ, props])

  return (
    <>
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
          onChange={getValue}
          value={SearchCNPJMask}
        />
        <Button px={8} onClick={Pesqisa} colorScheme="green">Filtro</Button>
      </Flex>
    </>
  )
}
