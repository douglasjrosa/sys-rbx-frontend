import { primeiroNome } from "@/function/Mask/primeName";
import { Box, Button, Flex, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Text, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";



export const PessoasData = (props: { data: any; respData: any; respAtualizar: any }) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [dados, setDados] = useState<any>([]);
  const [ID, setID] = useState('');


  if (props.data && dados.length === 0) {
    setDados(props.data.attributes)
    setID(props.data.id)
  }

  const color =!dados.user.data? 'red.500' : 'messenger.500'
  const colorButton =!dados.user.data? 'red' : 'messenger'

  return (
    <>

      <Box>
        <Flex flexDir={'row'} gap={4} w={'auto'} p={1} px={2} bg={color} h={8} alignItems={'center'} rounded={5}>
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
                colorScheme={colorButton}
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
                    {!!dados.email && <Text>Email: {dados.email},</Text>}
                    {!!dados.telefone && <Text>Telefone: {dados.telefone},</Text>}
                    {!!dados.whatsapp && <Text>Whatsapp: {dados.whatsapp},</Text>}
                    {!!dados.departamento && <Text>Departamento: {dados.departamento},</Text>}
                    {!!dados.cargo && <Text>cargo: {dados.cargo},</Text>}
                    {!!dados.obs && <Text mt={1}>Obs: {dados.obs},</Text>}
                  </Box>
                </PopoverBody>
                <PopoverFooter>
                  <Flex w={'full'} justifyContent={'end'} gap={5}>
                  <Button colorScheme='red' onClick={() => {
                    props.respData(ID)
                    onClose()
                  }}
                  >
                    Remover
                  </Button>
                  <Button colorScheme='green' onClick={() => {
                    props.respAtualizar(props.data)
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
