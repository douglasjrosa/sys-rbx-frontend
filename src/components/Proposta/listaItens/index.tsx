/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Icon, Input, Tbody, Td, Tr } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BsTrash } from 'react-icons/bs';

export const ListaIten = (props: { id: any }) => {
  const [itens, setItens] = useState([]);
  const itenId = props.id;

  useEffect(() => {
    (async () => {
      const Emaillocal = localStorage.getItem('email');
      const Email = JSON.parse(Emaillocal);
      const url = '/api/query/get/produto/id/' + itenId;
      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(Email),
      })
        .then((resp) => resp.json())
        .then((resposta) => {
          if (itens.length !== 0) {
            console.log('tinha itens');
            const intero = [resposta, ...itens];
            setItens(intero);
          } else {
            console.log('nao tinha itens');
            setItens([resposta]);
          }
        })
        .catch((err) => console.log(err));
    })();
  }, []);

  const DelPrudutos = (Id: any) => {
    for (let i = 0; i < itens.length; i++) {
      if (itens[i].id === Id) {
        setitens.splice(i, 1);
      }
    }
  };
  return (
    <>
      {itens.map((item) => {
        const Id = item.prodId;
        const remove = () => {
          DelPrudutos(Id);
        };
        return (
          <>
            <Tbody>
              <Tr h={3} key={Id}>
                <Td px={3} py={2} isNumeric>
                  1
                </Td>
                <Td px={3} py={2} ps={8}>
                  {item.nomeProd}
                </Td>
                <Td px={2} py={2}>
                  <Input
                    type={'text'}
                    size="xs"
                    borderColor="whatsapp.600"
                    rounded="md"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                  />
                </Td>
                <Td px={2} py={2}>
                  <Input
                    type={'text'}
                    size="xs"
                    borderColor="whatsapp.600"
                    rounded="md"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                  />
                </Td>
                <Td px={2} py={2}>
                  <Input
                    type={'text'}
                    size="xs"
                    borderColor="whatsapp.600"
                    rounded="md"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                  />
                </Td>
                <Td textAlign={'center'}>25.4</Td>
                <Td px={2} py={2}>
                  <Input
                    type={'text'}
                    size="xs"
                    borderColor="whatsapp.600"
                    rounded="md"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                  />
                </Td>
                <Td px={2} py={2}>
                  <Input
                    type={'text'}
                    size="xs"
                    borderColor="whatsapp.600"
                    rounded="md"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                  />
                </Td>
                <Td>
                  <Input
                    type={'text'}
                    size="xs"
                    borderColor="whatsapp.600"
                    rounded="md"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                  />
                </Td>
                <Td>
                  <Button>
                    <BsTrash />
                  </Button>

                  <Icon
                    as={BsTrash}
                    boxSize={5}
                    color={'whatsapp.600'}
                    cursor="pointer"
                    onClick={remove}
                  />
                </Td>
              </Tr>
            </Tbody>
          </>
        );
      })}
    </>
  );
};
