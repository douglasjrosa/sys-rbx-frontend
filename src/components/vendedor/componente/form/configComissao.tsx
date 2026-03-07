import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	useToast,
} from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"

const CURRENT_MONTH = new Date().getMonth() + 1
const CURRENT_YEAR = new Date().getFullYear()

export const ConfigComissao = ( props: { id: any; update: () => void } ) => {
	const IDVendedor = props.id
	const toast = useToast()
	const [ Ano, setAno ] = useState( String( CURRENT_YEAR ) )
	const [ Mes, setMes ] = useState( String( CURRENT_MONTH ) )
	const [ Meta, setMeta ] = useState( "" )
	const [ Salario, setSalario ] = useState( "" )
	const [ Vendedor, setVendedor ] = useState<{ id: number; name: string } | null>( null )
	const [ Bloq, setBloq ] = useState( false )

	useEffect( () => {
		( async () => {
			try {
				const res = await axios.get( `/api/db/user/getId/${ IDVendedor }` )
				const v = res.data
				setVendedor( { id: v.id, name: v.username } )
			} catch ( err ) {
				// ignore
			}
		} )()
	}, [ IDVendedor ] )

	const salvar = async () => {
		if ( !Vendedor ) return
		setBloq( true )
		try {
			await axios.post( "/api/db/config-comissao/post", {
				ano: Ano,
				mes: Mes,
				meta: Meta ? parseFloat( String( Meta ).replace( ",", "." ) ) : 0,
				salario_fixo: Salario ? parseFloat( String( Salario ).replace( ",", "." ) ) : 0,
				vendedor: Vendedor.name,
				user: Vendedor.id,
			} )
			toast( { title: "Salvo com sucesso", status: "success", duration: 3000, isClosable: true } )
			setMeta( "" )
			setSalario( "" )
			props.update()
		} catch ( err: any ) {
			toast( {
				title: "Erro",
				description: err.response?.data?.message || "Erro ao salvar",
				status: "error",
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setBloq( false )
		}
	}

	return (
		<Flex w="100%" flexDir="column" justifyContent="space-between" p={ 3 }>
			<Box w="100%">
				<Heading size="md" mb={ 3 }>Comissão</Heading>
			</Box>
			<Flex gap={ 4 } w="100%" px={ 3 } flexWrap="wrap">
				<Box w="80px">
					<FormControl>
						<FormLabel fontSize="xs">Ano</FormLabel>
						<Input
							focusBorderColor="#ffff"
							bg="#ffffff12"
							shadow="sm"
							size="xs"
							w="full"
							fontSize="xs"
							rounded="md"
							type="number"
							value={ Ano }
							onChange={ ( e ) => setAno( e.target.value ) }
						/>
					</FormControl>
				</Box>
				<Box w="80px">
					<FormControl>
						<FormLabel fontSize="xs">Mês</FormLabel>
						<Input
							focusBorderColor="#ffff"
							bg="#ffffff12"
							shadow="sm"
							size="xs"
							w="full"
							fontSize="xs"
							rounded="md"
							type="number"
							min={ 1 }
							max={ 12 }
							value={ Mes }
							onChange={ ( e ) => setMes( e.target.value ) }
						/>
					</FormControl>
				</Box>
				<Box w="140px">
					<FormControl>
						<FormLabel fontSize="xs">Meta (R$)</FormLabel>
						<Input
							focusBorderColor="#ffff"
							bg="#ffffff12"
							shadow="sm"
							size="xs"
							w="full"
							fontSize="xs"
							rounded="md"
							type="number"
							placeholder="400000"
							value={ Meta }
							onChange={ ( e ) => setMeta( e.target.value ) }
						/>
					</FormControl>
				</Box>
				<Box w="140px">
					<FormControl>
						<FormLabel fontSize="xs">Salário fixo (R$)</FormLabel>
						<Input
							focusBorderColor="#ffff"
							bg="#ffffff12"
							shadow="sm"
							size="xs"
							w="full"
							fontSize="xs"
							rounded="md"
							type="number"
							placeholder="4000"
							value={ Salario }
							onChange={ ( e ) => setSalario( e.target.value ) }
						/>
					</FormControl>
				</Box>
				<Box alignSelf="flex-end" pb={ 1 }>
					<Button colorScheme="green" size="sm" isDisabled={ Bloq } onClick={ salvar }>
						Salvar
					</Button>
				</Box>
			</Flex>
		</Flex>
	)
}
