import { Button, Flex, FormLabel, Input } from "@chakra-ui/react"
import { useState } from "react"

export const FiltroCnpj = (props: { empresa: any }) => {
  const [SearchCNPJ, setSearchCNPJ] = useState<string>('')

  const Pesqisa = () => {
    props.empresa(SearchCNPJ)
  }

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
          onChange={(e) => setSearchCNPJ(e.target.value)}
          value={SearchCNPJ}
        />
        <Button px={8} onClick={Pesqisa} colorScheme="green">Filtro</Button>
      </Flex>
    </>
  )
}
