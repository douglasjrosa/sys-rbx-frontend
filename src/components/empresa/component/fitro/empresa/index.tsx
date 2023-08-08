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
<<<<<<< HEAD
=======
          size={'sm'}
>>>>>>> 97b4a077b485d38a2a7219c0b16394ba608290aa
          borderColor="white"
          focusBorderColor="white"
          rounded="md"
          onChange={(e) => setSearchEmpr(e.target.value)}
          value={SearchEmpr}
        />
<<<<<<< HEAD
        <Button px={8} onClick={Pesqisa} colorScheme="green">Filtro</Button>
=======
        <Button px={8} size={'sm'} onClick={Pesqisa} colorScheme="green">Filtro</Button>
>>>>>>> 97b4a077b485d38a2a7219c0b16394ba608290aa
      </Flex>
    </>
  )
}
