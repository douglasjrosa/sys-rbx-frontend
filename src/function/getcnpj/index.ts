import axios from "axios";

export const GetCnpj = async(CNPJ: string) => {
  let url = 'https://publica.cnpj.ws/cnpj/' + CNPJ;
  try {
    const request = await axios(url);
    const response = request.data;
    return response;

  } catch (error: any) {
      return error.response?.data.detalhes;
  }
}
