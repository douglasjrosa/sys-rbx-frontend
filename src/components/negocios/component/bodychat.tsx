import { Box, Textarea } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Loading from '../../elements/loading';

export const BodyChat = (props: { conteudo: any; loading: boolean }) => {
  const textareaRef = useRef(null);
  const [Load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [dataSistema, setDataSistema] = useState([]);
  useEffect(() => {
    setLoad(props.loading);
    setData(props.conteudo);
  }, [props.conteudo, props.loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.width = 'auto';
      textareaRef.current.style.width = `${textareaRef.current.scrollwidth}px`;
    }
  }, [data]);

  const sitema = data.filter((d) => d.user === 'Sistema');

  const usuario = data.filter((d) => d.user !== 'Sistema');

  if (Load) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  const estiloMensagem = {
    mensagemSistema: {
      backgroundColor: '#A0AEC0',
      color: '#2D3748',
      alignSelf: 'flex-start',
      // width: 'auto',
      // height: 'auto',
    },
    mensagemUsuario: {
      backgroundColor: '#EDF2F7',
      color: '#2D3748',
      alignSelf: 'flex-end',
      // width: 'auto',
      // height: 'auto',
    },
  };

  return (
    <>
      <Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          w={'100%'}
          h={'100%'}
          p={5}
          overflow={'hidden'}
        >
          {data.map((mensagem, index) => {
            const estilo =
              mensagem.user === 'Sistema'
                ? estiloMensagem.mensagemSistema
                : estiloMensagem.mensagemUsuario;

            const dateFormate = new Date(mensagem.date).toLocaleString();
            return (
              <Box key={index} style={estilo} p={2} borderRadius="md" mb={2}>
                <Box fontSize="15px" fontWeight="bold" mb={3}>
                  {mensagem.user}
                </Box>
                <Textarea
                  fontSize="13px"
                  value={mensagem.msg}
                  readOnly
                  resize="none"
                  ref={textareaRef}
                  border="none"
                  style={{ overflowY: 'hidden' }}
                />
                <Box
                  fontSize="10px"
                  mt={2}
                  textDecoration={'underline'}
                  textAlign={'end'}
                >
                  {dateFormate}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
};
