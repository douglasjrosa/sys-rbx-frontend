
export function capitalizeWords(str: string): string {
  // Verifica se a string é nula ou indefinida
  if (str === null || str === undefined) {
    return ''; // Retorna uma string vazia ou faça o tratamento adequado ao caso
  }

  const str1 = str.toLowerCase();

  // Divide a string em um array de palavras, ignorando caracteres especiais e números
  const words = str1.split(/[^A-Za-z0-9]+/).filter(word => word !== '');

  // Itera por cada palavra no array
  for (let i = 0; i < words.length; i++) {
    // Converte a primeira letra da palavra para maiúscula e mantém o restante da palavra em minúscula
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }

  // Junta as palavras de volta em uma única string e retorna o resultado
  return words.join(' ');
}
