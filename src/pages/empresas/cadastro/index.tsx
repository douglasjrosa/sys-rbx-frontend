import { useToast } from "@chakra-ui/react";
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
    const save = async (data: any) => {
      const EmpresasData = data

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

      const validateString = [
        { mudulo: EmpresasData.nome, valor: "Nome" },
        { mudulo: EmpresasData.CNPJ, valor: "cnpj" },
      ];
      const filter = validateString.filter((m) => m.mudulo === "");
      if (EmpresasData.tablecalc === "") {
        toast({
          title: `A Tabela de calculo deve ser definida`,
          status: "warning",
          duration: 2000,
        });
      }
      if (filter.length > 1) {
        const alert = filter.map((i) => {
          toast({
            title: `Favor verificar campo ${i.valor}`,
            status: "warning",
            duration: 2000,

          });
        });
        return alert;
      } else if (filter.length !== 0 && filter.length < 2) {
        await axios({
          method: 'POST',
          url: url,
          data: dataUpdate,
        })
          .then((response) => {
            toast({
              title: "Cliente criado com sucesso",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            router.push('/empresas');
            return response.data;
          })
          .catch((err) => console.error(err));
      }
    }
    save(DadosEnpresa)
  }

  return (
    <>
      <FormEmpresa retornoData={getData} />
    </>
  );
}
