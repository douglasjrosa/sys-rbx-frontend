/* eslint-disable react-hooks/exhaustive-deps */
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Loading from '@/components/elements/loading';
import { FormEmpresa } from '@/components/empresa/component/form';

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


  function getData(DadosEnpresa: React.SetStateAction<any>) {
    const save = async (data: any) => {
      const EmpresasData = data
      const EMPRESAID = router.query.id;

      const date = new Date();
      const dateIsso = date.toISOString();
      const historico = [
        {
          date: dateIsso,
          vendedor: session?.user.name,
          msg: `Empresa ${EmpresasData.nome} foi atualizado`,
        },
      ];

      const dataUpdate = {
        data: {
          nome: EmpresasData.nome,
          fantasia: EmpresasData.fantasia,
          tipoPessoa: EmpresasData.tipoPessoa,
          endereco: EmpresasData.endereco,
          numero: EmpresasData.numero,
          complemento: EmpresasData.complemento,
          bairro: EmpresasData.bairro,
          cep: EmpresasData.cep,
          cidade: EmpresasData.cidade,
          uf: EmpresasData.uf,
          fone: EmpresasData.fone,
          celular: EmpresasData.celular,
          email: EmpresasData.email,
          emailNfe: EmpresasData.emailNfe,
          site: EmpresasData.site,
          CNPJ: EmpresasData.CNPJ,
          Ie: EmpresasData.Ie,
          pais: EmpresasData.pais,
          codpais: EmpresasData.codpais,
          CNAE: EmpresasData.CNAE,
          porte: EmpresasData.porte,
          simples: EmpresasData.simples,
          ieStatus: EmpresasData.ieStatus,
          status: EmpresasData.status,
          adFrailLat: EmpresasData.adFrailLat,
          adFrailCab: EmpresasData.adFrailCab,
          adEspecialLat: EmpresasData.adEspecialLat,
          adEspecialCab: EmpresasData.adEspecialCab,
          latFCab: EmpresasData.latFCab,
          cabChao: EmpresasData.cabChao,
          cabTop: EmpresasData.cabTop,
          cxEco: EmpresasData.cxEco,
          cxEst: EmpresasData.cxEst,
          cxLev: EmpresasData.cxLev,
          cxRef: EmpresasData.cxRef,
          cxSupRef: EmpresasData.cxSupRef,
          platSMed: EmpresasData.platSMed,
          cxResi: EmpresasData.cxResi,
          engEco: EmpresasData.engEco,
          engLev: EmpresasData.engLev,
          engRef: EmpresasData.engRef,
          engResi: EmpresasData.engResi,
          tablecalc: EmpresasData.tablecalc,
          maxPg: EmpresasData.maxPg,
          forpg: EmpresasData.forpg,
          frete: EmpresasData.frete,
          contribuinte: EmpresasData.contribuinte,
          responsavel: EmpresasData.Responsavel,
          history: historico,
          inativOk: EmpresasData.Inatividade,
          razao: EmpresasData.razao
        },
      };

      const url = '/api/db/empresas/atualizacao/' + EMPRESAID;

      await axios({
        method: 'PUT',
        url: url,
        data: dataUpdate,
      })
        .then((response) => {
          toast({
            title: 'Cliente atualizado',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
          router.push('/empresas');
          return response.data;
        })
        .catch((err) => console.log(err));
    }
    save(DadosEnpresa)
  }

  useEffect(() => {
    var index = 0
    if(index == 0){
      if(DataEmp){
        if (DataEmp?.attributes.user.data?.attributes.username !== session?.user.name) {
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
  }, [DataEmp])

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }


  return (
    <>
      <FormEmpresa data={DataEmp} retornoData={getData} />
    </>
  );
}
