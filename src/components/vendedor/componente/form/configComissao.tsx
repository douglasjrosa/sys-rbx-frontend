import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Grid,
	Input,
	useToast,
} from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"
import {
	CommissionDeduction,
	CommissionMilestone,
	DEFAULT_BASE_RATE,
	DEFAULT_MILESTONES,
} from "@/utils/commissionCalculator"
import { DeductionEditor } from "./DeductionEditor"
import { MilestoneEditor } from "./MilestoneEditor"

const CURRENT_MONTH = new Date().getMonth() + 1
const CURRENT_YEAR = new Date().getFullYear()

export const ConfigComissao = ( props: { id: any; update: () => void } ) => {
	const IDVendedor = props.id
	const toast = useToast()
	const [ Ano, setAno ] = useState( String( CURRENT_YEAR ) )
	const [ Mes, setMes ] = useState( String( CURRENT_MONTH ) )
	const [ Meta, setMeta ] = useState( "400000" )
	const [ Salario, setSalario ] = useState( "4000" )
	const [ BaseRate, setBaseRate ] = useState( String( DEFAULT_BASE_RATE ) )
	const [ Milestones, setMilestones ] = useState<CommissionMilestone[]>( [ ...DEFAULT_MILESTONES ] )
	const [ Deductions, setDeductions ] = useState<CommissionDeduction[]>( [] )
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
			const baseRateVal = parseFloat( String( BaseRate ).replace( ",", "." ) )
			await axios.post( "/api/db/config-comissao/post", {
				ano: Ano,
				mes: Mes,
				meta: Meta ? parseFloat( String( Meta ).replace( ",", "." ) ) : 0,
				salario_fixo: Salario ? parseFloat( String( Salario ).replace( ",", "." ) ) : 0,
				base_rate: isNaN( baseRateVal ) ? DEFAULT_BASE_RATE : baseRateVal,
				milestones: Milestones.length > 0 ? Milestones : DEFAULT_MILESTONES,
				deductions: Deductions.filter( ( d ) => d.description.trim() || d.value > 0 ),
				vendedor: Vendedor.name,
				user: Vendedor.id,
			} )
			toast( { title: "Salvo com sucesso", status: "success", duration: 3000, isClosable: true } )
			setMeta( "400000" )
			setSalario( "4000" )
			setBaseRate( String( DEFAULT_BASE_RATE ) )
			setMilestones( [ ...DEFAULT_MILESTONES ] )
			setDeductions( [] )
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

	const inputProps = {
		focusBorderColor: "#ffff",
		bg: "#ffffff12",
		shadow: "sm",
		size: "xs",
		w: "full",
		fontSize: "xs",
		rounded: "md",
	}

	return (
		<Flex w="100%" flexDir="column" gap={ 4 } p={ 3 }>
			<Grid
				templateColumns={{
					base: "1fr 1fr",
					sm: "repeat(3, 1fr)",
					md: "repeat(4, 1fr)",
					lg: "repeat(6, 1fr)",
				}}
				gap={ 4 }
				alignItems="end"
			>
				<FormControl>
					<FormLabel fontSize="xs">Ano</FormLabel>
					<Input
						{...inputProps}
						type="number"
						value={ Ano }
						onChange={ ( e ) => setAno( e.target.value ) }
					/>
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Mês</FormLabel>
					<Input
						{...inputProps}
						type="number"
						min={ 1 }
						max={ 12 }
						value={ Mes }
						onChange={ ( e ) => setMes( e.target.value ) }
					/>
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Meta (R$)</FormLabel>
					<Input
						{...inputProps}
						type="number"
						placeholder="400000"
						value={ Meta }
						onChange={ ( e ) => setMeta( e.target.value ) }
					/>
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Salário fixo (R$)</FormLabel>
					<Input
						{...inputProps}
						type="number"
						placeholder="4000"
						value={ Salario }
						onChange={ ( e ) => setSalario( e.target.value ) }
					/>
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Base rate</FormLabel>
					<Input
						{...inputProps}
						type="number"
						step="0.001"
						placeholder="0.01"
						value={ BaseRate }
						onChange={ ( e ) => setBaseRate( e.target.value ) }
					/>
				</FormControl>
				<Flex alignSelf="stretch" alignItems="flex-end" pb={ 1 }>
					<Button colorScheme="green" size="sm" isDisabled={ Bloq } onClick={ salvar } w="full">
						Salvar
					</Button>
				</Flex>
			</Grid>
			<Box w="100%" maxW={{ base: "100%", sm: "320px" }}>
				<MilestoneEditor value={ Milestones } onChange={ setMilestones } />
			</Box>
			<Box w="100%" maxW={{ base: "100%", sm: "400px" }}>
				<DeductionEditor value={ Deductions } onChange={ setDeductions } />
			</Box>
		</Flex>
	)
}
