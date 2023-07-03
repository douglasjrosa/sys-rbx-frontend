import { Button, Flex, FormLabel, Input } from "@chakra-ui/react"
import { useState } from "react"

export const FiltroEmpresa = (props: { empresa: any }) => {
  const [SearchEmpr, setSearchEmpr] = useState<string>('')

  const Pesqisa = () =>{
    props.empresa(SearchEmpr)
  }

  return (
    <>
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
        <Button px={8} onClick={Pesqisa} colorScheme="green">Filtro</Button>
      </Flex>
    </>
  )
}
