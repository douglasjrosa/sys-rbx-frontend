/* eslint-disable react/no-children-prop */
/* eslint-disable react/prop-types */
import {
  VStack,
  HStack,
  Box,
  Spacer,
  Text,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { escalar } from '../../utils/rbx';

export function Canvas({ children }) {
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
  );
}

export const calcVaos = (long, sarrafoLarg, escala) => {
  let vaos = Math.ceil(long / 50); // Vão máximo de 50cm
  vaos = Math.max(vaos, 2); // Mínimo de 2 vãos

  const vao = Number(long / vaos).toFixed(1),
    sarrafosCount = vaos + 1;
  let vaoPx = (long - sarrafoLarg * sarrafosCount) / vaos + sarrafoLarg * 1.5;
  vaoPx = escalar(vaoPx, escala, true);
  return { vaos: vaos, vao: vao, vaoPx };
};
// eslint-disable-next-line react/prop-types

export function CotaE({ escala, alt, sarrafoLarg }) {
  const { vao, vaoPx } = calcVaos(alt, sarrafoLarg, escala);
  return (
    <VStack
      border="1px solid gray"
      borderRight="none"
      h={vaoPx}
      maxW="50px"
      px="3px"
    >
      <Spacer />

      <Box>
        <Text transform="rotate(-90deg)">{vao}</Text>
      </Box>

      <Spacer />
    </VStack>
  );
}

export function CotaD({ cota, escala }) {
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
  );
}

export function CotaHeader({ comp, escala, sarrafoLarg }) {
  const { vao, vaoPx } = calcVaos(comp, sarrafoLarg, escala);
  return (
    <VStack
      w={vaoPx}
      border="1px solid gray"
      borderBottom="none"
      py="3px"
      maxH="30px"
    >
      <Text align="center">{vao}</Text>
    </VStack>
  );
}

export function CotaBottom({ comp, escala }) {
  return (
    <VStack
      w={escalar(comp, escala, true)}
      border="1px solid gray"
      borderTop="none"
      py="3px"
      maxH="30px"
      spacing="0px"
    >
      <Text align="center">{comp}</Text>
    </VStack>
  );
}

export function Chapa({ children }) {
  return (
    <VStack
      spacing="0px"
      bg="rgb(255,255,150)"
      w="100%"
      h="100%"
      children={children}
    />
  );
}

export function Sarrafo(props) {
  return (
    <HStack h="100%" w="100%" {...props}>
      <Box border="1px solid gray" bg="rgb(255,225,100)" h="100%" w="100%" />
    </HStack>
  );
}

export function MeioH({ sarrafoLarg, comp, alt, escala, isInverted }) {
  const h = escalar(alt - 2 * sarrafoLarg, escala, true),
    wBorda = escalar(sarrafoLarg, escala, true),
    long = isInverted ? alt : comp,
    { vaos } = calcVaos(long, sarrafoLarg, escala),
    sarrafosMeioCount = vaos - 1,
    wMeio = isInverted ? escalar(comp - 2 * sarrafoLarg, escala, true) : wBorda,
    hMeio = isInverted ? escalar(sarrafoLarg, escala, true) : h,
    meio = [],
    meioInvertido = [];

  meio.push(<Spacer key="spacerInicio" />);

  for (let i = 0; i < sarrafosMeioCount; i++) {
    meio.push(<Sarrafo key={`meio${i}`} w={wMeio} h={hMeio} />);
    meio.push(<Spacer key={`spacer${i}`} />);
  }

  isInverted &&
    meioInvertido.push(
      <VStack key="meioInvertido" h="100%" spacing="0px">
        {meio}
      </VStack>,
    );

  return (
    <HStack key="meioH" w="100%" h={h} spacing="0px">
      <Sarrafo key="bordaInicio" w={wBorda} />

      {!isInverted && meio}

      {isInverted ? meioInvertido : null}

      <Sarrafo key="bordaFim" w={wBorda} />
    </HStack>
  );
}

export function QuadroH({
  sarrafoLarg,
  chapa,
  comp,
  alt,
  escala,
  qtde,
  partName,
  sarrafoEsp,
}) {
  const isInverted = alt >= comp * 1.2,
    sarrafoLargPx = escalar(sarrafoLarg, escala, true),
    w = escalar(comp, escala, true),
    h = escalar(alt, escala, true);

  let longMeio = !isInverted ? alt : comp;
  longMeio -= sarrafoLarg * 2;

  const longVaos = isInverted ? alt : comp,
    { vaos } = calcVaos(longVaos, sarrafoLarg),
    qtdeMeio = vaos - 1;

  return (
    <VStack fontSize="10pt">
      <HStack align="start" w="100%">
        <Box>
          <Heading as="h2" size="md">
            {partName} ={qtde}
          </Heading>
        </Box>
      </HStack>

      <HStack align="start">
        <VStack key="col1" w="70px" align="end" spacing="0px">
          <HStack h="30px">
            <Text>Mad: </Text>

            <Text>{sarrafoLarg}</Text>
          </HStack>

          {isInverted ? (
            <CotaE sarrafoLarg={sarrafoLarg} escala={escala} alt={alt} />
          ) : null}
        </VStack>

        <VStack key="col2" w={w} p="0%" spacing="0px">
          <VStack h="30px" align="end" w={w} spacing="0px">
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

        <VStack key="col3" align="start" spacing="0px">
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
            <Heading as="h3" size="xs" my="5px">
              Corte:
            </Heading>
          </VStack>

          <HStack justify="end">
            <Text>{comp}</Text>

            <Text>x{sarrafoLarg}</Text>

            <Text>x{sarrafoEsp}</Text>

            <Text>={qtde * 2}</Text>
          </HStack>

          <HStack justify="end">
            <Text>{alt - sarrafoLarg * 2}</Text>

            <Text>x{sarrafoLarg}</Text>

            <Text>x{sarrafoEsp}</Text>

            <Text>={qtde * 2}</Text>
          </HStack>

          <HStack justify="end">
            <Text>{longMeio}</Text>

            <Text>x{sarrafoLarg}</Text>

            <Text>x{sarrafoEsp}</Text>

            <Text>={qtdeMeio * qtde}</Text>
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
}
