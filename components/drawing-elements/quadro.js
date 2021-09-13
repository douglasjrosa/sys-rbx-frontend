import { VStack, HStack, Box, Spacer } from "@chakra-ui/react";
import {escalar} from "../../utils/rbx";

export const Canvas = ({children}) => {

    return (
        <Box
            maxW="750px"
            bg="gray.200"
            p="2%"
            children={children}
        />
    );
}

export const Quadro = ({comp, alt, escala, children}) => {
   
    const w = escalar(comp, escala, true);
    const h = escalar(alt, escala, true);
    
    return (
        <Box
            w={w}
            h={h}
            children={children}
        />
    );
}

export const Chapa = ({children}) => {
    
    return <VStack spacing="0px" bg="rgb(255,255,150)" w="100%" h="100%" children={children} />
}

export const Sarrafo = (props) => {

    return (
        <HStack h="100%" w="100%" {...props} >
            <Box
                border="1px solid gray"
                bg="rgb(255,225,100)"
                h="100%"
                w="100%"
            />
        </HStack>
    )
}

export const MeioH = ({sarrafoLarg, comp, alt, escala, isInverted}) => {
    
    const h = escalar(alt - (2 * sarrafoLarg), escala, true);
    const wBorda = escalar(sarrafoLarg, escala, true);
    
    const long = isInverted ? alt : comp;

    let vaos = Math.ceil(long / 50); // vão máximo de 50cm
    vaos = Math.max(vaos, 2); // mínimo de 2 vãos

    const sarrafosMeioCount = vaos - 1;
    
    const wMeio = isInverted ? escalar(comp - (2 * sarrafoLarg), escala, true) : wBorda;
    const hMeio = isInverted ? escalar(sarrafoLarg, escala, true) : h;
    
    const meio = [];
    const meioInvertido = [];

    meio.push(<Spacer key="spacerInicio" />);

    for(let i = 0; i < sarrafosMeioCount; i++){
        meio.push(<Sarrafo key={`meio${i}`} w={wMeio} h={hMeio} />);
        meio.push(<Spacer key={`spacer${i}`} />);
    }
    
    isInverted && meioInvertido.push(<VStack key="meioInvertido" h="100%" spacing="0px">{meio}</VStack>);

    return (
        <HStack key="meioH" w="100%" h={h} spacing="0px" >
            <Sarrafo key="bordaInicio" w={wBorda} />
            {!isInverted && meio}
            {isInverted && meioInvertido}
            <Sarrafo key="bordaFim" w={wBorda} />
        </HStack>
    )
}

export const QuadroH = ({sarrafoLarg, chapa, comp, alt, escala}) => {
    
    const isInverted = alt >= comp * 1.2;
    const h = escalar(sarrafoLarg, escala, true);

    return (
        <Quadro comp={comp} alt={alt} escala={escala} >
            <Chapa>
                <Sarrafo h={h} />
                    <MeioH
                        comp={comp}
                        alt={alt}
                        sarrafoLarg={sarrafoLarg}
                        escala={escala}
                        isInverted={isInverted}
                    />
                <Sarrafo h={h} />
            </Chapa>
        </Quadro>
    )
}
