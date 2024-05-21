import {
	Box,
	Flex,
	Heading,
	Img,
	List,
	ListIcon,
	ListItem,
} from '@chakra-ui/react'
import axios from 'axios'
import { MdCheckCircle, MdSettings } from 'react-icons/md'
import { RiCloseCircleFill } from 'react-icons/ri'

export default function ListaEmpresaAt ( props: any ) {
	const id = props.id
	const nome = props.nome
	const fantasia = props.fantasia
	const endereco = props.endereco
	const numero = props.numero
	const complemento = props.complemento
	const bairro = props.bairro
	const cep = props.cep
	const cidade = props.cidade
	const uf = props.uf
	const fone = props.fone
	const celular = props.celular
	const site = props.site
	const email = props.email
	const emailNfe = props.emailNfe
	const CNPJ = props.CNPJ
	const pessoa = props.idPessoa

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
		uf

	const removEmpresa = async () => {
		const url = `/api/db/pessoas/consulta/${ props.idPessoa }`
		const response = await axios( url )
		const pessoa = response.data.data.attributes.empresas.data
		const DataPessoa = response.data.data
		const idempresa = pessoa.map( ( item: { id: any } ) => item.id )
		const filter = idempresa.filter( ( item: any ) => item !== props.id )
		const data = {
			data: {
				nome: DataPessoa.attributes.nome,
				whatsapp: DataPessoa.attributes.whatsapp,
				telefone: DataPessoa.attributes.telefone,
				obs: DataPessoa.attributes.obs,
				status: DataPessoa.attributes.status,
				empresas: filter,
			},
		}
		const urlAt = '/api/db/pessoas/atualizacao/' + props.idPessoa
		await axios( {
			method: 'PUT',
			url: urlAt,
			data: data,
		} )
			.then( ( response ) => {
				return response.data
			} )
			.catch( ( err ) => {
				console.error( err )
			} )
	}

	return (
		<>
			<Box mb={ 5 } w={ '788px' }>
				<Flex justifyContent={ 'space-between' }>
					<Heading mb={ 3 } size="xs">
						dados da empresa
					</Heading>
					<Img
						me={ 10 }
						size={ 20 }
						as={ RiCloseCircleFill }
						color="green.500"
						onClick={ removEmpresa }
					/>
				</Flex>
				<List spacing={ 3 }>
					<ListItem>
						<ListIcon as={ MdSettings } color="green.500" />
						{ nome }
					</ListItem>
					<ListItem fontSize={ 'xs' }>
						<ListIcon as={ MdCheckCircle } color="green.500" />
						{ end }
					</ListItem>
					<ListItem fontSize={ 'xs' }>
						<ListIcon as={ MdCheckCircle } color="green.500" />
						{ fone } { celular }
					</ListItem>
					<ListItem>
						<ListIcon as={ MdCheckCircle } color="green.500" />
						{ email }
					</ListItem>
				</List>
			</Box>
		</>
	)
}
