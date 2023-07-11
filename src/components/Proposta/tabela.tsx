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

      const total = () => {
        if (i.Qtd === 1 && i.mont === false && i.expo === false) {
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
        const valor = e.target.value.replace(/\D/g, '');
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

      const ValorFinal = parseFloat(i.vFinal.replace('.', '').replace(',', '.')).toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL",
      })
      return (
        <>
          <Tr key={i.id}>
            <Td isNumeric w={'1.3rem'} px='0' py='1' textAlign={'center'}>{x + 1}</Td>
            <Td px='1rem' bg={'gray.800'} color={'white'} fontSize={'0.7rem'}>{i.nomeProd}</Td>
            <Td px='0' py='1' fontSize={'0.8rem'} textAlign={"center"}>{codig()}</Td>
            <Td px='0' py='1' fontSize={'0.8rem'}>
              <Input
                type={"number"}
                size="xs"
                me={0}
                borderColor="whatsapp.600"
                rounded="md"
                focusBorderColor="whatsapp.400"
                _hover={{
                  borderColor: "whatsapp.600",
                }}
                onChange={GetQtd}
                value={i.Qtd}
              />
            </Td>
            <Td px='0' py='1' fontSize={'0.8rem'} textAlign={"center"}>{i.altura}</Td>
            <Td px='0' py='1' fontSize={'0.8rem'} textAlign={"center"}>{i.largura}</Td>
            <Td px='0' py='1' fontSize={'0.8rem'} textAlign={"center"}>{i.comprimento}</Td>
            <Td px='0' py='1' fontSize={'0.8rem'}>
              <Flex w={'100%'} justifyContent={'center'}>
                <Checkbox
                  borderColor="whatsapp.600"
                  rounded="md"
                  px="3"
                  onChange={GetMont}
                  isChecked={i.mont}
                />
              </Flex>
            </Td>
            <Td px='0' py='1' fontSize={'0.8rem'}>
              <Flex w={'100%'} justifyContent={'center'}>
                <Checkbox
                  borderColor="whatsapp.600"
                  rounded="md"
                  px="3"
                  onChange={GetExpo}
                  isChecked={i.expo}
                />
              </Flex>
            </Td>

            <Td px='0' py='1' fontSize={'0.8rem'} textAlign={"center"}>
              {ValorFinal}
            </Td>
            <Td px='0' py='1' fontSize={'0.8rem'} textAlign={"center"}>
              {total().toLocaleString("pt-br", {
                style: "currency",
                currency: "BRL",
              })}
            </Td>
            <Td px='3%' py='1' fontSize={'0.8rem'} w={"5rem"}>
              <Flex w={'100%'} justifyContent={'center'}>
                <Button onClick={remove} boxShadow={'lg'} colorScheme="green" p={'3'}>
                  <BsTrash />
                </Button>
              </Flex>
            </Td>
          </Tr>
        </>
      );
    });

  if (LoadingTable) {
    return (
      <Flex w="70vw" justifyContent={"center"} me={"-60rem"}>
        <Loading mt="-7vh" size="60px">
          Carregando Produtos...
        </Loading>
      </Flex>
    );
  }

  return (
    <>
      <Tbody>{TableItens}</Tbody>
    </>
  );
};
