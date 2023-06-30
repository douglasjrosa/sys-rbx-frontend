import { FormLabel, Select, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const SelectEmpresas = (props: {
  onValue: any; Usuario: any;
}) => {
  const [date, setDate] = useState<any>(null);
  const [Data, setData] = useState<any>([]);
  const { data: session } = useSession();
  const toast = useToast()

  useEffect(() => {
    if (props.Usuario) {
      (async () => {
        localStorage.setItem('Usuario', props.Usuario)
        await axios.get(`/api/db/empresas/getEmpresamin?Vendedor=${props.Usuario}`)
          .then((resp) => {
            setData(resp.data)
          })
          .catch((err) => console.log(err))
      })()
    }
  }, [props.Usuario, session?.user.name]);

  const HandleValue = (e: any) => {
    const value = parseInt(e.target.value);
    setDate(value)
    const [filer] = Data.filter((i: any) => i.id === value).map((iten: any) => {
      const negocio = iten.attributes.businesses.data;
      if (negocio.length === 0) {
        setTimeout(() => {
          setDate(0)
          toast({
            title: "Cliente não tem negocios iniciado",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }, 500)
      }
      const id = iten.id;
      const nome = iten.attributes.nome
      const [array] = negocio.map((N: any) => [
        {
          "id": N.id,
          "attributes": {
            "deadline": N.attributes?.deadline,
            "nBusiness": N.attributes?.nBusiness,
            "Budget": N.attributes?.Budget,
            "Approach": N.attributes?.Approach,
            "empresa": {
              "data": {
                "id": id,
                "attributes": {
                  "nome": nome
                }
              }
            },
            "history": N.attributes?.history,
            "incidentRecord": N.attributes?.incidentRecord,
            "status": N.attributes?.status,
            "createdAt": N.attributes?.createdAt,
            "updatedAt": N.attributes?.updatedAt,
            "publishedAt": N.attributes?.publishedAt,
            "DataRetorno": N.attributes?.DataRetorno,
            "stausPedido": N.attributes?.stausPedido,
            "Bpedido": N.attributes?.Bpedido,
            "etapa": N.attributes?.etapa,
            "andamento": N.attributes?.andamento,
            "Mperca": N.attributes?.Mperca,
            "date_conclucao": N.attributes?.date_conclucao
          }
        }
      ])

      return !!negocio && array;
    });
    props.onValue(filer)
  }

  return (
    <>
      <FormLabel
        htmlFor="cnpj"
        fontSize="xs"
        fontWeight="md"
        color="white"
      >
        Empresa
      </FormLabel>
      <Select
        w={'20rem'}
        onChange={HandleValue}
        value={date}
        isDisabled={session?.user.pemission !== 'Adm'}
        color="white"
        bg='gray.800'
      >
        <option style={{ backgroundColor: "#1A202C" }} value={0}>EMPRESAS RELACIONADAS</option>
        {Data.map((i: any) => {
          return (
            <option style={{ backgroundColor: "#1A202C" }} key={i.id} value={i.id}>
              {i.attributes.nome}
            </option>
          )
        })}
      </Select>
    </>
  );
};
