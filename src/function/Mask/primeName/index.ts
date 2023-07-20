export const primeiroNome = (frase: string): string  => {
  if(!frase) return ''
  const indiceEspaco = frase.indexOf(' ');
  if (indiceEspaco === -1) {
    return frase; // Se não houver espaço na string, retorna a string inteira
  } else {
    return frase.substring(0, indiceEspaco);
  }
}
