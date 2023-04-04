import axios from 'axios';
import Cheerio from 'cheerio';

async function extrairInformacoesDaPagina() {
  const url = 'https://www.ribeiraopreto.sp.gov.br/portal/principal/feriados';
  const response = await axios.get(url);
  const html = response.data;

  const $ = Cheerio.load(html);
  const feriados = [];

  $('table tbody tr').each(function () {
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

extrairInformacoesDaPagina();
