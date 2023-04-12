import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  Tbody,
  Td,
  Tr,
} from "@chakra-ui/react";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { useEffect, useState } from "react";
import { BsTrash } from "react-icons/bs";
import Loading from "../elements/loading";

export const TableConteudo = (props: {
  Itens: any;
  Prazo: string;
  loading: boolean;
  returnItem: any;
  // retunLoading: any;
}): ReactJSXElement => {
  const [ListItens, setItens] = useState<any>([]);
  const [LoadingTable, setLoadingTable] = useState<boolean>(false);

  useEffect(() => {
    setLoadingTable(props.loading);
  }, [props.loading]);

  useEffect(() => {
    setItens(props.Itens);
  }, [props.Itens]);

  const handleAdd = (Obj: any, id: number) => {
    const [ListaObj] = ListItens.filter((i: any) => i.id === id);
    const intero = Object.assign(ListaObj, Obj);
    setItens((ListItens: any) => {
      let newArray = [...ListItens];
      let index = newArray.findIndex((element) => element.id === id);
      newArray[index] = intero;
      return newArray;
    });
    props.returnItem(ListItens);
  };

  const TableItens = !ListItens
    ? null
    : ListItens.map((i: any, x: number) => {
        const Id = i.prodId;
        const remove = () => {
          setLoadingTable(true);
          props.returnItem(i.id);
          setTimeout(() => setLoadingTable(false), 800);
        };
        const valor2Original = i.vFinal.replace(".", "");
        const ValorProd = Number(valor2Original.replace(",", "."));
        const somaDescont = ValorProd * i.Qtd;
        const somaDescontMin = parseInt(somaDescont.toFixed(2));
        if (!i.Qtd) {
          i.Qtd = 1;
        }
        const total = () => {
          if (i.Qtd === 1) {
            return i.total;
          }
          const ValorOriginal =
            Math.round(parseFloat(ValorProd.toFixed(2)) * 100) / 100;
          const acrec =
            i.mont === true && i.expo === true
              ? 1.2
              : i.expo === true && i.mont === false
              ? 1.1
              : i.expo === false && i.mont === true
              ? 1.1
              : 0;
          const descont =
            props.Prazo === "Antecipado" ? ValorOriginal * 0.05 : 0;
          const somaAcrescimo =
            acrec === 0 ? ValorOriginal * i.Qtd : ValorOriginal * acrec * i.Qtd;
          const somaDescont = descont * i.Qtd;
          const somaDescontMin =
            Math.round(parseFloat(somaDescont.toFixed(2)) * 100) / 100;
          const TotalItem = somaAcrescimo - somaDescontMin;
          const result =
            Math.round(parseFloat(TotalItem.toFixed(2)) * 100) / 100;
          return result;
        };

        const codig = () => {
          return Id;
        };
        const GetQtd = (e: any) => {
          const valor = e.target.value;
          const dt = { Qtd: valor };
          handleAdd(dt, i.id);
        };

        const GetMont = (e: any) => {
          const valor = e.target.checked;
          const dt = { mont: valor };
          handleAdd(dt, i.id);
        };

        const GetExpo = (e: any) => {
          const valor = e.target.checked;
          const dt = { expo: valor };
          handleAdd(dt, i.id);
        };

        return (
          <>
            <Tr key={i.id} fontSize={"xs"}>
              <Td isNumeric>{x + 1}</Td>
              <Td>{i.nomeProd}</Td>
              <Td textAlign={"center"}>{codig()}</Td>
              <Td px={12}>
                <Input
                  type={"text"}
                  size="xs"
                  w="3rem"
                  me={0}
                  borderColor="whatsapp.600"
                  rounded="md"
                  focusBorderColor="whatsapp.400"
                  _hover={{
                    borderColor: "whatsapp.600",
                  }}
                  maxLength={4}
                  onChange={GetQtd}
                  value={i.Qtd}
                />
              </Td>
              <Td textAlign={"center"}>{i.altura}</Td>
              <Td textAlign={"center"}>{i.largura}</Td>
              <Td textAlign={"center"}>{i.comprimento}</Td>
              <Td>
                <Checkbox
                  borderColor="whatsapp.600"
                  rounded="md"
                  px="3"
                  onChange={GetMont}
                  value={i.mont}
                />
              </Td>
              <Td>
                <Checkbox
                  borderColor="whatsapp.600"
                  rounded="md"
                  px="3"
                  onChange={GetExpo}
                  value={i.expo}
                />
              </Td>
              <Td textAlign={"center"}>
                {i.vFinal.toLocaleString("pt-br", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Td>
              <Td textAlign={"center"}>
                {total().toLocaleString("pt-br", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Td>
              <Td>
                <Button onClick={remove}>
                  <BsTrash />
                </Button>
              </Td>
            </Tr>
          </>
        );
      });

  if (LoadingTable) {
    return (
      <Flex w="70vw" justifyContent={"center"} me={"-60rem"}>
        <Loading mt="-13vh" size="150px">
          Carregando Produtos...
        </Loading>
      </Flex>
    );
  }

  return (
    <>
      <Tbody overflowY={"auto"}>{TableItens}</Tbody>
    </>
  );
};
