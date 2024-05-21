import { ErroPHP } from "@/pages/api/lib/erroPHP";
import axios from "axios";

const PHP = axios.create({
  baseURL: process.env.RIBERMAX_API_URL,
  headers: {
    Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
    Email: process.env.ATORIZZATION_EMAIL,
  },
});

export  const PostLoteRibermmax =async (nPedido:string) => {
  const loteRequest  = await axios({
    url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos?populate=*&filters[nPedido][$eq]=${nPedido}`,
    headers: {
      Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  const lote = loteRequest.data.data;

  const items = lote;
  const promessas = [];

  for (const i of items) {
    const formData = new FormData();
    formData.append("cliente[CNPJ]", i.attributes.CNPJClinet);
    formData.append("emitente[CNPJ]", i.attributes.CNPJEmitente);
    formData.append("idProduto", i.attributes.produtosId);
    formData.append("nLote", i.attributes.lote);
    formData.append("qtde", i.attributes.qtde);

    const promessa = PHP.post("/lotes", formData)
      .then( (response) => {

        return {
          msg: response.data.message,
          lote: response.data.lotes,
        };
      })
      .catch( async (error: any) => {
        const data = {
          log: {
            "cliente[CNPJ]": i.attributes.CNPJClinet,
            "emitente[CNPJ]": i.attributes.CNPJEmitente,
            idProduto: i.attributes.produtosId,
            nLote: i.attributes.lote,
            qtde: i.attributes.qtde,
            pedido: nPedido,
            error: error,
          },
        };
        return await ErroPHP(data);
      });

    promessas.push(promessa);
  }
  const resposta = await Promise.all(promessas);
  return resposta;
}
