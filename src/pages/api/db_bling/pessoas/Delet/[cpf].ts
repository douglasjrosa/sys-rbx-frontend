import { NextApiRequest, NextApiResponse } from 'next';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const token = process.env.ATORIZZATION_TOKEN_BLING;
    const CNPJ_CPF = req.query.cpf;
    const url = `https://bling.com.br/Api/v2/contato/${CNPJ_CPF}/json?apikey=${token}`;
    const ClienteIdetfic = await fetch(url);
    const RespCliente = await ClienteIdetfic.json();
    const ClienteId = RespCliente.retorno.contatos[0].contato.id;
    const Cliente = RespCliente.retorno.contatos[0].contato;
    console.log(Cliente);

    if (ClienteId !== '') {
      var formdata = new FormData();
      formdata.append('apikey', `${token}`);
      formdata.append(
        'xml',
        `<?xml version="1.0" encoding="UTF-8"?>\n<contato>\n   <nome>${Cliente.nome}</nome>\n   <fantasia>${Cliente.fantasia}</fantasia>\n   <tipoPessoa>F</tipoPessoa>\n   <contribuinte>9</contribuinte>\n   <cpf_cnpj>${Cliente.cnpj}</cpf_cnpj>\n   <ie_rg></ie_rg>\n   <endereco>${Cliente.endereco}</endereco>\n   <numero>${Cliente.numero}</numero>\n   <complemento>${Cliente.complemento}</complemento>\n   <bairro>${Cliente.bairro}</bairro>\n   <cep>${Cliente.cep}</cep>\n   <cidade>${Cliente.cidade}</cidade>\n   <uf>${Cliente.uf}</uf>\n   <fone>${Cliente.fone}</fone>\n   <celular>${Cliente.celular}</celular>\n   <email>${Cliente.email}</email>\n   <situacao>E</situacao>\n   <informacaoContato>Informações adicionais do contato</informacaoContato>\n   <limiteCredito></limiteCredito>\n   <paisOrigem>${Cliente.pais}</paisOrigem>\n</contato>`,
      );

      console.log(formdata);

      var requestOptions: any = {
        method: 'PUT',
        body: formdata,
        redirect: 'follow',
      };

      fetch(
        `https://bling.com.br/Api/v2/contato/${ClienteId}/json`,
        requestOptions,
      )
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          res.status(201).json(result);
        })
        .catch((error) => {
          console.log('error', error);
          res.status(400).send({ error: error });
        });
    } else {
      res.status(500).send('cliente não encotrado');
    }
  } else {
    return res.status(405).send({ message: 'Only PUT requests are allowed' });
  }
}
