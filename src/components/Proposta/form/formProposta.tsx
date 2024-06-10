import Loading from "@/components/elements/loading"
import { LabelEmpresa } from "@/components/labelEmpresa"
import { ProdutiList } from "@/components/Proposta/produt"
import { TableConteudo } from "@/components/Proposta/tabela"
import { SetValue } from "@/function/currenteValor"
import { SetValueNumero } from "@/function/currentValorNumber"
import {
	Box,
	Button,
	chakra,
	Flex,
	FormLabel,
	Heading,
	Icon,
	IconButton,
	Input,
	Select,
	Table,
	TableContainer,
	Textarea,
	Th,
	Thead,
	Tr,
	useToast
} from "@chakra-ui/react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { SetStateAction, useCallback, useEffect, useState } from "react"
import { BsArrowLeftCircleFill, BsTrash } from "react-icons/bs"
import { customDateIso } from "@/utils/customDateFunctions"

export const FormProposta = ( props: { businessDataAttrs: any | null; prodList: any; ITENS: any } ) => {

	const router = useRouter()
	const { businessDataAttrs, prodList, ITENS } = props

	const today = customDateIso()

	const PEDIDO = router.query.pedido
	const NNegocio = router.query.negocio
	const { data: session } = useSession()
	const [ loadingTable, setLoadingTable ] = useState<boolean>( false )
	const [ loadingGeral, setLoadingGeral ] = useState<boolean>( false )
	const [ companyName, setCompanyName ] = useState( '' )
	const [ ListItens, setItens ] = useState<any>( [] )
	const [ orderDate, setOrderDate ] = useState( today )
	const [ deliverDate, setDeliverDate ] = useState( "" )
	const [ cnpj, setCnpj ] = useState( "" )
	const [ frete, setFrete ] = useState( "" )
	const [ freteCif, setFreteCif ] = useState<any>( '0.00' )
	const [ emitente, setEmitente ] = useState( "" )
	const [ DescontoAdd, setDescontoAdd ] = useState( "" )
	const [ saveNegocio, setSaveNegocio ] = useState( "" )
	const [ hirtori, setHistory ] = useState( [] )
	const [ MSG, setMSG ] = useState( [] )
	const [ obs, setObs ] = useState( "" )
	const [ Id, setId ] = useState( "" )
	const [ clientePedido, setClientePedido ] = useState( "" )
	const [ ENVIO, setEMVIO ] = useState( "" )
	const toast = useToast()

	const [ blingAccounts, setBlingAccounts ] = useState<any[]>()


	if ( props.ITENS && ListItens.length === 0 ) {
		setItens( props.ITENS )
	}

	useEffect( () => {
		if ( businessDataAttrs ) {
			const { empresa } = businessDataAttrs
			const empresaDataAttrs = empresa.data.attributes
			const [ proposta ] = businessDataAttrs.pedidos.data
			if ( proposta ) {
				const {
					id,
					dataPedido,
					dataEntrega,
					frete: propostaFrete,
					valorFrete,
					fornecedor,
					obs,
					cliente_pedido,
					descontoAdd
				} = proposta.attributes

				const verifiqueFrete = ENVIO === 'UPDATE' ? propostaFrete : empresaDataAttrs.frete

				setId( id )
				setFrete( verifiqueFrete )
				setOrderDate( dataPedido || today )
				setCompanyName( empresaDataAttrs.nome )
				setFreteCif( valorFrete )
				setEmitente( fornecedor )
				setObs( obs )
				setSaveNegocio( businessDataAttrs.nBusiness )
				setHistory( businessDataAttrs.history )
				setMSG( businessDataAttrs.incidentRecord )
				setClientePedido( cliente_pedido )
				setDeliverDate( dataEntrega )
				setCnpj( empresaDataAttrs.CNPJ )
				setDescontoAdd( descontoAdd ?? '0.00' )
			}
		}
	}, [ businessDataAttrs ] )



	const disbleProd = !deliverDate || !emitente || !frete ? false : true




	useEffect( () => {
		setItens(
			ListItens.map( ( f: any ) => {
				const valor = Number( f.vFinal.replace( ".", "" ).replace( ",", "." ) )
				const ValorGeral =
					Math.round( parseFloat( valor.toFixed( 2 ) ) * 100 ) / 100
				const TotalDesc = ValorGeral
				f.total = Math.round( parseFloat( TotalDesc.toFixed( 2 ) ) * 100 ) / 100
				const data = { ...f }
				return data
			} )
		)
	}, [] )


	const SalvarProdutos = async () => {
		setLoadingGeral( true )
		if ( !saveNegocio || saveNegocio === "" ) {
			setLoadingGeral( false )
			toast( {
				title: "Esta Faltando informação",
				description:
					"Você deve vincular essa proposta a um n° Business ou negocio",
				status: "warning",
				duration: 3000,
				isClosable: true,
			} )
		} else if ( !deliverDate ) {
			setLoadingGeral( false )
			toast( {
				title: "Esta Faltando informação",
				description:
					"Você deve preencher a data de entrega",
				status: "warning",
				duration: 3000,
				isClosable: true,
			} )
		} else {
			const Date5 = new Date()
			Date5.setDate( Date5.getDate() + 5 )
			const VencDate = `${ Date5.getUTCFullYear() }-${ Date5.getUTCMonth() + 1 < 10
				? "0" + ( Date5.getUTCMonth() + 1 )
				: Date5.getUTCMonth() + 1
				}-${ Date5.getUTCDate() < 10 ? "0" + Date5.getUTCDate() : Date5.getUTCDate()
				}`
			const VencDatePrint = `${ Date5.getUTCDate() < 10 ? "0" + Date5.getUTCDate() : Date5.getUTCDate()
				}/${ Date5.getUTCMonth() + 1 < 10
					? "0" + ( Date5.getUTCMonth() + 1 )
					: Date5.getUTCMonth() + 1
				}/${ Date5.getUTCFullYear() }`

			const id: any = localStorage.getItem( "id" )

			const ProdutosItems = await ListItens.map( ( i: any ) => {
				const valor2Original = i.vFinal.replace( ".", "" )
				const ValorProd = Number( valor2Original.replace( ",", "." ) )
				const ValorOriginal =
					Math.round( parseFloat( ValorProd.toFixed( 2 ) ) * 100 ) / 100
				const acrec =
					i.mont === true && i.expo === true
						? 1.2
						: i.expo === true && i.mont === false
							? 1.1
							: i.expo === false && i.mont === true
								? 1.1
								: 0
				const somaAcrescimo =
					acrec === 0 ? ValorOriginal * i.Qtd : ValorOriginal * acrec * i.Qtd
				const TotalItem = somaAcrescimo
				const result = Math.round( parseFloat( TotalItem.toFixed( 2 ) ) * 100 ) / 100

				return {
					...i,
					total: result,
				}
			} )


			const data: any = {
				nPedido: router.query.pedido,
				matriz: emitente,
				cliente: cnpj,
				clienteId: '????????',
				itens: ProdutosItems,
				empresa: emitente,
				dataPedido: orderDate,
				dataEntrega: new Date( deliverDate ).toISOString(),
				vencPedido: VencDate,
				vencPrint: VencDatePrint,
				condi: '????????',
				prazo: '????????',
				totalGeral: '????????',
				deconto: '????????',
				vendedor: session?.user.name,
				vendedorId: session?.user.id,
				frete: frete,
				valorFrete: freteCif,
				business: id,
				obs: obs,
				cliente_pedido: clientePedido,
				id: Id,
				hirtori: hirtori,
				incidentRecord: MSG,
				fornecedorId: session?.user.id,
				descontoAdd: DescontoAdd.toString(),
			}
			if ( ENVIO === 'POST' ) {

				const dadosPost = data
				const url = "/api/db/proposta/post"
				await axios( {
					method: "POST",
					url: url,
					data: dadosPost,
				} )
					.then( async ( res: any ) => {
						const date = new Date()
						const DateAtua = date.toISOString()

						const msg = {
							vendedor: session?.user.name,
							date: new Date().toISOString(),
							msg: `Vendedor ${ session?.user.name } criou essa proposta `,
						}
						const msg2 = {
							date: DateAtua,
							msg: `Proposta criada com o valor total ${ dadosPost.totalGeral } contendo ${ dadosPost.itens.length } items`,
							user: "Sistema",
						}

						const record = [ ...dadosPost.hirtori, msg ]
						const record2 = [ ...dadosPost.incidentRecord, msg2 ]

						const data = {
							data: {
								history: record,
								incidentRecord: record2,
								Budget: dadosPost.totalGeral
							},
						}

						await axios( {
							method: "PUT",
							url: "/api/db/business/put/id/" + NNegocio,
							data: data,
						} )

						toast( {
							title: "Proposta Criada",
							description: res.data.message,
							status: "success",
							duration: 1000,
							isClosable: true,
						} )

						router.push( `/negocios/${ NNegocio }` )
					} )
					.catch( ( err ) => {
						console.error( err.data )
					} )

			} else {

				const dadosPost = data
				const url = `/api/db/proposta/put/${ dadosPost.id }`
				await axios( {
					method: "PUT",
					url: url,
					data: dadosPost,
				} )
					.then( async ( res: any ) => {

						const date = new Date()
						const DateAtua = date.toISOString()

						const msg = {
							vendedor: session?.user.name,
							date: new Date().toISOString(),
							msg: `Vendedor ${ session?.user.name } atualizou essa proposta `,
						}

						const msg2 = {
							date: DateAtua,
							msg: `Proposta atualizada, valor total agora é ${ dadosPost.totalGeral }, passando a ter ${ dadosPost.itens.length } items`,
							user: "Sistema",
						}

						const record = [ ...dadosPost.hirtori, msg ]
						const record2 = [ ...dadosPost.incidentRecord, msg2 ]

						const data = {
							data: {
								history: record,
								incidentRecord: record2,
								Budget: 'totalValor' // ????????
							},
						}

						await axios( {
							method: "PUT",
							url: "/api/db/business/put/id/" + PEDIDO,
							data: data,
						} )
							.catch( ( err ) => console.error( err ) )

						router.push( `/negocios/${ PEDIDO }` )

						toast( {
							title: "Proposta Atualizada",
							description: res.data.message,
							status: "success",
							duration: 1000,
							isClosable: true,
						} )
					} )
					.catch( ( err: any ) => {
						setLoadingGeral( false )
					} )
			}

		}
	}


	function getIten ( resposta: SetStateAction<any> ) {
		const lista = ListItens
		const maxSum =
			ListItens.length > 0
				? Math.max( ...ListItens.map( ( obj: any ) => parseInt( obj.id ) + 1 ) )
				: 1
		resposta.id = maxSum
		const valor1 = Number( resposta.vFinal.replace( ".", "" ).replace( ",", "." ) )
		const ValorGeral = valor1
		const valor = Math.round( parseFloat( valor1.toFixed( 2 ) ) * 100 ) / 100
		resposta.total = Math.round( parseFloat( ValorGeral.toFixed( 2 ) ) * 100 ) / 100
		resposta.expo = false
		resposta.mont = false
		resposta.codg = resposta.prodId
		resposta.Qtd = 1
		const retorno = {
			...resposta,

			total: Math.round( parseFloat( valor.toFixed( 2 ) ) * 100 ) / 100,
		}
		const newItens = lista.map( ( f: any ) => ( {
			...f,
			expo: !f.expo ? false : f.expo > false ? f.expo : false,
			mont: !f.mont ? false : f.mont > false ? f.mont : false,
			Qtd: !f.Qtd ? 1 : f.Qtd > 1 ? f.Qtd : 1,
		} ) )
		const ListaRetorno: any = [ ...newItens, retorno ]
		setItens( ListaRetorno )
	}


	function getLoading ( load: SetStateAction<boolean> ) {
		setLoadingTable( load )
	}

	function getItemFinal ( itemFinal: SetStateAction<any> ): void {
		const filterItens = ListItens.filter( ( i: any ) => i.id !== itemFinal )
		setItens( filterItens )
	}


	if ( loadingGeral ) <Loading size="200px">Carregando...</Loading>

	const setFreteSave = ( e: any ) => {
		const Valor = e.target.value
		const valorLinpo = SetValue( Valor )
		setFreteCif( !valorLinpo ? '0,00' : valorLinpo )
	}

	const setAdddescont = ( e: any ) => {
		const Valor = e.target.value
		const sinal = Valor.split( "" )
		if ( !Valor ) {
			setDescontoAdd( '0,00' )
		} else if ( sinal[ 0 ] === '-' ) {
			const valorLinpo = SetValueNumero( Valor )
			setDescontoAdd( sinal[ 0 ] + valorLinpo )
		} else {
			const valorLinpo = SetValue( Valor )
			setDescontoAdd( valorLinpo )
		}
	}


	const fetchAccounts = useCallback( async () => {
		const response = await fetch( '/api/strapi/tokens' )

		if ( !response.ok ) console.error( response )

		const accounts = await response.json()

		const options = [ { attributes: { cnpj: '', account: 'Selecione um emitente' } }, ...accounts.data ]

		setBlingAccounts( options )
	}, [ setBlingAccounts ] )


	useEffect( () => {
		if ( !blingAccounts ) fetchAccounts()
	}, [ blingAccounts ] )

	return (
		<>
			<Flex h="100vh" w="100%" flexDir={ "column" } px={ '5' } py={ 1 } bg={ 'gray.800' } color={ 'white' } justifyContent={ 'space-between' } >
				<Box w="100%" bg={ 'gray.800' } mt={ 3 }>
					<Flex gap={ 3 } alignItems={ 'center' }>
						<IconButton aria-label='voltar' rounded={ '3xl' } onClick={ () => router.back() } icon={ <BsArrowLeftCircleFill size={ 30 } color="#136dcc" /> } />
						<Heading size="md">Proposta comercial</Heading>
					</Flex>
					<Box display="flex" flexWrap={ 'wrap' } gap={ 5 } alignItems="center" mt={ 3 } mx={ 5 }>
						<Box me={ 2 }>
							<LabelEmpresa companyName={ companyName } />
						</Box>
						<Box>
							<FormLabel
								fontSize="xs"
								fontWeight="md"
							>
								Data
							</FormLabel>
							<Input
								shadow="sm"
								type={ "date" }
								size="xs"
								w="28"
								fontSize="xs"
								rounded="md"
								readOnly={ true }
								onChange={ ( e ) => setOrderDate( e.target.value ) }
								value={ orderDate }
							/>
						</Box>
						<Box>
							<FormLabel
								fontSize="xs"
								fontWeight="md"
							>
								Data Entrega
							</FormLabel>
							<Input
								shadow="sm"
								type={ "date" }
								color={ 'white' }
								size="xs"
								w="28"
								fontSize="xs"
								rounded="md"
								onChange={ ( e ) => setDeliverDate( e.target.value ) }
								value={ deliverDate }
							/>
						</Box>
						<Box>
							<FormLabel
								fontSize="xs"
								fontWeight="md"
							>
								Emitente
							</FormLabel>
							{ blingAccounts &&
								<Select
									shadow="sm"
									size="xs"
									w="28"
									fontSize="xs"
									rounded="md"
									onChange={ ( e ) => setEmitente( e.target.value ) }
									value={ emitente }
									defaultValue=''
								>
									{ blingAccounts.map( ( blingAccount: any, key ) => (
										<option
											key={ `blingAccount${ key }` }
											style={ { backgroundColor: "#1A202C" } }
											value={ blingAccount.attributes.cnpj }
										>
											{ blingAccount.attributes.account }
										</option>
									) ) }
								</Select>
							}
						</Box>
						{
							/*
								<Box>
									<SetFormaPg id={ empresa.data.id } retorno={ prazo } envio={ setPrazoRetorno } Disable={ RegistroForgpg && session?.user.pemission !== 'Adm' ? true : false } />
								</Box>
							}
							{ prazo === "A Prazo" && getPrazo && empresa.data.id && tipoprazo &&
								<Box>
									<GetPrazoPg envio={ getPrazo } id={ empresa.data.id } retorno={ tipoprazo } />
								</Box>
							*/
						}
						<Box>
							<FormLabel
								fontSize="xs"
								fontWeight="md"
							>
								Frete
							</FormLabel>
							<Select
								shadow="sm"
								size="xs"
								w="24"
								fontSize="xs"
								rounded="md"
								onChange={ ( e ) => setFrete( e.target.value ) }
								value={ frete }
							>
								<option style={ { backgroundColor: "#1A202C" } } value="FOB">FOB</option>
								<option style={ { backgroundColor: "#1A202C" } } value="CIF">CIF</option>
							</Select>
						</Box>
						<Box hidden={ frete === "CIF" ? false : true }>
							<FormLabel
								fontSize="xs"
								fontWeight="md"
							>
								Valor de Frete
							</FormLabel>
							<Input
								type="text"
								textAlign={ "end" }
								size="xs"
								w={ 24 }
								step={ '0.01' }
								fontSize="xs"
								rounded="md"
								onChange={ setFreteSave }
								value={ freteCif }
							/>
						</Box>
						{ session?.user.pemission !== 'Adm' ? null : (
							<>
								<Box>
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										Desconto Adicional
									</FormLabel>
									<Input
										type="text"
										textAlign={ "end" }
										size="xs"
										w={ 24 }
										fontSize="xs"
										rounded="md"
										onChange={ setAdddescont }
										value={ DescontoAdd }
									/>
								</Box>
							</>
						) }
					</Box>
					<Box mt={ 4 }>
						<Heading size="sm">Itens da proposta comercial</Heading>
					</Box>
					<Box display="flex" gap={ 5 } alignItems="center" mt={ 3 } mx={ 5 }>
						{ !disbleProd && ( <Box w={ "300px" } /> ) }
						{ !!disbleProd && (
							<Box w={ "300px" } alignItems="center" >
								<ProdutiList Lista={ prodList } Retorno={ getIten } Reload={ getLoading }
								/>
							</Box>
						) }
						<Box alignItems="center">
							<FormLabel
								fontSize="xs"
								fontWeight="md"
							>
								Pedido do Cliente N°:
							</FormLabel>
							<Input
								shadow="sm"
								type={ "text" }
								size="xs"
								w="32"
								fontSize="xs"
								rounded="md"
								onChange={ ( e ) => setClientePedido( e.target.value ) }
								value={ clientePedido }
							/>
						</Box>
						<Box w={ "40rem" }>
							<Box display="flex" gap={ 5 } alignItems="center">
								<Box w="full">
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										Observação
									</FormLabel>
									<Textarea
										w="full"
										h={ "10" }
										onChange={ ( e ) => setObs( e.target.value ) }
										placeholder="Breve descrição sobre o andamento"
										size="xs"
										value={ obs }
									/>
								</Box>
							</Box>
						</Box>
					</Box>
					<Box mt={ 8 } w={ "100%" } mb={ 5 } bg={ 'gray.800' }>
						<Box>
							<TableContainer>
								<Table variant='simple'>
									<Thead>
										<Tr bg={ '#ffffff12' }>
											<Th px='0' w={ "1.3rem" }></Th>
											<Th px='0' w={ "10rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>Item</Th>
											<Th px='0' w={ "5rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												Código
											</Th>
											<Th px='0' w={ "3rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												Qtd
											</Th>
											<Th px='0' w={ "5rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												altura
											</Th>
											<Th px='0' w={ "5rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												largura
											</Th>
											<Th px='0' w={ "5rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												comprimento
											</Th>
											<Th px='0' w={ "3rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												Mont.
											</Th>
											<Th px='0' w={ "3rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												Expo.
											</Th>
											<Th px='0' w={ "6rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												Preço un
											</Th>
											<Th px='0' w={ "6rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
												Preço total
											</Th>
											<Th px='0' textAlign={ "center" } w={ "5rem" }>
												<Icon as={ BsTrash } boxSize={ 4 } color={ "whatsapp.600" } />
											</Th>
										</Tr>
									</Thead>
									<TableConteudo
										Itens={ ListItens }
										loading={ loadingTable }
										returnItem={ getItemFinal }
									/>
								</Table>
							</TableContainer>
						</Box>
					</Box>
				</Box>
				<Box display={ "flex" } justifyContent={ "space-between" } me={ 10 } mb={ 5 } bg={ 'gray.800' }>
					<Flex gap={ 20 }>
						<chakra.p>
							Total de itens: { !ListItens ? "" : ListItens.length }
						</chakra.p>
						<chakra.p>
							Frete:{ " " }
							{ !freteCif || freteCif === "" ? "R$ 0,00" : parseFloat( freteCif.replace( ".", "" ).replace( ',', '.' ) ).toLocaleString( "pt-br", {
								style: "currency",
								currency: "BRL",
							} ) }
						</chakra.p>
						<chakra.p>Desconto: { '????????' }</chakra.p>
						<chakra.p>Valor Total: { '????????' }</chakra.p>
					</Flex>
					<Button colorScheme={ "whatsapp" } onClick={ SalvarProdutos } isDisabled={ loadingTable }>
						Salvar Proposta
					</Button>
				</Box>
			</Flex>
		</>
	)
}
