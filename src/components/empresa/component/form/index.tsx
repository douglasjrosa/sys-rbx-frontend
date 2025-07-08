import { confgEnb } from "@/components/data/confgEnb"
import { modCaix } from "@/components/data/modCaix"
import { FormaPg } from "@/components/elements/FomaPg"
import { CompPessoa } from "@/components/elements/lista/pessoas"
import Loading from "@/components/elements/loading"
import { PrazoPg } from "@/components/elements/PrazoPg"
import { capitalizeWords } from "@/function/captalize"
import { GetCnpj } from "@/function/getcnpj"
import {
	Box,
	Button,
	chakra,
	Flex,
	FormControl,
	FormLabel,
	GridItem,
	Heading,
	Input,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	useToast,
} from "@chakra-ui/react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { mask, unMask } from "remask"
import { RestData } from "../dataReset"

export const FormEmpresa = ( props: { data?: any, envio: string } ) => {
	const { data: session } = useSession()
	const router = useRouter()
	const [ CNPJ, setCNPJ ] = useState( '' )
	const [ MaskCNPJ, setMaskCNPJ ] = useState( "" )
	const [ nome, setNome ] = useState( "" )
	const [ fantasia, setFantasia ] = useState( "" )
	const [ tipoPessoa, setTipoPessoa ] = useState( "" )
	const [ fone, setFone ] = useState( "" )
	const [ celular, setCelular ] = useState( "" )
	const [ WhatsMask, setWhatsMask ] = useState( "" )
	const [ email, setEmail ] = useState( "" )
	const [ emailNfe, setEmailNfe ] = useState( "" )
	const [ ieStatus, setIeStatus ] = useState( false )
	const [ CNAE, setCNAE ] = useState( "" )
	const [ Ie, setIE ] = useState( "" )
	const [ porte, setPorte ] = useState( "" )
	const [ simples, setSimples ] = useState( false )
	const [ site, setSite ] = useState( "" )
	const [ endereco, setEndereco ] = useState( "" )
	const [ numero, setNumero ] = useState( "" )
	const [ bairro, setBairro ] = useState( "" )
	const [ complemento, setComplemento ] = useState( "" )
	const [ cidade, setCidade ] = useState( "" )
	const [ uf, setUf ] = useState( "" )
	const [ cep, setCep ] = useState( "" )
	const [ pais, setPais ] = useState( "" )
	const [ codpais, setCodpais ] = useState( "" )
	const [ contribuinte, setContribuinte ] = useState( "" )
	const [ adFrailLat, setAdFragilLat ] = useState( false )
	const [ adFrailCab, setAdFragilCab ] = useState( false )
	const [ adEspecialLat, setAdEspecialLat ] = useState( false )
	const [ adEspecialCab, setAdEspecialCab ] = useState( false )
	const [ latFCab, setLatFCab ] = useState( false )
	const [ cabChao, setCabChao ] = useState( false )
	const [ cabTop, setCabTop ] = useState( false )
	const [ cxEco, setCxEco ] = useState( false )
	const [ cxEst, setCxEst ] = useState( false )
	const [ cxLev, setCxLev ] = useState( false )
	const [ cxRef, setCxRef ] = useState( null )
	const [ cxSupRef, setCxSupRef ] = useState( false )
	const [ platSMed, setPlatSMed ] = useState( false )
	const [ cxResi, setCxResi ] = useState( false )
	const [ engEco, setEngEco ] = useState( false )
	const [ engLev, setEngLev ] = useState( false )
	const [ engRef, setEngRef ] = useState( false )
	const [ engResi, setEngResi ] = useState( false )
	const [ modEsp, setModEsp ] = useState( false )
	const [ status, setStatus ] = useState( true )
	const [ tablecalc, setTablecalc ] = useState( "0.30" )
	const [ maxPg, setMaxpg ] = useState( "0" )
	const [ forpg, setForpg ] = useState( "desconto" )
	const [ frete, setFrete ] = useState( "FOB" )
	const [ Razao, setRazao ] = useState( "" )
	const [ Responsavel, setResponsavel ] = useState<any>( [] )
	const [ ENVIO, setENVIO ] = useState( "" )
	const [ Inatividade, setInatividade ] = useState<number>( 60 )
	const [ ID, setID ] = useState<string>( '' )
	const [ Autorize, setAutorize ] = useState( false )
	const [ Block, setBlock ] = useState( false )
	const [ load, setload ] = useState( false )
	const [ History, setHistory ] = useState( [] )
	const toast = useToast()

	if ( props.envio && !ENVIO ) {
		setENVIO( props.envio )
	}

	useEffect( () => {
		if ( emailNfe === "" ) {
			toast( {
				title: 'ATENÇÃO!',
				description: "Preencher o campo E-mail NF-e é OBRIGATÓRIO.",
				status: 'warning',
				duration: 9000,
				isClosable: true,
			} )
		}
	}, [] )

	useEffect( () => {
		localStorage.removeItem( 'idRetorno' )
		if ( props.data ) {
			setload( true )
			const empresa = props.data
			setResponsavel( empresa.attributes?.representantes )
			const IdEmpresa = empresa.id.toString()
			setID( IdEmpresa )
			setCNPJ( empresa.attributes?.CNPJ )
			setAutorize( props.data ? true : false )
			const cnpj = empresa.attributes?.CNPJ
			setMaskCNPJ( mask( cnpj, [ "99.999.999/9999-99" ] ) )
			setNome( empresa.attributes?.nome )
			setFantasia( empresa.attributes?.fantasia )
			setHistory( empresa.attributes?.history )
			setRazao( empresa.attributes?.razao )
			setTipoPessoa( empresa.attributes?.tipoPessoa )
			setFone( empresa.attributes?.fone === null ? '' : empresa.attributes?.fone )
			setCelular( empresa.attributes?.celular === null ? "" : empresa.attributes?.celular )
			setEmail( empresa.attributes?.email )
			setEmailNfe( empresa.attributes?.emailNfe )
			setIeStatus( empresa.attributes?.ieStatus )
			setCNAE( empresa.attributes?.CNAE )
			setIE( empresa.attributes?.Ie )
			setPorte( empresa.attributes?.porte )
			setSimples( empresa.attributes?.simples )
			setSite( empresa.attributes?.site )
			setEndereco( capitalizeWords( empresa.attributes?.endereco ) )
			setNumero( empresa.attributes?.numero )
			setBairro( capitalizeWords( empresa.attributes?.bairro ) )
			setComplemento( capitalizeWords( empresa.attributes?.complemento ) )
			setCidade( capitalizeWords( empresa.attributes?.cidade ) )
			setUf( empresa.attributes?.uf )
			setCep( empresa.attributes?.cep )
			setPais( empresa.attributes?.pais )
			setCodpais( empresa.attributes?.codpais )
			setAdFragilLat( empresa.attributes?.adFrailLat )
			setAdFragilCab( empresa.attributes?.adFrailCab )
			setAdEspecialLat( empresa.attributes?.adEspecialLat )
			setAdEspecialCab( empresa.attributes?.adEspecialCab )
			setLatFCab( empresa.attributes?.latFCab )
			setCabChao( empresa.attributes?.cabChao )
			setCabTop( empresa.attributes?.cabTop )
			setCxEco( empresa.attributes?.cxEco )
			setCxEst( empresa.attributes?.cxEst )
			setCxLev( empresa.attributes?.cxLev )
			setCxRef( empresa.attributes?.cxRef )
			setCxSupRef( empresa.attributes?.cxSupRef )
			setPlatSMed( empresa.attributes?.platSMed )
			setCxResi( empresa.attributes?.cxResi )
			setEngEco( empresa.attributes?.engEco )
			setEngLev( empresa.attributes?.engLev )
			setEngRef( empresa.attributes?.engRef )
			setEngResi( empresa.attributes?.engResi )
			setTablecalc( empresa.attributes?.tablecalc )
			setMaxpg( empresa.attributes?.maxPg )
			setForpg( empresa.attributes?.forpg )
			setFrete( empresa.attributes?.frete )
			setStatus( empresa.attributes?.status )
			setModEsp( empresa.attributes?.modEsp )
			setload( false )
		}
	}, [ props.data ] )

	const consulta = async () => {
		if ( CNPJ ) {
			const Data = await GetCnpj( CNPJ )
			const teset = await axios( `/api/db/empresas/getCnpj/${ CNPJ }` )
			const [ response ] = teset.data
			const userProps = response?.attributes?.user.data
			const vendedor = userProps?.attributes?.username
			if ( vendedor ) {
				if ( session?.user.pemission !== 'Adm' && session?.user.name !== vendedor ) {
					toast( {
						render: () => (
							<Box color='white' py={ 1 } px={ 3 } bg='yellow.600' textAlign={ 'center' } rounded={ 8 }>
								<chakra.p>{ response.attributes.nome }</chakra.p>
								<chakra.p>CNPJ: { response.attributes.CNPJ }</chakra.p>
								<chakra.p> Carteira: { vendedor }</chakra.p>
							</Box>
						),
						status: 'warning',
						duration: 9000,
						isClosable: true,
						position: 'top',
					} )
					setTimeout( () => router.push( "/empresas/" ), 5000 )
				}
			} else if ( teset.data.length === 0 ) {
				setAutorize( true )
			} else {
				toast( {
					render: () => (
						<Box color='white' py={ 1 } px={ 3 } bg='yellow.600' textAlign={ 'center' } rounded={ 8 }>
							<chakra.p>{ response.attributes.nome }</chakra.p>
							<chakra.p>CNPJ: { response.attributes.CNPJ }</chakra.p>
							<chakra.p> Carteira: sem vendedor</chakra.p>
						</Box>
					),
					status: 'warning',
					duration: 9000,
					isClosable: true,
					position: 'top',
				} )
			}

			setRazao( Data.razao_social )
			setFantasia( Data.estabelecimento.nome_fantasia )
			setTipoPessoa( 'cnpj' )
			setIE( Data.estabelecimento?.inscricoes_estaduais[ 0 ]?.inscricao_estadual )
			setIeStatus( Data.estabelecimento?.inscricoes_estaduais[ 0 ]?.ativo )
			const end = capitalizeWords( Data.estabelecimento?.tipo_logradouro + " " + Data.estabelecimento?.logradouro )
			setEndereco( end === 'Undefined Undefined' ? "" : end )
			setNumero( Data.estabelecimento?.numero )
			setComplemento( capitalizeWords( Data.estabelecimento?.complemento ) )
			setBairro( capitalizeWords( Data.estabelecimento?.bairro ) )
			setCep( Data.estabelecimento?.cep )
			setCidade( capitalizeWords( Data.estabelecimento?.cidade.nome ) )
			setUf( Data.estabelecimento?.estado.sigla )
			let ddd = !Data.estabelecimento?.ddd1 ? '' : Data.estabelecimento?.ddd1
			let tel1 = !Data.estabelecimento.telefone1 ? "" : Data.estabelecimento.telefone1
			setFone( ddd + tel1 )
			setEmail( Data.estabelecimento?.email )
			setPais( Data.estabelecimento?.pais.nome )
			setCodpais( Data.estabelecimento?.pais.id )
			setCNAE( Data.estabelecimento?.atividade_principal.id )
			setPorte( Data.porte?.descricao )
			const cheksimples = Data.simples?.simples === 'Sim' ? true : false
			setSimples( cheksimples )
		}
	}


	const save = async () => {
		if ( nome === "" ) {
			toast( {
				title: 'Ooopss!',
				description: "Nome da empresa não pode estar vazio",
				status: 'warning',
				duration: 9000,
				isClosable: true,
			} )
		} else if ( emailNfe === "" ) {
			toast( {
				title: 'Ooopss!',
				description: "O campo E-mail NFe não pode estar vazio",
				status: 'warning',
				duration: 9000,
				isClosable: true,
			} )
		} else {
			setBlock( true )
			setload( true )
			const date = new Date()
			const dateIsso = date.toISOString()
			const historico = ENVIO === 'POST' ? [
				{
					date: dateIsso,
					vendedor: session?.user.name,
					msg: `Empresa ${ nome } foi cadastrado`,
				},
			] : [
				{
					date: dateIsso,
					vendedor: session?.user.name,
					msg: `Empresa ${ nome } foi atualizado`,
				},
			]

			const dataUpdate = {
				data: {
					nome,
					fantasia,
					tipoPessoa,
					endereco,
					numero,
					complemento,
					bairro,
					cep,
					cidade,
					uf,
					fone,
					celular,
					email,
					emailNfe: emailNfe,
					site,
					CNPJ,
					Ie,
					pais,
					codpais,
					CNAE,
					porte,
					simples,
					ieStatus,
					status,
					adFrailLat,
					adFrailCab,
					adEspecialLat,
					adEspecialCab,
					latFCab,
					cabChao,
					cabTop,
					cxEco,
					cxEst,
					cxLev,
					cxRef,
					cxSupRef,
					platSMed,
					cxResi,
					engEco,
					engLev,
					engRef,
					engResi,
					modEsp,
					tablecalc,
					maxPg: ENVIO === 'POST' ? '0' : maxPg,
					forpg: ENVIO === 'POST' ? 'Antecipado' : forpg,
					frete,
					contribuinte: contribuinte,
					representantes: Responsavel,
					inativOk: Inatividade,
					razao: Razao,
					history: History.length === 0 ? historico : [ ...History, ...historico ],
					...( session?.user.pemission === 'User' && {
						user: {
							id: session?.user.id,
						},
						vendedor: session?.user.name,
						vendedorId: String( session?.user.id ),
					} )
				},
			}

			if ( ENVIO === 'POST' ) {
				console.log( "FOOIII" )
				const url = `/api/db/empresas/post?Email=${ session?.user.email }&Vendedor=${ session?.user.name }`
				await axios( {
					method: 'POST',
					url: url,
					data: dataUpdate,
				} )
					.then( ( response ) => {
						toast( {
							title: "Cliente criado com sucesso",
							status: "success",
							duration: 3000,
							isClosable: true,
						} )
						router.push( '/empresas' )
					} )
					.catch( ( err ) => {
						console.error( err )
						setBlock( false )
						setload( false )
					} )
			} else {
				const EMPRESAID = router.query.id
				const url = `/api/db/empresas/atualizacao/${ EMPRESAID }?Email=${ session?.user.email }&Vendedor=${ session?.user.name }`
				await axios( {
					method: 'PUT',
					url: url,
					data: dataUpdate,
				} )
					.then( ( response ) => {
						toast( {
							title: 'Cliente atualizado',
							status: 'success',
							duration: 2000,
							isClosable: true,
						} )
						router.push( '/empresas' )
						return response.data
					} )
					.catch( ( err ) => {
						console.error( err )
						setBlock( false )
						setload( false )
					} )
			}
		};
	}

	const resetData = ( data: any ) => {

		setNome( data.attributes.dados.data.nome )
		setFantasia( data.attributes.dados.data.fantasia )
		setHistory( data.attributes.dados.data.history )
		setRazao( data.attributes.dados.data.razao )
		setTipoPessoa( data.attributes.dados.data.tipoPessoa )
		setFone( data.attributes.dados.data.fone === null ? '' : data.attributes.dados.data.fone )
		setCelular( data.attributes.dados.data.celular === null ? "" : data.attributes.dados.data.celular )
		setEmail( data.attributes.dados.data.email )
		setEmailNfe( data.attributes.dados.data.emailNfe )
		setIeStatus( data.attributes.dados.data.ieStatus )
		setCNAE( data.attributes.dados.data.CNAE )
		setIE( data.attributes.dados.data.Ie )
		setPorte( data.attributes.dados.data.porte )
		setSimples( data.attributes.dados.data.simples )
		setSite( data.attributes.dados.data.site )
		setEndereco( capitalizeWords( data.attributes.dados.data.endereco ) )
		setNumero( data.attributes.dados.data.numero )
		setBairro( capitalizeWords( data.attributes.dados.data.bairro ) )
		setComplemento( capitalizeWords( data.attributes.dados.data.complemento ) )
		setCidade( capitalizeWords( data.attributes.dados.data.cidade ) )
		setUf( data.attributes.dados.data.uf )
		setCep( data.attributes.dados.data.cep )
		setPais( data.attributes.dados.data.pais )
		setCodpais( data.attributes.dados.data.codpais )
		setAdFragilLat( data.attributes.dados.data.adFrailLat )
		setAdFragilCab( data.attributes.dados.data.adFrailCab )
		setAdEspecialLat( data.attributes.dados.data.adEspecialLat )
		setAdEspecialCab( data.attributes.dados.data.adEspecialCab )
		setLatFCab( data.attributes.dados.data.latFCab )
		setCabChao( data.attributes.dados.data.cabChao )
		setCabTop( data.attributes.dados.data.cabTop )
		setCxEco( data.attributes.dados.data.cxEco )
		setCxEst( data.attributes.dados.data.cxEst )
		setCxLev( data.attributes.dados.data.cxLev )
		setCxRef( data.attributes.dados.data.cxRef )
		setCxSupRef( data.attributes.dados.data.cxSupRef )
		setPlatSMed( data.attributes.dados.data.platSMed )
		setCxResi( data.attributes.dados.data.cxResi )
		setEngEco( data.attributes.dados.data.engEco )
		setEngLev( data.attributes.dados.data.engLev )
		setEngRef( data.attributes.dados.data.engRef )
		setEngResi( data.attributes.dados.data.engResi )
		setTablecalc( data.attributes.dados.data.tablecalc )
		setMaxpg( data.attributes.dados.data.maxPg )
		setForpg( data.attributes.dados.data.forpg )
		setFrete( data.attributes.dados.data.frete )
		setStatus( data.attributes.dados.data.status )
		setModEsp( data.attributes.dados.data.modEsp )
	}


	function getResponsavel ( respons: React.SetStateAction<string> ) {
		setResponsavel( respons )
	}

	const maskCnpj = ( e: any ) => {
		const valor = e.target.value
		const valorLinpo = unMask( valor )
		const masked = mask( valorLinpo, [ "99.999.999/9999-99" ] )
		setCNPJ( valorLinpo )
		setMaskCNPJ( masked )
	}

	const WhatsAppMask = ( e: any ) => {
		const valor = e.target.value
		const valorLinpo = unMask( valor )
		const masked = mask( valorLinpo, [ "(99) 9 9999-9999" ] )
		setCelular( valorLinpo )
		setWhatsMask( masked )
	}

	if ( load ) {
		return (
			<Box w={ '100%' } h={ '100%' } bg="gray.800">
				<Loading size="200px">Carregando...</Loading>
			</Box>
		)
	}

	const RetornoMaxpg = ( maxpg: React.SetStateAction<string> ) => {
		setMaxpg( maxpg )
	}

	const RetornoFormapg = ( Formapg: React.SetStateAction<string> ) => {
		setForpg( Formapg )
	}


	return (
		<>
			<Box

				bg="gray.800"
				p={ 5 }
				pt={ { base: '5rem', sm: '5rem', md: '2rem', '2xl': '2rem' } }
				display={ "flex" }
				justifyContent={ "center" }
				alignItems={ "center" }
				overflowY={ 'auto' }
			>
				<Box>
					<SimpleGrid
						display={ {
							base: "initial",
							md: "grid",
						} }
						columns={ {
							md: 1,
						} }
						spacing={ {
							md: 6,
						} }
						bg="gray.800"
						h='100%'
					>
						<GridItem

							colSpan={ {
								md: 2,
							} }
							h='100%'
						>
							<chakra.form
								h={ '100%' }
								method="POST"
								color='white'
								bg='#ffffff12'
								p={ 5 }
								mt={ { md: '10rem', lg: 0, xl: '1rem', '2xl': '0' } }
								rounded={ 5 }
								overflow={ {
									sm: "hidden",
								} }
							>
								<Stack
									px={ 4 }
									py={ 3 }
									spacing={ 3 }
								>
									<SimpleGrid columns={ 12 } spacing={ 3 }>
										<Heading as={ GridItem } colSpan={ 12 } size="md">
											Cadastro de Empresa
										</Heading>
									</SimpleGrid>
									<SimpleGrid columns={ 12 } spacing={ 3 }>
										<Heading as={ GridItem } colSpan={ 12 } size="sd">
											Dados da empresa
										</Heading>
										<FormControl as={ GridItem } colSpan={ [ 8, 5, null, 2 ] }>
											<FormLabel
												htmlFor="cnpj"
												fontSize="xs"
												fontWeight="md"
											>
												Cnpj
											</FormLabel>
											<Input
												type="text"
												focusBorderColor="#ffff"
												bg='#ffffff12'
												shadow="sm"
												size="xs"
												w="full"
												rounded="md"
												onChange={ maskCnpj }
												value={ MaskCNPJ }
												isDisabled={ session?.user.pemission !== 'Adm' && ENVIO === 'UPDATE' ? true : false }
											/>
										</FormControl>
										<Button
											as={ GridItem }
											colSpan={ [ 8, 4, null, 2 ] }
											h={ 8 }
											mt={ 5 }
											colorScheme="messenger"
											isDisabled={ session?.user.pemission !== 'Adm' && ENVIO === 'UPDATE' ? true : false }
											onClick={ consulta }
										>
											Buscar dados
										</Button>
										<Box ms={ 5 } mt={ 'auto' } hidden={ !props.data }>
											<Switch
												colorScheme="green"
												borderColor="gray.900"
												rounded="md"
												isChecked={ status }
												isDisabled={ session?.user.pemission !== 'Adm' && ENVIO === 'UPDATE' ? true : false }
												onChange={ ( e ) => setStatus( e.target.checked ) }
											/>
										</Box>
									</SimpleGrid>
								</Stack>

								{ !!Autorize && (
									<>
										<Stack
											px={ 4 }
											py={ 3 }>
											<SimpleGrid columns={ 9 } spacing={ 3 }>
												<FormControl as={ GridItem } colSpan={ [ 5, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Nome de exibição
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setNome( capitalizeWords( e.target.value ) ) }
														value={ nome }
														isDisabled={ session?.user.pemission !== 'Adm' && ENVIO === 'UPDATE' ? true : false }
													/>
												</FormControl>
												<FormControl as={ GridItem } colSpan={ [ 5, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Razão Social
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setRazao( capitalizeWords( e.target.value ) ) }
														value={ Razao }
													/>
												</FormControl>
												<FormControl as={ GridItem } colSpan={ [ 5, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Nome Fantasia
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setFantasia( capitalizeWords( e.target.value ) ) }
														value={ fantasia }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														E-mail
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setEmail( e.target.value ) }
														value={ email }
													/>
												</FormControl>
												<FormControl as={ GridItem } colSpan={ [ 6, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														CNAE
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setCNAE( e.target.value ) }
														value={ CNAE }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 1 ] }>
													<FormLabel
														htmlFor="ie"
														fontSize="xs"
														fontWeight="md"
													>
														IE
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setIE( e.target.value ) }
														value={ Ie }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 1 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														IE Status
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														value={ ( () => {
															const val =
																ieStatus === true && nome.length !== 0
																	? 'sim'
																	: ieStatus === false && nome.length !== 0
																		? 'não'
																		: ' '
															return val
														} )() }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 1 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														inatividade
													</FormLabel>
													<Input
														type="number"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														isDisabled={ session?.user.pemission === 'Adm' ? false : true }
														shadow="sm"
														size="xs"
														w="full"
														maxLength={ 3 }
														rounded="md"
														value={ Inatividade }
														onChange={ ( e ) => setInatividade( parseInt( e.target.value ) ) }
													/>
												</FormControl>
											</SimpleGrid>

											<SimpleGrid columns={ 12 } spacing={ 3 }>
												<FormControl as={ GridItem } colSpan={ [ 6, 2, 1 ] }>
													<FormLabel
														htmlFor="pais"
														fontSize="xs"
														fontWeight="md"
													>
														País
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setPais( capitalizeWords( e.target.value ) ) }
														value={ pais }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Cod.País
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setCodpais( e.target.value ) }
														value={ codpais }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 4, null, 3 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Endereço
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setEndereco( capitalizeWords( e.target.value ) ) }
														value={ endereco }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 1 ] }>
													<FormLabel
														htmlFor="numero"
														fontSize="xs"
														fontWeight="md"
													>
														N°
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setNumero( e.target.value ) }
														value={ numero }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Complemento
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setComplemento( e.target.value ) }
														value={ complemento }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 3, null, 3 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Bairro
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setBairro( capitalizeWords( e.target.value ) ) }
														value={ bairro }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 3, null, 1 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Cep
													</FormLabel>
													<Input
														type="text"

														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setCep( e.target.value ) }
														value={ cep }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 3, null, 2 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Cidade
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setCidade( capitalizeWords( e.target.value ) ) }
														value={ cidade }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 3, null, 1 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														UF.
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setUf( e.target.value ) }
														value={ uf }
													/>
												</FormControl>
												<FormControl as={ GridItem } colSpan={ [ 6, 4, null, 3 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Site
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setSite( e.target.value ) }
														value={ site }
													/>
												</FormControl>

												<FormControl as={ GridItem } colSpan={ [ 6, 4, null, 3 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														E-mail NF-e
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ ( e ) => setEmailNfe( e.target.value ) }
														value={ emailNfe }
													/>
												</FormControl>
												<FormControl as={ GridItem } colSpan={ [ 6, 4, null, 3 ] }>
													<FormLabel
														htmlFor="cidade"
														fontSize="xs"
														fontWeight="md"
													>
														Whatsapp
													</FormLabel>
													<Input
														type="text"
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														rounded="md"
														onChange={ WhatsAppMask }
														value={ WhatsMask }
													/>
												</FormControl>
												<FormControl as={ GridItem } colSpan={ [ 6, 4, null, 3 ] }>
													<FormLabel
														fontSize="xs"
														fontWeight="md"
													>
														Contribuinte
													</FormLabel>
													<Select
														focusBorderColor="#ffff"
														bg='#ffffff12'
														shadow="sm"
														size="xs"
														w="full"
														fontSize="xs"
														rounded="md"
														placeholder="Selecione uma opção"
														onChange={ ( e ) => setContribuinte( e.target.value ) }
														value={ contribuinte }
													>
														<option style={ { backgroundColor: "#1A202C" } } value="1">Contribuinte ICMS</option>
														<option style={ { backgroundColor: "#1A202C" } } value="2">Contribuinte isento do ICMS</option>
														<option style={ { backgroundColor: "#1A202C" } } value="9">Não contribuinte</option>
													</Select>
												</FormControl>
											</SimpleGrid>
										</Stack>
										<Stack
											px={ 4 }
											py={ 3 }
											spacing={ 3 }
										>
											{ session?.user.pemission === 'Adm' && (
												<>
													<SimpleGrid columns={ 12 } spacing={ 3 }>
														<Heading as={ GridItem } colSpan={ 12 } size="sd">
															Configurações da Empresa
														</Heading>

														<FormControl as={ GridItem } colSpan={ [ 6, 3 ] }>
															<FormLabel
																fontSize="xs"
																fontWeight="md"
															>
																Tabela de cálculo
															</FormLabel>
															<Select
																focusBorderColor="#ffff"
																bg='#ffffff12'
																shadow="sm"
																size="xs"
																w="full"
																fontSize="xs"
																rounded="md"
																onChange={ ( e ) => setTablecalc( e.target.value ) }
																value={ tablecalc }
															>
																<option style={ { backgroundColor: "#1A202C" } } value="">Selecione uma opção</option>
																<option style={ { backgroundColor: "#1A202C" } } selected value="0.30">Balcão</option>
																<option style={ { backgroundColor: "#1A202C" } } value="0.26" selected>
																	Vip
																</option>
																<option style={ { backgroundColor: "#1A202C" } } value="0.23">Bronze</option>
																<option style={ { backgroundColor: "#1A202C" } } value="0.20">Prata</option>
																<option style={ { backgroundColor: "#1A202C" } } value="0.17">Ouro</option>
																<option style={ { backgroundColor: "#1A202C" } } value="0.14">Platinum</option>
															</Select>
														</FormControl>

														<FormControl hidden={ session?.user.pemission === 'Adm' ? false : true } as={ GridItem } colSpan={ [ 6, 3 ] }>
															<PrazoPg id={ ID } retorno={ maxPg } envio={ RetornoMaxpg } />
														</FormControl>

														<FormControl as={ GridItem } colSpan={ [ 6, 4 ] }>
															<FormaPg id={ ID } retorno={ forpg } envio={ RetornoFormapg } />
														</FormControl>

														<FormControl as={ GridItem } colSpan={ [ 6, 2 ] }>
															<FormLabel
																htmlFor="frete"
																fontSize="xs"
																fontWeight="md"

															>
																Frete
															</FormLabel>
															<Select

																focusBorderColor="#ffff"
																bg='#ffffff12'
																shadow="sm"
																size="xs"
																w="full"
																fontSize="xs"
																rounded="md"
																onChange={ ( e ) => setFrete( e.target.value ) }
																value={ frete }
															>
																<option style={ { backgroundColor: "#1A202C" } }>Escolha uma opção</option>
																<option style={ { backgroundColor: "#1A202C" } } selected value="FOB">FOB - Por conta do cliente</option>
																<option style={ { backgroundColor: "#1A202C" } } value="CIF">CIF - Por conta da Ribermax</option>
															</Select>
														</FormControl>

														<FormControl as={ GridItem } colSpan={ [ 6, 3 ] }>
															<RestData CNPJ={ CNPJ } onRetorno={ resetData } />
														</FormControl>
													</SimpleGrid>
												</>
											) }

											<SimpleGrid columns={ 12 } spacing={ 3 } mb={ 5 }>
												<Heading as={ GridItem } colSpan={ 12 } size="sd">
													Dados de contato
												</Heading>
												<FormControl as={ GridItem } colSpan={ [ 6, 3, 4, 3 ] }>
													<Flex flexDir={ 'row' } alignItems={ 'self-end' } gap={ 5 }>
														<CompPessoa
															Resp={ router.query.id }
															onAddResp={ getResponsavel }
															cnpj={ CNPJ }
														/>

													</Flex>
												</FormControl>

											</SimpleGrid>
											<SimpleGrid columns={ 12 } spacing={ 5 }>
												<Heading as={ GridItem } colSpan={ 12 } mb={ 3 } size="sd">
													Configurações de Embalagens
												</Heading>
												{ confgEnb.map( ( item ) => {
													const val =
														item.id === "12"
															? adFrailLat
															: item.id === "13"
																? adFrailCab
																: item.id === "14"
																	? adEspecialLat
																	: item.id === "15"
																		? adEspecialCab
																		: item.id === "16"
																			? latFCab
																			: item.id === "17"
																				? cabChao
																				: cabTop

													return (
														<Box
															key={ item.id }
															as={ GridItem }
															colSpan={ [ 6, 3, null, 2 ] }
														>
															<Flex>
																<Flex alignItems="center" h={ 5 }>
																	<Switch
																		colorScheme="green"
																		borderColor="white"
																		bg='#ffffff12'
																		rounded="md"
																		isChecked={ val }
																		onChange={ ( e ) => {
																			const set =
																				item.id === "12"
																					? setAdFragilLat( e.target.checked )
																					: item.id === "13"
																						? setAdFragilCab( e.target.checked )
																						: item.id === "14"
																							? setAdEspecialLat( e.target.checked )
																							: item.id === "15"
																								? setAdEspecialCab( e.target.checked )
																								: item.id === "16"
																									? setLatFCab( e.target.checked )
																									: item.id === "17"
																										? setCabChao( e.target.checked )
																										: setCabTop( e.target.checked )
																			return set
																		} }
																	/>
																</Flex>
																<Box ml={ 3 } fontSize="xs">
																	<chakra.label
																		fontWeight="md"

																		_dark={ {
																			color: "gray.50",
																		} }
																	>
																		{ item.title }
																	</chakra.label>
																</Box>
															</Flex>
														</Box>
													)
												} ) }
											</SimpleGrid>

											<SimpleGrid columns={ 12 } spacing={ 5 }>
												<Heading as={ GridItem } colSpan={ 12 } mb={ 5 } size="sd">
													Modelos de Caixas
												</Heading>
												{ modCaix.map( ( item ) => {

													const val =
														item.id === "1"
															? cxEco
															: item.id === "2"
																? cxEst
																: item.id === "3"
																	? cxLev
																	: item.id === "4"
																		? cxRef
																		: item.id === "5"
																			? cxSupRef
																			: item.id === "6"
																				? platSMed
																				: item.id === "7"
																					? cxResi
																					: item.id === "8"
																						? engEco
																						: item.id === "9"
																							? engLev
																							: item.id === "10"
																								? engRef
																								: item.id === "11"
																									? engResi
																									: modEsp
													return (
														<Box
															key={ item.id }
															as={ GridItem }
															colSpan={ [ 6, 3, null, 2 ] }
														>
															<Flex>
																<Flex alignItems="center" h={ 5 }>
																	<Switch
																		colorScheme="green"
																		borderColor="white"
																		bg='#ffffff12'
																		_invalid={ {
																			bg: '#ffffff12'
																		} }
																		rounded="md"
																		isChecked={ val || false }
																		onChange={ ( e ) => {
																			const set: any =
																				item.id === "1"
																					? setCxEco
																					: item.id === "2"
																						? setCxEst
																						: item.id === "3"
																							? setCxLev
																							: item.id === "4"
																								? setCxRef
																								: item.id === "5"
																									? setCxSupRef
																									: item.id === "6"
																										? setPlatSMed
																										: item.id === "7"
																											? setCxResi
																											: item.id === "8"
																												? setEngEco
																												: item.id === "9"
																													? setEngLev
																													: item.id === "10"
																														? setEngRef
																														: item.id === "11"
																															? setEngResi
																															: setModEsp
																			if ( set ) {
																				set( e.target.checked )
																			}
																		} }
																	/>
																</Flex>

																<Box ml={ 3 } fontSize="xs">
																	<chakra.label
																		fontWeight="md"
																	>
																		{ item.title }
																	</chakra.label>
																</Box>
															</Flex>
														</Box>
													)
												} ) }
											</SimpleGrid>
										</Stack>
										<Box
											px={ {
												base: 4,
												sm: 6,
											} }
											textAlign="right"
										>
											<Button
												colorScheme="red"
												me={ 5 }
												fontWeight="md"
												onClick={ () => router.push( "/empresas/" ) }
											>
												Cancelar
											</Button>
											<Button
												colorScheme="whatsapp"
												fontWeight="md"
												onClick={ save }
												isDisabled={ Block }
											>
												Save
											</Button>
										</Box>
									</>
								) }

							</chakra.form>
						</GridItem>
					</SimpleGrid>
				</Box>
			</Box >
		</>
	)
}
