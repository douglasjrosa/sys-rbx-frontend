import { SelectMonth } from '@/components/painel/calendario/select/SelectMonth';
import { getAllDaysOfMonth } from '@/function/Datearray';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const Painel: React.FC = () => {
  const [date, setDate] = useState<number>();
  const [dateInicio, setDateInicio] = useState<any>(null);
  const [dateFim, setDateFim] = useState<Date | any>(null);
  const [calendar, setCalendar] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {

    const daysOfMonth = getAllDaysOfMonth(date);
    setCalendar(daysOfMonth.Dias);

    (async () => {
      if (daysOfMonth.DataFim && daysOfMonth.DataFim) {
      setIsLoading(true);
      await axios.get(`/api/db/business/get/calendar?DataIncicio=${daysOfMonth.DataFim}&DataFim=${daysOfMonth.DataFim}`)
        .then((Response) =>{
          console.log("🚀 ~ file: index.tsx:27 ~ .then ~ Response.data:", Response.data)
          setData(Response.data);
        })
        .catch((error)=> console.log(error))
    }
    })()

    console.log(daysOfMonth);
    console.log(daysOfMonth.Dias);
  }, [date]);

  function handleDateChange(month: number) {
    setDate(month);
  }

  const memoizedData = useMemo(() => ({
    calendar,
    data,
    isLoading,
    error,
  }), [calendar, data, isLoading, error]);

  return (
    <>
      <SelectMonth onValue={handleDateChange} />
      {/* Renderizar o restante do componente usando memoizedData */}
    </>
  );
};

export default Painel;
