export interface DadosPessoais {
  id: number;
  attributes: {
    nome: string;
    CEP: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cpf: string;
    CPF: string;
    RG: string;
    whatsapp: string;
    telefone: string;
    email: string;
    pais: string;
    obs: string;
  }
}

export type ListaDeDadosPessoais = DadosPessoais[];
