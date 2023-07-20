import { primeiroNome } from "@/function/Mask/primeName";
import { Box, Button, Flex, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";



export const PessoasData = (props: { data: any; respData: any; respAtualizar: any }) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [dados, setDados] = useState<any>([]);


  if (props.data && dados.length === 0) {
    setDados(props.data)
  }

  return (
    <>

      <Box>
        <Flex flexDir={'row'} gap={3} p={1} px={2} bg={'messenger.500'} h={8} alignItems={'center'} rounded={5}>
          {primeiroNome(dados.nome)}
          <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            closeOnBlur={false}
            key={dados.id}
          >
            <PopoverTrigger>
              <IconButton
                p={0}
                colorScheme='messenger'
                aria-label='Call Sage'
                fontSize='25px'
                size={'xs'}
                icon={<IoMdClose />}

              />
            </PopoverTrigger>
            <Portal>
              <PopoverContent bg={'gray.600'}>
                <PopoverArrow bg={'gray.600'} />
                <PopoverHeader>{dados.nome}</PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody>
                  <Box>
                    {!!dados.email && <Text>Telefone: {dados.email},</Text>}
                    {!!dados.telefone && <Text>Telefone: {dados.telefone},</Text>}
                    {!!dados.whatsapp && <Text>Whatsapp: {dados.whatsapp},</Text>}
                    {!!dados.departamento && <Text>Departamento: {dados.departamento},</Text>}
                    {!!dados.Cargo && <Text>cargo: {dados.Cargo},</Text>}
                    {!!dados.obs && <Text mt={1}>Obs: {dados.obs},</Text>}
                  </Box>
                </PopoverBody>
                <PopoverFooter>
                  <Flex w={'full'} justifyContent={'end'} gap={5}>
                  <Button colorScheme='red' onClick={() => {
                    props.respData(dados.id)
                    onClose()
                  }}
                  >
                    Remover
                  </Button>
                  <Button colorScheme='green' onClick={() => {
                    props.respAtualizar(dados.id)
                    onClose()
                  }}
                  >
                    Atualizar
                  </Button>
                  </Flex>
                </PopoverFooter>
              </PopoverContent>
            </Portal>
          </Popover>
        </Flex>
      </Box>
    </>
  )
}
