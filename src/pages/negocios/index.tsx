import { Button } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';

function Negocios() {
  const [data, setData] = useState([])
  const consulta = async () => {
    const id = 15870204711
    const url2 = `/api/request/get/contatos/${id}`;

    await axios({
      method: 'GET',
      url: url2,
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => {
        console.log(response.data)
        const json = response.data
        const result = json.filter((iten: any) => iten.id === id)
        console.log(result[0])
      })
      .then((json) => console.log(json))
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Button onClick={consulta}>consulta</Button>
      ,<pre>{data}</pre>
    </>
  );
}

export default Negocios;
