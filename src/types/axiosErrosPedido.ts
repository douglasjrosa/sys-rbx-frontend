export interface ApiErrorResponse {
  status: number;
  message: string;
  erro: string;
  detalhes: string;
}

export interface AxiosResponse {
  message: string;
  status: number;
  erro: any;
  detalhes: any;
}
