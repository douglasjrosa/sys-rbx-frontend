import { generatePastAndFutureMonths } from '@/function/dateselect';
import { Box, Button, Flex, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';


export const SelectMonth = (props: {
  onValue?: any;
}) => {
  const [date, setDate] = useState<any>(13);
  const [Object, setObject] = useState<any>();

  useEffect(() => {
    setObject(generatePastAndFutureMonths())
  }, [])

  const HandleClick = () =>{
    if (Object) {
      const [filtro] = Object.filter((item: any) => item.id === date)
      props.onValue(filtro);
    }
  }

  return (
    <>
      <Flex gap={3} flexDir={'row'} alignItems={'flex-end'}>
        <Box>
          <FormLabel
            htmlFor="cnpj"
            fontSize="xs"
            fontWeight="md"
            color="white"
          >
            Mes
          </FormLabel>
          <Select
            w={'12rem'}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setDate(value);
              // props.onValue(value);
            }}
            value={date}
          >
            {!!Object && Object.map((i: any) => {

              return (
                <option style={{ backgroundColor: "#1A202C", color: '#fffff' }} key={i.id} value={i.id}>
                  {i.name}
                </option>
              )
            })}
          </Select>
        </Box>
        <Box>
          <Button colorScheme='whatsapp' variant={'solid'} onClick={HandleClick}>Busca</Button>
        </Box>
      </Flex>
    </>
  );
};
