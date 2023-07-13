import { Box, Flex, Link } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Loading from '../../elements/loading';

interface MyTextAreaElement extends HTMLTextAreaElement { }

export const BodyChat = (props: { conteudo?: any; loading: boolean }) => {
  const textareaRef = useRef<MyTextAreaElement>(null);
  const [Load, setLoad] = useState(false);
  const [data, setData] = useState<any | null>([]);
  const [dataUser, setDataUser] = useState([]);
  const [dataSistema, setDataSistema] = useState([]);
  useEffect(() => {
    setLoad(props.loading);
    setData(props.conteudo);
  }, [props.conteudo, props.loading]);

  useEffect(() => {
    if (textareaRef.current) {
      (textareaRef.current as HTMLTextAreaElement).style.height = 'auto';
      (textareaRef.current as HTMLTextAreaElement).style.height = `${textareaRef.current.scrollHeight}px`;
      (textareaRef.current as HTMLTextAreaElement).style.width = 'auto';
      (textareaRef.current as HTMLTextAreaElement).style.width = `${textareaRef.current.scrollWidth}px`;
    }
  }, [data]);


  if (Load) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  const estiloMensagem = {
    mensagemSistema: {
      backgroundColor: '#dcf8c6',
      color: '#2D3748',
      alignSelf: 'flex-start',
    },
    mensagemUsuario: {
      backgroundColor: '#EDF2F7',
      color: '#2D3748',
      alignSelf: 'flex-end',
    },
  };

  return (
    <Box display={'flex'} flexDirection={'column'} w={'100%'} p={5}>
      {!data ? null : data.map((mensagem: any, index: number) => {
        const estilo =
          mensagem.user === 'Sistema'
            ? estiloMensagem.mensagemSistema
            : estiloMensagem.mensagemUsuario;

        const dateFormate = new Date(mensagem.date).toLocaleString();
       const linkRegex = /(http[s]?:\/\/[^\s]+)/g;
       const match = mensagem.msg.match(linkRegex);
       const TextoLinpo = mensagem.msg.replace(match, '')
       const link = match ? match[0] : null;
       const Textofinal = !link? (<>{mensagem.msg}</>) : (<>{TextoLinpo} <Link color={'blue'} href={link}>{link}</Link></>)
        return (
          <Box
            key={index}
            maxW={'65%'}
            style={estilo}
            p={2}
            borderRadius="md"
            mb={2}
          >
            <Box fontSize="13px" fontWeight="bold" mb={3}>
              {mensagem.user}
            </Box>
            <Box
            px={3}
              whiteSpace="pre-wrap"
              w={'100%'}
              fontSize="12px"

            >{Textofinal}</Box>
            <Box
              fontSize="10px"
              mt={2}

              textAlign={'end'}
            >
              <Flex gap={5} justifyContent={'space-between'}>
                <Box textDecoration='none' color={'white'} px={'5px'} rounded={'5px'} bg={'messenger.700'} fontWeight={'bold'} hidden={!mensagem.flag}>
                  {mensagem.flag}
                </Box>
                <Box textDecoration={'underline'}>
                  {dateFormate}
                </Box>
              </Flex>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
