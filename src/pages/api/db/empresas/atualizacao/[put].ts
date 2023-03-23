/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'PUT') {
    const id = req.query.put;
    const token = process.env.ATORIZZATION_TOKEN;
    const data = req.body;
    const cnpj = data.data.CNPJ;
    const bodyData = data.data;

    await axios({
      method: 'PUT',
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/empresas/' + id,
      data: data,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((Response) => {
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error.details,
        });
      });

    const DataRbx = {
      nome: bodyData.nome as string,
      email: bodyData.email as string,
      xNome: bodyData.fantasia as string,
      CNPJ: bodyData.CNPJ as string,
      IE: bodyData.Ie as string,
      IM: '',
      fone: bodyData.cidade as string,
      indIEDest: '',
      CNAE: bodyData.CNAE as string,
      xLgr: bodyData.endereco as string,
      nro: bodyData.numero as string,
      xCpl: bodyData.complemento as string,
      cMun: '',
      cPais: bodyData.codpais as string,
      xPais: bodyData.pais as string,
      xBairro: bodyData.bairro as string,
      CEP: bodyData.cep as string,
      xMun: bodyData.cidade as string,
      UF: bodyData.uf as string,
      ativo: bodyData.status !== true ? '' : ('1' as string),
      tabela: bodyData.tablecalc as string,
      ultima_compra: '',
      LatAdFrSN: bodyData.adFrailLat === true ? '1' : ('' as string),
      CabAdFrSN: bodyData.adFrailCab === true ? '1' : ('' as string),
      LatAdExSN: bodyData.adEspecialLat === true ? '1' : ('' as string),
      CabAdExSN: bodyData.adEspecialCab === true ? '1' : ('' as string),
      assDuplo: '',
      LatForaSN: bodyData.latFCab === true ? '1' : ('' as string),
      CabChaoSN: bodyData.cabChao === true ? '1' : ('' as string),
      autoMail: '',
      caixa_economica: bodyData.cxEco === true ? '1' : ('' as string),
      caixa_estruturada: bodyData.cxEst === true ? '1' : ('' as string),
      caixa_leve: bodyData.cxLev === true ? '1' : ('' as string),
      caixa_reforcada: bodyData.cxRef === true ? '1' : ('' as string),
      caixa_resistente: bodyData.cxResi === true ? '1' : ('' as string),
      caixa_super_reforcada: bodyData.cxSupRef === true ? '1' : ('' as string),
      engradado_economico: bodyData.engEco === true ? '1' : ('' as string),
      engradado_leve: bodyData.engLev === true ? '1' : ('' as string),
      engradado_reforcado: bodyData.engRef === true ? '1' : ('' as string),
      engradado_resistente: bodyData.engResi === true ? '1' : ('' as string),
      palete_sob_medida: bodyData.platSMed === true ? '1' : ('' as string),
      sarrafos_sob_medida: '',
      formaPagto: bodyData.forpg as string,
      prefPagto: bodyData.maxPg as string,
      frete: bodyData.frete === '' ? 'fob' : (bodyData.frete as string),
    };

    await axios({
      method: 'put',
      url: process.env.RIBERMAX_API_URL + '/empresas?CNPJ=' + cnpj,
      headers: {
        Email: process.env.ATORIZZATION_EMAIL,
        Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams(DataRbx).toString(),
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
