import { Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const data = new Date();
const Mes = data.getMonth() + 1;

export const SelectMonth = (props: {
  onValue: any;
}) => {
  const [date, setDate] = useState<any>(Mes);

  const meses = [
    { id: 1, nome: `Janeiro de ${new Date().getFullYear()}` },
    { id: 2, nome: `Fevereiro de ${new Date().getFullYear()}` },
    { id: 3, nome: `Março de ${new Date().getFullYear()}` },
    { id: 4, nome: `Abril de ${new Date().getFullYear()}` },
    { id: 5, nome: `Maio de ${new Date().getFullYear()}` },
    { id: 6, nome: `Junho de ${new Date().getFullYear()}` },
    { id: 7, nome: `Julho de ${new Date().getFullYear()}` },
    { id: 8, nome: `Agosto de ${new Date().getFullYear()}` },
    { id: 9, nome: `Setembro de ${new Date().getFullYear()}` },
    { id: 10, nome: `Outubro de ${new Date().getFullYear()}` },
    { id: 11, nome: `Novembro de ${new Date().getFullYear()}` },
    { id: 12, nome: `Dezembro de ${new Date().getFullYear()}` }
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
