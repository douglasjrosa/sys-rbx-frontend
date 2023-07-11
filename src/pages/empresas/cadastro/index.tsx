import { Box, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { FormEmpresa } from "@/components/empresa/component/form";

export default function Cadastro() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast()

  function getData(DadosEnpresa: React.SetStateAction<any>) {
   (async()=>{
    const EmpresasData = DadosEnpresa
    console.log("🚀 ~ file: index.tsx:16 ~ EmpresasData:", EmpresasData)

    const date = new Date();
    const dateIsso = date.toISOString();
    const historico = [
      {
        date: dateIsso,
        vendedor: session?.user.name,
        msg: `Empresa ${EmpresasData.nome} foi cadastrado`,
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

    const url = `/api/db/empresas/post?Email=${session?.user.email}`;

    console.log("🚀 ~ file: index.tsx:85 ~ save ~ url:", dataUpdate)
      await axios({
        method: 'POST',
        url: url,
        data: dataUpdate,
      })
        .then((response) => {
          console.log(response)
          toast({
            title: "Cliente criado com sucesso",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          router.push('/empresas');
        })
        .catch((err) => console.error(err));
   })()
  }

  return (
    <>
    <Box w={'100%'} h={'100vh'} bg="gray.800">
      <FormEmpresa retornoData={getData} />
    </Box>
    </>
  );
}
