/* eslint-disable no-undef */
import axios from 'axios';

export const VerifiqueProd = async (i: any) => {
  try {
    const results = [];
    for (let index = 0; index < i.length; index++) {
      const iten = i[index];
      const token = process.env.ATORIZZATION_TOKEN_BLING;
      const url = process.env.BLING_API_URL + `/produto/${iten.prodId}/json/`;
      const response = await axios({
        method: 'GET',
        url: url,
        params: {
          apikey: token,
        },
      });
      const Dbresp = response.data.retorno.erros ? false : true;
      const db = Dbresp;
      const item = iten;
      results.push({ ...item, db });
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return results;
  } catch (errors) {
    console.error(errors);
  }
};
