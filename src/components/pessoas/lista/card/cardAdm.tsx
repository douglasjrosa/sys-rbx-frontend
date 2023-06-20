import { Box, chakra, Flex, Icon, Link, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { SiWhatsapp } from "react-icons/si";
import { FaRegBuilding } from "react-icons/fa";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { mask } from "remask";
import Loading from "../../../elements/loading";
import { ListaDeDadosPessoais } from "@/types/pessoas";


export default function CardPessoasAdm() {
  const [dados, setDados] = useState<ListaDeDadosPessoais | any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    (async () => {
      await axios({
        method: "GET",
        url: "/api/db/pessoas/Get",
      })
        .then((res) => {
          console.log(res.data.data);
          setDados(res.data.data);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    })();
  }, []);

  if (!dados) {
    return (
      <>
        <Box></Box>
      </>
    );
  }

  const get = async () => {
    await axios({
      method: "GET",
      url: "/api/db/pessoas/Get",
    })
      .then((res) => {
        console.log(res.data.data);
        setDados(res.data.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  const Remove = async (id: number) => {
    await axios({
      method: "PUT",
      url: "/api/db/pessoas/delete/" + id,
    })
      .then(() => {
        setLoading(true);
        toast({
          title: "Contato Deletado",
          description: "duvidas procurar o Adm",
          duration: 5000,
          position: "top-right",
          status: "success",
        });
        setTimeout(() => get(), 1000);
      })
      .catch((err) => console.error(err));
  };

  const render = dados.map((item: { attributes: { createdAt: string; cpf: null; CPF: string ; endereco: string; numero: string; bairro: string; cidade: string; uf: string; empresas: { data: any; }; nome: string; whatsapp: string; departamento: string; cargo: string; }; id: number | any }) => {
      const data = () => {
        const ano = item.attributes.createdAt.substr(0, 4);
        const mes = item.attributes.createdAt.substr(5, 2);
        const dia = item.attributes.createdAt.substr(8, 2);
        const mesesLieral =
          mes === "1"
            ? "Jan"
            : mes === "2"
            ? "Fev"
            : mes === "3"
            ? "Mar"
            : mes === "4"
            ? "Abr"
            : mes === "5"
            ? "Mai"
            : mes === "6"
            ? "Jun"
            : mes === "7"
            ? "Jul"
            : mes === "8"
            ? "Ago"
            : mes === "9"
            ? "Set"
            : mes === "10"
            ? "Out"
            : mes === "11"
            ? "Nov"
            : "Dez";
        const date = "Criado em: " + mesesLieral + " " + dia + ", " + ano;

        return date;
      };

      const cpf = () => {
        const dig01 =
          item.attributes.cpf === null
            ? "000"
            : item.attributes.CPF.substr(0, 3);
        const dig02 =
          item.attributes.CPF === null
            ? "000"
            : item.attributes.CPF.substr(3, 3);
        const dig03 =
          item.attributes.CPF === null
            ? "000"
            : item.attributes.CPF.substr(6, 3);
        const dig04 =
          item.attributes.CPF === null
            ? "00"
            : item.attributes.CPF.substr(9, 2);

        const result = dig01 + "." + dig02 + "." + dig03 + "-" + dig04;
        return result;
      };
      const end =
        item.attributes.endereco +
        ", " +
        item.attributes.numero +
        " - " +
        item.attributes.bairro +
        ", " +
        item.attributes.cidade +
        " - " +
        item.attributes.uf;

      const empresas =
        item.attributes.empresas.data === null
          ? ""
          : item.attributes.empresas.data;
      const emplist =
        empresas.length === 0
          ? "não tem empresa vinculada."
          : empresas
              .map((m: any, x: number) => {
                if (x === empresas.length - 1) {
                  return `${m.attributes.nome}.`;
                } else {
                  return `${m.attributes.nome}, `;
                }
              })
              .join("");

      return (
        <Box
          mx="auto"
          px={8}
          py={5}
          mb={5}
          rounded="lg"
          shadow="lg"
          boxShadow="dark-lg"
          bg="white"
          _dark={{
            bg: "gray.900",
          }}
          w={"sm"}
          key={item.id}
          fontSize="sm"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <chakra.span
              fontSize="sm"
              color="gray.600"
              _dark={{
                color: "gray.400",
              }}
            >
              {data()}
            </chakra.span>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              flexDirection={["column", "row", "row"]}
              w={36}
              gap={5}
            >
              <Link
                px={3}
                py={1}
                bg="gray.600"
                color="gray.100"
                fontSize="sm"
                fontWeight="700"
                rounded="md"
                _hover={{
                  bg: "gray.500",
                }}
                onClick={async () => {
                  const id = item.id;
                  Remove(id);
                }}
              >
                Delete
              </Link>
              <Link
                px={3}
                py={1}
                bg="gray.600"
                color="gray.100"
                fontSize="sm"
                fontWeight="700"
                rounded="md"
                _hover={{
                  bg: "gray.500",
                }}
                onClick={async () => {
                  localStorage.setItem("atid", item.id);
                  const id = item.id;
                  await router.push("/pessoas/atualizar/" + id);
                }}
              >
                editar
              </Link>
            </Flex>
          </Flex>

          <Box mt={2}>
            <Link
              fontSize="2xl"
              color="gray.700"
              _dark={{
                color: "white",
              }}
              fontWeight="700"
              _hover={{
                color: "gray.600",
                _dark: {
                  color: "gray.200",
                },
                textDecor: "underline",
              }}
            >
              {item.attributes?.nome}
            </Link>
            <Box
              mt={2}
              display={"flex"}
              flexDirection={["column", "column", "row", "row"]}
            >
              <chakra.p
                mt={2}
                color="gray.600"
                _dark={{
                  color: "gray.300",
                }}
              >
                <Icon as={SiWhatsapp} />
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: "gray.300",
                }}
              >
                {mask(item.attributes.whatsapp, ["(99) 9 9999-9999"])}
              </chakra.p>
            </Box>
            <Box display={"flex"} alignItems={"center"}>
              <chakra.p
                mt={2}
                color="gray.600"
                _dark={{
                  color: "gray.300",
                }}
              >
                Departamento:
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: "gray.300",
                }}
              >
                {item.attributes.departamento}
              </chakra.p>
            </Box>
            <Box display={"flex"} alignItems={"center"}>
              <chakra.p
                mt={2}
                color="gray.600"
                _dark={{
                  color: "gray.300",
                }}
              >
                Cargo:
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: "gray.300",
                }}
              >
                {item.attributes.cargo}
              </chakra.p>
            </Box>
            <Box display={"flex"} alignItems={"center"}>
              <chakra.p
                mt={2}
                color="gray.600"
                _dark={{
                  color: "gray.300",
                }}
              >
                <Icon as={FaRegBuilding} />
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: "gray.300",
                }}
              >
                {emplist}
              </chakra.p>
            </Box>
          </Box>
        </Box>
      );
    }
  );

  if (loading) {
    return (
      <Flex
        w={"100%"}
        h={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Loading size="200px">Carregando...</Loading>
      </Flex>
    );
  }
  const display = !dados ? null : render;
  return (
    <>
      <Box h={"100%"} display={"flex"} flexWrap={"wrap"} gap={3}>
        {display}
      </Box>
    </>
  );
}
