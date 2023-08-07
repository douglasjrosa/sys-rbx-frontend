export const cleanString = (input: string, limit?: number): string => {
  const limitiCara = ! limit ? 11 : limit
  return input.replace(/\D/g, '').substring(0, limitiCara);
}

export const identifyDocumentType = (cleanValue: string): string => {
  return cleanValue.length <= 11 ? 'CPF' : 'CNPJ';
}

export const formatDocument = (cleanValue: string, type: string): string => {
  if (type === 'CPF') {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (type === 'CNPJ') {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  } else {
    return cleanValue;
  }
}
