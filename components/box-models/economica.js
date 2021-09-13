import {Component} from "react";
import {QuadroH, Canvas} from "../drawing-elements/quadro";
import {getEscala} from "../../utils/rbx";
import { Input, Button, FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import { Formik, Field, Form } from 'formik';

class Economica extends Component{

    state = {caixa: this.props.caixa};

    constructor(props){
        super(props);
    }

    render(){

        const {
            caixaComp,
            caixaAlt,
            sarrafoLarg,
            chapaEsp
        } = this.props.caixa.medidas;

        const tela = Math.min(((innerWidth - 17) * 0.9), 700);
        const escala = getEscala(caixaComp, tela );

        const handleSubmit = (event) => {
            event.preventDefault();
            console.log(event.target);
            //this.setState(caixa.medidas.caixaComp: 0);
        };

        return (
            <>
                <Formik
                    initialValues={{
                        caixaComp: undefined,
                        caixaLarg: undefined,
                        caixaAlt: undefined
                    }}
                    onSubmit={async (values) => {
                        await new Promise((r) => setTimeout(r, 500));
                        const caixa = this.state.caixa;
                        if(caixa.medidas.caixaComp !== values.caixaComp) caixa.medidas.caixaComp = values.caixaComp;
                        if(caixa.medidas.caixaLarg !== values.caixaLarg) caixa.medidas.caixaLarg = values.caixaLarg;
                        if(caixa.medidas.caixaAlt !== values.caixaAlt) caixa.medidas.caixaAlt = values.caixaAlt;
                        this.setState({caixa: caixa});
                        console.log(this.state)
                    }}
                >
                    <Form>
                        <Field name="caixaComp" >
                            {({ field, form }) => (
                            <FormControl>
                                <FormLabel htmlFor="caixaComp">Comprimento</FormLabel>
                                <Input {...field} id="caixaComp" placeholder="156" />
                                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                            </FormControl>
                            )}
                        </Field>
                        <Field name="caixaLarg" >
                            {({ field, form }) => (
                            <FormControl>
                                <FormLabel htmlFor="caixaLarg">Largura</FormLabel>
                                <Input {...field} id="caixaLarg" placeholder="56" />
                                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                            </FormControl>
                            )}
                        </Field>
                        <Field name="caixaAlt" >
                            {({ field, form }) => (
                            <FormControl>
                                <FormLabel htmlFor="caixaAlt">Altura</FormLabel>
                                <Input {...field} id="caixaAlt" placeholder="66" />
                                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                            </FormControl>
                            )}
                        </Field>

                        <Button type="submit">Calcular</Button>
                    </Form>
                </Formik>
                
                <Canvas>
                    <QuadroH
                        escala={escala}
                        comp={caixaComp}
                        alt={caixaAlt}
                        sarrafoLarg={sarrafoLarg}
                        chapa={chapaEsp}
                    />
                </Canvas>
            </>
        );
    }

    componentDidMount(){
        console.log(this.state)
    }
}

export default Economica;