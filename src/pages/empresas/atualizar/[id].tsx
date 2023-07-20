/* eslint-disable react-hooks/exhaustive-deps */
import Loading from '@/components/elements/loading';
import { FormEmpresa } from '@/components/empresa/component/form';
import { Box, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function EmpresaId() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setloading] = useState(false);
  const [DataEmp, setDataEmp] = useState<any | null>(null);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const id = router.query.id;
      setloading(true)
      const url = `/api/db/empresas/getId/${id}`;
      const response = await axios(url);
      const empresa = await response.data.data;
      setDataEmp(empresa)
      setloading(false);
    })()
  }, []);

  useEffect(() => {
    var index = 0
    if (index == 0) {
      if (DataEmp) {
        if (DataEmp?.attributes.user.data?.attributes.username) {
          if (DataEmp?.attributes.user.data?.attributes.username !== session?.user.name) {
            if (session?.user.pemission !== 'Adm') {
              toast({
                title: `O clienete ${DataEmp?.attributes.nome}`,
                description: `pertence ao vendedor(a) ${DataEmp?.attributes.user.data?.attributes.username}`,
                status: 'warning',
                duration: 9000,
                isClosable: true,
                position: 'top-right',
              })
              index = index + 1
            }
          }
        }
      }
    }
  }, [DataEmp])

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }


  return (
    <>
      <Box w={'100%'} h={'100vh'} bg="gray.800">
        <FormEmpresa envio='UPDATE' data={DataEmp} />
      </Box>
    </>
  );
}
