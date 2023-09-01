/* eslint-disable react-hooks/rules-of-hooks */
import { FormLabel, Select } from '@chakra-ui/react';
import { useState } from 'react';




export const selecMes: React.FC<any> = (prpos: { OnResposta: any }) => {

  const [selectedMonth, setSelectedMonth] = useState<any>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<any>(new Date().getFullYear());

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(event.target.value));
    updateDateRange(Number(event.target.value), selectedYear);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
    updateDateRange(selectedMonth, Number(event.target.value));
  };

  const updateDateRange = (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1, 3, 0, 0);
    const endDate = new Date(year, month, 0, 2, 59, 59);
    const retorno = {start: startDate.toISOString(), end: endDate.toISOString()}
    prpos.OnResposta(retorno);
  };

  return (
    <>
      <FormLabel
        htmlFor="cnpj"
        fontSize="xs"
        fontWeight="md"
        color="white"
      >
        Usuário
      </FormLabel>
      <Select
        w={'12rem'}
        value={selectedMonth}
        onChange={handleMonthChange}
        color="white"
        bg='gray.800'
      >
         <option value={1}>Janeiro</option>
        <option value={2}>Fevereiro</option>
        <option value={3}>Março</option>
        <option value={4}>Abril</option>
        <option value={5}>Maio</option>
        <option value={6}>Junho</option>
        <option value={7}>Julho</option>
        <option value={8}>Agosto</option>
        <option value={9}>Setembro</option>
        <option value={10}>Outubro</option>
        <option value={11}>Novembro</option>
        <option value={12}>Dezembro</option>
      </Select>
    </>
  );
};

