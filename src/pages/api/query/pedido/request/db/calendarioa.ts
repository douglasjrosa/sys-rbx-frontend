import axios from 'axios';
import Cheerio from 'cheerio';

export async function extrairInformacoesDaPagina(): Promise<any[]> {
  const url = 'https://www.ribeiraopreto.sp.gov.br/portal/principal/feriados';
  const response = await axios.get(url);
  const html = response.data;

  const $ = Cheerio.load(html);
  const feriados: any[] = [];

  $('table tbody tr').each(function(this: typeof Cheerio) {
    const feriado = {
      data: $(this).find('td:nth-child(1)').text(),
      descricao: $(this).find('td:nth-child(2)').text(),
      Feriado: $(this).find('td:nth-child(3)').text(),
    };
    feriados.push(feriado);
  });

  console.log(feriados);
  return feriados;
}

