import Loading from "@/components/elements/loading";
import { FormPessoa } from "@/components/pessoas/form";
import {
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";


export default function Cadastro() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setloading]  = useState(false);
  const toast = useToast();

  function getData(DadosPessoas: React.SetStateAction<any>) {
    setloading(true)
    const save = async (data: any) => {
      const pessoas = data

      const url = "/api/db/pessoas/Post";

      const date = new Date();
      const dateIsso = date.toISOString();
      const historico = {
        date: dateIsso,
        vendedor: session?.user.name,
        msg: `cinete ${pessoas.nome} foi cadastrado`,
      };

      const dataUpdate = {
        data: {
          nome: pessoas.nome,
          whatsapp: pessoas.whatsapp,
          telefone: pessoas.telefone,
          email: pessoas.email,
          CPF: pessoas.CPF,
          CEP: pessoas.cep,
          uf: pessoas.uf,
          user: session?.user.id,
          endereco: pessoas.endereco,
          numero: pessoas.numero,
          bairro: pessoas.bairro,
          cidade: pessoas.cidade,
          obs: pessoas.obs,
          status: pessoas.status,
          empresas: pessoas.empresas,
          history: [historico],
          departamento: pessoas.departamento,
          cargo: pessoas.cargo,
          complemento: pessoas.complemento,
        },
      };


      if (!pessoas.nome) {
        toast({
          title: "Como devemos chamar esse cliente",
          description: "Obrigatorio o nome do cliente!",
          status: "warning",
          duration: 6000,
          isClosable: true,
        });
      } else {
        await axios({
          method: "POST",
          url: url,
          data: dataUpdate,
        })
          .then((response) => {
            toast({
              title: "salvo",
              description: "Cliente salvo",
              status: "success",
              duration: 6000,
              position: "top-right",
            });
            setTimeout(() => {
              setloading(false)
              router.back()
            }, 100);
          })
          .catch((err) => {
            setloading(false)
            console.log(err);
          });
      }
    }
    save(DadosPessoas)
  }

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  return (
    <>
      <FormPessoa retornaData={getData} />
    </>
  );
}
