import { Box, Heading, List, ListIcon, ListItem } from '@chakra-ui/react';
import { MdCheckCircle, MdSettings } from 'react-icons/md';

export default function ListaEmpresa(props: any) {
  const id = props.id;
  const nome = props.nome;
  const fantasia = props.fantasia;
  const endereco = props.endereco;
  const numero = props.numero;
  const complemento = props.complemento;
  const bairro = props.bairro;
  const cep = props.cep;
  const cidade = props.cidade;
  const uf = props.uf;
  const fone = props.fone;
  const celular = props.celular;
  const site = props.site;
  const email = props.email;
  const emailNfe = props.emailNfe;
  const CNPJ = props.CNPJ;
  const end =
    endereco +
    ', ' +
    numero +
    ' - ' +
    complemento +
    ' - ' +
    bairro +
    ', ' +
    cidade +
    ' - ' +
    uf;

  return (
    <>
      <Box>
      <Heading mb={3} size="xs">
        dados da empresa
      </Heading>
      <List spacing={3} mb={5}>
        <ListItem>
          <ListIcon as={MdSettings} color="green.500" />
          {nome}
        </ListItem>
        <ListItem fontSize={'xs'}>
          <ListIcon as={MdCheckCircle} color="green.500" />
          {end}
        </ListItem>
        <ListItem fontSize={'xs'}>
          <ListIcon as={MdCheckCircle} color="green.500" />
          {fone} {celular}
        </ListItem>
        <ListItem>
          <ListIcon as={MdCheckCircle} color="green.500" />
          {email}
        </ListItem>
      </List>
      </Box>
    </>
  );
}
