import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "../../elements/loading";
import CardBusiness from "./card";


export const BodyCard = (props: { reload: any, itens: any }) => {
  const [dados, setDados] = useState<any | null>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setDados(props.itens);
      setLoading(false);
    })();
  }, [props.itens]);

  function reload(Loading: boolean | ((prevState: boolean) => boolean)) {
    setLoading(Loading);
  }

  useEffect(() => {
    setLoading(props.reload);
  }, [props.reload]);

  return (
    <>
      <Box
        bg={"blackAlpha.300"}
        w={"100%"}
        h={"100%"}
        boxShadow={"dark-lg"}
        rounded={15}
        p={5}
      >
        <Box w={"100%"} h={"100%"} overflowX={"hidden"}>
          {loading ? (
            <Flex
              w={"100%"}
              h={"100%"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Loading size="200px">Carregando...</Loading>
            </Flex>
          ) : (
            <>
              <SimpleGrid
                p="1rem"
                columns={{ base: 1, md: 2 }}
                row={{ base: 1, md: 1 }}
                spacing={{ base: 3, md: 5 }}
              >
                {!dados
                  ? null
                  : dados.map((i: any) => {
                      return (
                        <>
                          <CardBusiness
                            id={i?.id}
                            deadline={i?.attributes.deadline}
                            nBusiness={i?.attributes.nBusiness}
                            Budget={i?.attributes.budget}
                            pedidos={i?.attributes.pedidos.data.length}
                            pedidosQtd={i?.attributes.pedidos.data}
                            empresa={i?.attributes.empresa}
                            criateed={i?.attributes.createdAt}
                            andamento={i?.attributes.statusAnd}
                            onloading={reload}
                          />
                        </>
                      );
                    })}
              </SimpleGrid>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};
