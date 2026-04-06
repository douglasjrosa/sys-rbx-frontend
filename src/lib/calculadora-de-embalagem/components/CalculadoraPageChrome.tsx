import { ArrowBackIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
} from "@chakra-ui/react";

type CalculadoraPageChromeProps = {
  headingColor: string;
  colorMode: string;
  onToggleColorMode: () => void;
};

export function CalculadoraPageChrome({
  headingColor,
  colorMode,
  onToggleColorMode,
}: CalculadoraPageChromeProps) {
  return (
    <Box w="100%">
      <Flex
        display={{ base: "flex", md: "none" }}
        direction="column"
        gap={4}
      >
        <Flex justify="space-between" align="center" w="100%">
          <Button
            as="a"
            href="https://ribermax.com.br"
            variant="ghost"
            size="sm"
            leftIcon={<ArrowBackIcon />}
          >
            Voltar para o site
          </Button>
          <IconButton
            aria-label="Alternar tema"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={onToggleColorMode}
            variant="ghost"
            size="lg"
            fontSize="xl"
            color={headingColor}
          />
        </Flex>
        <Heading
          size="lg"
          color={headingColor}
          fontWeight="bold"
          textAlign="center"
          w="100%"
        >
          Calculadora de Embalagem
        </Heading>
      </Flex>
      <Flex
        display={{ base: "none", md: "flex" }}
        justify="space-between"
        align="center"
        w="100%"
        gap={4}
      >
        <Button
          as="a"
          href="https://ribermax.com.br"
          variant="ghost"
          size="sm"
          leftIcon={<ArrowBackIcon />}
        >
          Voltar para o site
        </Button>
        <Heading
          size="xl"
          color={headingColor}
          fontWeight="bold"
          textAlign="center"
          flex="1"
        >
          Calculadora de Embalagem
        </Heading>
        <IconButton
          aria-label="Alternar tema"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={onToggleColorMode}
          variant="ghost"
          size="lg"
          fontSize="xl"
          color={headingColor}
        />
      </Flex>
    </Box>
  );
}
