
export const getEscala = (medida, maxima) => {
    const max = maxima || 710;
    return max / medida;
}

export const escalar = (medida, escala, isPx) => {
    const medidaNova = Number(medida * escala).toFixed(1);
    return isPx ? Math.ceil(medidaNova).toString() + "px" : medidaNova;
}
