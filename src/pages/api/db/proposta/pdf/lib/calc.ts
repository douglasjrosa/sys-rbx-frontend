export const Calculadora = (data: any) => {
  // console.log('Data Calculadora', data.Desconto)
  //sem desconto
  if(data.Desconto === 'R$ 0,00' || data.Desconto === '0,00' || data.Desconto === '0.00'){
    // console.log('Data Calculadora', data.itens)
    const itens = data.itens

    const separados = {
      Mont: itens.filter((objeto: any) => objeto.mont && !objeto.expo),
      "Mont&Expo": itens.filter((objeto: any) => objeto.mont && objeto.expo),
      Expo: itens.filter((objeto: any) => !objeto.mont && objeto.expo),
      orig: itens.filter((objeto: any) => !objeto.mont && !objeto.expo)
    }

  }

  //com desconto
  return data
}
