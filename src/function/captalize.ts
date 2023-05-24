
export function capitalizeWords(str: string) {
  // Divide a string em um array de palavras
  var words = str.split(' ');

  // Itera por cada palavra no array
  for (var i = 0; i < words.length; i++) {
    // Converte a primeira letra da palavra para maiúscula e mantém o restante da palavra em minúscula
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }

  // Junta as palavras de volta em uma única string e retorna o resultado
  return words.join(' ');
}
