import { VStack, HStack, Box, Spacer, Text, Heading, Divider} from '@chakra-ui/react'
import { escalar } from '../../utils/rbx'

export const Canvas = ({ children }) => {
    return (
        <Box
            maxW="750px"
            p="15px"
            border="1px solid #e4e4e4"
            borderRadius="8px"
            children={children}
            shadow="lg"
            m="30px"
        />
    )
}

export const calcVaos = (long, sarrafoLarg) => {
    let vaos = Math.ceil(long / 50) // vão máximo de 50cm
    vaos = Math.max(vaos, 2) // mínimo de 2 vãos

    let vao = long / vaos + sarrafoLarg / 2
    vao = Number(vao).toFixed(1)

    return { vaos: vaos, vao: vao }
}

export const CotaE = ({ escala, alt, sarrafoLarg }) => {
    const { vaos, vao } = calcVaos(alt, sarrafoLarg)
    return (
        <VStack
            h={escalar(vao, escala, false) - 4 + 'px'}
            border="1px solid gray"
            borderRight="none"
            px="3px"
            maxW="50px"
        >
            <Spacer />
            <Box>
                <Text transform="rotate(-90deg)">{vao}</Text>
            </Box>
            <Spacer />
        </VStack>
    )
}

export const CotaD = ({ cota, escala }) => {
    return (
        <VStack
            h={escalar(cota, escala, true)}
            border="1px solid gray"
            borderLeft="none"
            px="3px"
            maxW="50px"
        >
            <Spacer />
            <Box>
                <Text transform="rotate(-90deg)">{cota}</Text>
            </Box>
            <Spacer />
        </VStack>
    )
}

export const CotaHeader = ({ comp, escala, sarrafoLarg }) => {
    const { vao } = calcVaos(comp, sarrafoLarg)
    return (
        <VStack
            w={escalar(vao, escala, true)}
            border="1px solid gray"
            borderBottom="none"
            py="3px"
            maxH="30px"
        >
            <Text align="center">{vao}</Text>
        </VStack>
    )
}

export const CotaBottom = ({ comp, escala }) => {
    return (
        <VStack
            w={escalar(comp, escala, true)}
            border="1px solid gray"
            borderTop="none"
            py="3px"
            maxH="30px"
        >
            <Text align="center">{comp}</Text>
        </VStack>
    )
}

export const Chapa = ({ children }) => {
    return (
        <VStack
            spacing="0px"
            bg="rgb(255,255,150)"
            w="100%"
            h="100%"
            children={children}
        />
    )
}

export const Sarrafo = (props) => {
    return (
        <HStack h="100%" w="100%" {...props}>
            <Box
                border="1px solid gray"
                bg="rgb(255,225,100)"
                h="100%"
                w="100%"
            />
        </HStack>
    )
}

export const MeioH = ({ sarrafoLarg, comp, alt, escala, isInverted }) => {
    const h = escalar(alt - 2 * sarrafoLarg, escala, true)
    const wBorda = escalar(sarrafoLarg, escala, true)

    const long = isInverted ? alt : comp

    const { vaos } = calcVaos(long, sarrafoLarg)

    const sarrafosMeioCount = vaos - 1

    const wMeio = isInverted
        ? escalar(comp - 2 * sarrafoLarg, escala, true)
        : wBorda
    const hMeio = isInverted ? escalar(sarrafoLarg, escala, true) : h

    const meio = []
    const meioInvertido = []

    meio.push(<Spacer key="spacerInicio" />)

    for (let i = 0; i < sarrafosMeioCount; i++) {
        meio.push(<Sarrafo key={`meio${i}`} w={wMeio} h={hMeio} />)
        meio.push(<Spacer key={`spacer${i}`} />)
    }

    isInverted &&
        meioInvertido.push(
            <VStack key="meioInvertido" h="100%" spacing="0px">
                {meio}
            </VStack>,
        )

    return (
        <HStack key="meioH" w="100%" h={h} spacing="0px">
            <Sarrafo key="bordaInicio" w={wBorda} />
            {!isInverted && meio}
            {isInverted && meioInvertido}
            <Sarrafo key="bordaFim" w={wBorda} />
        </HStack>
    )
}

export const QuadroH = ({
    sarrafoLarg,
    chapa,
    comp,
    alt,
    escala,
    qtde,
    partName,
    sarrafoEsp,
}) => {
    const isInverted = alt >= comp * 1.2
    const sarrafoLargPx = escalar(sarrafoLarg, escala, true)

    const w = escalar(comp, escala, true)
    const h = escalar(alt, escala, true)

    let longMeio = !isInverted ? alt : comp
    longMeio -= sarrafoLarg * 2

    const longVaos = isInverted ? alt : comp
    const { vaos } = calcVaos(longVaos, sarrafoLarg)
    const qtdeMeio = vaos - 1

    return (
        <VStack fontSize="10pt">
            <HStack align="start" w="100%">
                <Box>
                    <Heading as="h2" size="md">
                        {partName} = {qtde}
                    </Heading>
                </Box>
            </HStack>
            <HStack align="start" spacing="0px">
                <VStack key="col1" w="70px" align="end">
                    <HStack h="30px">
                        <Text>Mad: </Text>
                        <Text>{sarrafoLarg}</Text>
                    </HStack>
                    {isInverted && (
                        <CotaE
                            sarrafoLarg={sarrafoLarg}
                            escala={escala}
                            alt={alt}
                        />
                    )}
                </VStack>
                <VStack key="col2" w="100%">
                    <VStack h="30px" align="end" w={w}>
                        {!isInverted && (
                            <CotaHeader
                                comp={comp}
                                escala={escala}
                                sarrafoLarg={sarrafoLarg}
                            />
                        )}
                    </VStack>
                    <VStack w={w}>
                        <Chapa>
                            <Sarrafo h={sarrafoLargPx} />
                            <MeioH
                                comp={comp}
                                alt={alt}
                                sarrafoLarg={sarrafoLarg}
                                escala={escala}
                                isInverted={isInverted}
                            />
                            <Sarrafo h={sarrafoLargPx} />
                        </Chapa>
                        <CotaBottom comp={comp} escala={escala} />
                    </VStack>
                </VStack>
                <VStack key="col3" align="start">
                    <HStack h="30px">
                        <Text>Ch: </Text>
                        <Text>{chapa}</Text>
                    </HStack>
                    <CotaD cota={alt} escala={escala} />
                </VStack>
            </HStack>
            <VStack py="20px" w="100%" align="end">
                <Box w="130px">
                    <VStack justify="center">
                        <Heading as="h3" size="xs" my="5px" >Corte:</Heading>
                    </VStack>
                    <HStack justify="end">
                        <Text>{comp}</Text>
                        <Text>x {sarrafoLarg}</Text>
                        <Text>x {sarrafoEsp}</Text>
                        <Text>= {qtde * 2}</Text>
                    </HStack>
                    <HStack justify="end">
                        <Text>{alt - sarrafoLarg * 2}</Text>
                        <Text>x {sarrafoLarg}</Text>
                        <Text>x {sarrafoEsp}</Text>
                        <Text>= {qtde * 2}</Text>
                    </HStack>
                    <HStack justify="end">
                        <Text>{longMeio}</Text>
                        <Text>x {sarrafoLarg}</Text>
                        <Text>x {sarrafoEsp}</Text>
                        <Text>= {qtdeMeio * qtde}</Text>
                    </HStack>
                </Box>
            </VStack>
        </VStack>
    )
}
