import Economica from "../components/box-models/economica";

const Produtos = () => {
    const caixa = {
        info: {
            caixaNome: "Cadeira Fodona",
            caixaModelo: "Econômica"
        },
        medidas: {
            sarrafoLarg: 3,
            sarrafoEsp: 1.8,
            tabuaLarg: 10,
            tabuaEsp: 1.8,
            chapaComp: 220,
            chapaLarg: 160,
            chapaEsp: 0.3,
            caixaComp: 100,
            caixaLarg: 86,
            caixaAlt: 155
        }
    };

    return <Economica caixa={caixa} />
};

export default Produtos;
