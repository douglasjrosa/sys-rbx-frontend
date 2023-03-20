/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const token = process.env.ATORIZZATION_TOKEN_RIBERMAX;
    const data = req.body;
    const Email = 'kingdever88@gmail.com';
    const cnpj = req.query.cnpj;
    console.log(cnpj);
    const url = process.env.RIBERMAX_API_URL + '/empresas/?CNPJ=' + cnpj;

    await fetch(url, {
      method: 'GET',
      headers: {
        Email: Email,
        Token: token,
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        console.log(json);
        const rep = json;
        const data = {
          data: {
            id: rep.id,
            attributes: {
              nome: rep.nome,
              fantasia: rep.xNome,
              tipoPessoa: 'CNPJ',
              endereco: rep.xLgr,
              numero: rep.nro,
              complemento: rep.xCpl,
              bairro: rep.xBairro,
              cep: rep.CEP.replace(/\W/g, ''),
              cidade: rep.xMun,
              uf: rep.UF,
              fone: rep.fone.replace(/\W/g, ''),
              celular: null,
              Ie: rep.IE.replace(/\W/g, ''),
              pais: rep.xPais,
              codpais: rep.cPais,
              CNAE: rep.CNAE,
              adFrailLat: rep.LatAdFrSN === 'off' ? false : true,
              adFrailCab: rep.CabAdFrSN === 'off' ? false : true,
              adEspecialLat: rep.LatAdExSN === 'off' ? false : true,
              adEspecialCab: rep.CabAdExSN === 'off' ? false : true,
              latFCab: rep.LatForaSN === 'off' ? false : true,
              cabChao: rep.CabChaoSN === 'off' ? false : true,
              cabTop: rep.CabTopoSN === 'off' ? false : true,
              cxEco: rep.caixa_economica === 'off' ? false : true,
              cxEst: rep.caixa_estruturada === 'off' ? false : true,
              cxLev: rep.caixa_leve === 'off' ? false : true,
              cxRef: rep.caixa_reforcada === 'off' ? false : true,
              cxSupRef: rep.caixa_super_reforcada === 'off' ? false : true,
              platSMed: rep.palete_sob_medida === 'off' ? false : true,
              cxResi: rep.caixa_resistente === 'off' ? false : true,
              engEco: rep.engradado_economico === 'off' ? false : true,
              engLev: rep.engradado_leve === 'off' ? false : true,
              engRef: rep.engradado_reforcado === 'off' ? false : true,
              engResi: rep.engradado_resistente === 'off' ? false : true,
              email: rep.email,
              tablecalc: rep.tabela,
              forpg: rep.formaPagto,
              frete: rep.frete,
              CNPJ: rep.CNPJ.replace(/\W/g, ''),
            },
          },
        };

        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
