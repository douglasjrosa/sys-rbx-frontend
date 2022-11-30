import type { NextApiRequest, NextApiResponse } from 'next';
import { XMLBuilder, XMLValidator } from 'fast-xml-parser';
import axios from 'axios';

export default async function ContatoPost(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const UrlBase: string = process.env.BLING_API_URL;
  const key: string = process.env.BLING_KEY_API;
  const IdCliente = req.query;
  if (req.method === 'PUT') {
    const getClinet = req.body;

    const jsonBild = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      contato: {
        nome: getClinet.data.nome,
        fantasia: getClinet.data.fantasia,
        tipoPessoa: 'J',
        contribuinte: 9,
        cpf_cnpj: getClinet.data.CNPJ,
        ie_rg: getClinet.data.Ie,
        endereco: getClinet.data.endereco,
        numero: parseInt(getClinet.data.numero),
        complemento: getClinet.data.complemento,
        bairro: getClinet.data.bairro,
        cep: getClinet.data.cep,
        cidade: getClinet.data.cidade,
        uf: getClinet.data.uf,
        fone: getClinet.data.fone,
        celular: getClinet.data.celular,
        email: getClinet.data.email,
        emailNfe: getClinet.data.emailNfe,
        informacaoContato: '',
        limiteCredito: '',
      },
    };

    const builder = new XMLBuilder({
      processEntities: false,
      format: true,
      ignoreAttributes: false,
    });
    const data = builder.build(jsonBild);
    const validador = XMLValidator.validate(data, {
      unpairedTags: ['extra'],
    });

    if (validador === true) {
      const url = UrlBase + `/contato/${IdCliente}`;
      const response = await axios({
        method: 'PUT',
        url: url,
        params: {
          apikey: key,
        },
        data: data,
      });
      return res.status(200).json(response.data);
    } else {
      console.log('verifiqu o xml');
      res.status(500).send('verifiqu o xml');
    }
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
