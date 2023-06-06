import { Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const data = new Date();
const Mes = data.getMonth() + 1;

export const SelectMonth = (props: {
  onValue: any;
}) => {
  const [date, setDate] = useState<any>(Mes);

  const meses = [
    { id: 1, nome: 'Janeiro' },
    { id: 2, nome: 'Fevereiro' },
    { id: 3, nome: 'Março' },
    { id: 4, nome: 'Abril' },
    { id: 5, nome: 'Maio' },
    { id: 6, nome: 'Junho' },
    { id: 7, nome: 'Julho' },
    { id: 8, nome: 'Agosto' },
    { id: 9, nome: 'Setembro' },
    { id: 10, nome: 'Outubro' },
    { id: 11, nome: 'Novembro' },
    { id: 12, nome: 'Dezembro' }
  ];

  useEffect(() => {
    props.onValue(date);
  }, [date, props]);

  return (
    <>
      <Select
        w={'10rem'}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          setDate(value);
          props.onValue(value);
        }}
        value={date}
      >
        {meses.map((i) => (
          <option key={i.id} value={i.id}>
            {i.nome}
          </option>
        ))}
      </Select>
    </>
  );
};
