import { Component } from 'react';
import { QuadroH, Canvas } from '../components/drawing-elements/quadro';
import { getEscala } from '../../utils/rbx';
import {
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Formik, Field, Form } from 'formik';

class Orcamentos extends Component {
  state = {
    caixa: {
      info: {
        caixaNome: 'Cadeira Fodona',
        caixaModelo: 'Econômica',
        isExp: true,
      },
      medidas: {
        sarrafoLarg: 6,
        sarrafoEsp: 1.8,
        tabuaLarg: 10,
        tabuaEsp: 1.8,
        chapaComp: 220,
        chapaLarg: 160,
        chapaEsp: 0.3,
        caixaComp: 155,
        caixaLarg: 55,
        caixaAlt: 55,
        latQtde: 2,
        cabQtde: 2,
        tampaQtde: 1,
        baseQtde: 1,
      },
    },
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { caixaComp, caixaAlt, sarrafoLarg, chapaEsp, latQtde, sarrafoEsp } =
      this.state.caixa.medidas;

    const tela = Math.min((innerWidth - 17) * 0.9, 700);
    const escala = getEscala(caixaComp, 0.3 * tela);

    return (
      <VStack px="5%">
        <HStack mb="5%">
          <Formik
            initialValues={{
              caixaComp: undefined,
              caixaLarg: undefined,
              caixaAlt: undefined,
            }}
            onSubmit={async (values) => {
              await new Promise((r) => setTimeout(r, 500));
              const caixa = this.state.caixa;
              if (caixa.medidas.caixaComp !== values.caixaComp)
                caixa.medidas.caixaComp = values.caixaComp;
              if (caixa.medidas.caixaLarg !== values.caixaLarg)
                caixa.medidas.caixaLarg = values.caixaLarg;
              if (caixa.medidas.caixaAlt !== values.caixaAlt)
                caixa.medidas.caixaAlt = values.caixaAlt;
              this.setState({ caixa: caixa });
              console.log(this.state);
            }}
          >
            <Form>
              <HStack my="5%" spacing="25px">
                <Field name="caixaComp">
                  {({ field, form }) => (
                    <FormControl>
                      <FormLabel htmlFor="caixaComp">Comprimento</FormLabel>
                      <Input {...field} id="caixaComp" placeholder="156" />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="caixaLarg">
                  {({ field, form }) => (
                    <FormControl>
                      <FormLabel htmlFor="caixaLarg">Largura</FormLabel>
                      <Input {...field} id="caixaLarg" placeholder="56" />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="caixaAlt">
                  {({ field, form }) => (
                    <FormControl>
                      <FormLabel htmlFor="caixaAlt">Altura</FormLabel>
                      <Input {...field} id="caixaAlt" placeholder="66" />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </HStack>
              <HStack justifyContent="end">
                <Button colorScheme="green" type="submit">
                  Calcular
                </Button>
              </HStack>
            </Form>
          </Formik>
        </HStack>
        <HStack>
          <Canvas>
            <QuadroH
              escala={escala}
              comp={caixaComp}
              alt={caixaAlt}
              sarrafoLarg={sarrafoLarg}
              chapa={chapaEsp}
              qtde={latQtde}
              partName="Lateral"
              sarrafoEsp={sarrafoEsp}
            />
          </Canvas>
        </HStack>
      </VStack>
    );
  }

  componentDidMount() {
    console.log(this.state);
  }
}

export default Orcamentos;
