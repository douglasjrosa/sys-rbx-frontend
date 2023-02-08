import { NextApiRequest, NextApiResponse } from 'next';
import { GerarProposta } from './GerarProposta';
import { SaveProd } from './savePuduto';
import { VerifiqueProd } from './verifiqueproduto';

export default async function Get(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // const d = JSON.parse(req.body);
    const d = req.body;
    const vendedor = d.vendedor;
    const empresa = d.empresa;
    const DateContato = d.periodo;
    const Responsavel = d.responsavel;
    const verification: any = await VerifiqueProd(d.itens);
    const FilterNegative = verification.filter(
      (item: any) => item.db === false,
    );
    if (FilterNegative.length !== 0) {
      // salvar
      await SaveProd(FilterNegative);
    }
    const verification2: any = await VerifiqueProd(d.itens);
    const FilterPositve = verification.filter((item: any) => item.db === true);
    if (FilterPositve.length === d.itens.length) {
      //gerar Proposta
      const saveProposta = GerarProposta(
        verification2,
        vendedor,
        empresa,
        Responsavel,
        DateContato,
      );
    }
    return res.status(200).json(verification);
  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
