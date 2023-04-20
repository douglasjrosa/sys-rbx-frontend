import ejs from 'ejs'
import path from 'path';

export const generateHtml = (items: any[], data: any, pagina: number) => {
  const filePath = path.resolve(__dirname, '../../../');

  return ejs.renderFile('src/pages/api/db/proposta/pdf/lib/pdf.ejs', {
    nPedido: data.nPedido,
    frete: data.frete,
    datePop: data.datePop,
    fornecedor: data.fornecedor,
    cliente: data.cliente,
    itens: items,
    condi: data.condi,
    prazo: data.prazo,
    venc: data.venc,
    totoalGeral: data.totoalGeral,
    obs: data.obs,
    business: data.business,
    logo: data.logo,
    url: data.logo.url,
    pagina: pagina,
   });
}
