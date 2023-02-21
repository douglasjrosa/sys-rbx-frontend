import { Button, Checkbox, Input, Td, Tr } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BsTrash } from 'react-icons/bs';
import Loading from '../../elements/loading';

export const TabelaProd = (props: { Itens: any }) => {
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [ListItens, setItens] = useState([]);
  const [email, setEmail] = useState('');
  const [prazo, setPrazo] = useState('');

  useEffect(() => {
    setItens(props.Itens);
  }, [props.Itens]);

  const DelPrudutos = (x: any) => {
    setLoadingTable(true);
    const filterItens = ListItens.filter((i) => i.id !== x);
    setItens(filterItens);
    setLoadingTable(false);
  };

  const handleAdd = (Obj: any, id: number) => {
    const [ListaObj] = ListItens.filter((i) => i.id === id);
    const intero = Object.assign(ListaObj, Obj);
    setItens((ListItens) => {
      let newArray = [...ListItens];
      let index = newArray.findIndex((element) => element.id === id);
      newArray[index] = intero;
      return newArray;
    });
  };

  if (loadingTable) {
    return (
      <>
        <Loading mt="-13vh" size="150px">
          Carregando Produtos...
        </Loading>
      </>
    );
  }

  return (
    <>
      {ListItens.map((i, x) => {
        const Id = i.prodId;
        const remove = () => {
          DelPrudutos(i.id);
        };

        const valor2Original = i.vFinal.replace('.', '');
        const ValorProd = Number(valor2Original.replace(',', '.'));
        const somaDescont = ValorProd * i.Qtd;
        const somaDescontMin = parseInt(somaDescont.toFixed(2));

        if (!i.Qtd) {
          i.Qtd = 1;
        }

        const total = () => {
          if (i.Qtd === 1) {
            return i.total;
          }
          const ValorOriginal = ValorProd;
          const acrec =
            i.mont === true && i.expo === true
              ? 1.2
              : i.expo === true && i.mont === false
              ? 1.1
              : i.expo === false && i.mont === true
              ? 1.1
              : 0;
          const descont = prazo === 'Antecipado' ? ValorOriginal * 0.05 : 0;
          const somaAcrescimo =
            acrec === 0 ? ValorOriginal * i.Qtd : ValorOriginal * acrec * i.Qtd;
          const somaDescont = descont * i.Qtd;
          const somaDescontMin = parseInt(somaDescont.toFixed(2));
          const TotalItem = somaAcrescimo - somaDescontMin;
          return TotalItem;
        };

        const codig = () => {
          if (!i.codg || i.codg === '') {
            const dt = { codg: Id };
            handleAdd(dt, i.id);
            return Id;
          }
          return Id;
        };

        return (
          <>
            <Tr h={3} key={i.id}>
              <Td isNumeric>{x + 1}</Td>
              <Td>{i.nomeProd}</Td>
              <Td textAlign={'center'}>{codig()}</Td>
              <Td px={12}>
                <Input
                  type={'text'}
                  size="xs"
                  w="2.9rem"
                  me={0}
                  borderColor="whatsapp.600"
                  rounded="md"
                  focusBorderColor="whatsapp.400"
                  _hover={{
                    borderColor: 'whatsapp.600',
                  }}
                  maxLength={4}
                  onChange={(e) => {
                    const valor = e.target.value;
                    const dt = { Qtd: valor };
                    handleAdd(dt, i.id);
                  }}
                />
              </Td>
              <Td textAlign={'center'}>{i.altura}</Td>
              <Td textAlign={'center'}>{i.largura}</Td>
              <Td textAlign={'center'}>{i.comprimento}</Td>
              <Td>
                <Checkbox
                  borderColor="whatsapp.600"
                  rounded="md"
                  px="3"
                  onChange={(e) => {
                    const valor = e.target.checked;
                    const dt = { mont: valor };
                    handleAdd(dt, i.id);
                  }}
                />
              </Td>
              <Td>
                <Checkbox
                  borderColor="whatsapp.600"
                  rounded="md"
                  px="3"
                  onChange={(e) => {
                    const valor = e.target.checked;
                    const dt = { expo: valor };
                    handleAdd(dt, i.id);
                  }}
                />
              </Td>
              <Td textAlign={'center'}>{i.vFinal}</Td>
              <Td>
                R$ {''}
                <Input
                  type={'text'}
                  size="xs"
                  borderColor="whatsapp.600"
                  rounded="md"
                  w="16"
                  focusBorderColor="whatsapp.400"
                  _hover={{
                    borderColor: 'whatsapp.600',
                  }}
                  onChange={(e) => {
                    const valor = e.target.value;
                    const dt = { total: valor };
                    handleAdd(dt, i.id);
                  }}
                  value={total()}
                />
              </Td>
              <Td>
                <Button onClick={remove}>
                  <BsTrash />
                </Button>
              </Td>
            </Tr>
          </>
        );
      })}
      ;
    </>
  );
};
