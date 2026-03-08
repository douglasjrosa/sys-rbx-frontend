import {
	Box,
	Button,
	Flex,
	FormLabel,
	IconButton,
	Input,
} from "@chakra-ui/react"
import { FaPlus, FaRegTrashCan } from "react-icons/fa6"
import { CommissionDeduction } from "@/utils/commissionCalculator"

export const DeductionEditor = ( props: {
	value: CommissionDeduction[]
	onChange: ( value: CommissionDeduction[] ) => void
} ) => {
	const { value, onChange } = props

	const updateAt = ( index: number, field: keyof CommissionDeduction, val: string | number ) => {
		const next = [ ...value ]
		next[ index ] = { ...next[ index ], [ field ]: val }
		onChange( next )
	}

	const add = () => {
		onChange( [ ...value, { description: "", value: 0 } ] )
	}

	const remove = ( index: number ) => {
		onChange( value.filter( ( _, i ) => i !== index ) )
	}

	const formatValue = ( v: number ) =>
		isNaN( v ) || v === 0 ? "" : v.toFixed( 2 ).replace( ".", "," )
	const parseValue = ( s: string ) => {
		const n = parseFloat( String( s ).replace( ",", "." ) )
		return isNaN( n ) ? 0 : n
	}

	return (
		<Box w="100%">
			<FormLabel fontSize="xs" mb={ 2 }>
				Deduções
			</FormLabel>
			<Flex flexDir="column" gap={ 2 }>
				{ value.length > 0 && (
					<Flex gap={ 2 } pl={ 2 } fontSize="xs" color="gray.400">
						<Box flex={ 1 }>Descrição</Box>
						<Box w="90px">Valor (R$)</Box>
						<Box w="32px" />
					</Flex>
				) }
				{ value.map( ( d, i ) => (
					<Flex key={ i } gap={ 2 } alignItems="center" flexWrap="wrap">
						<Box flex={ 1 } minW="120px">
							<Input
								focusBorderColor="#ffff"
								bg="#ffffff12"
								shadow="sm"
								size="xs"
								placeholder="Ex: Pedido cancelado - comissão mês anterior"
								value={ d.description }
								onChange={ ( e ) =>
									updateAt( i, "description", e.target.value )
								}
							/>
						</Box>
						<Box w="90px">
							<Input
								focusBorderColor="#ffff"
								bg="#ffffff12"
								shadow="sm"
								size="xs"
								type="text"
								inputMode="decimal"
								placeholder="0,00"
								value={ formatValue( d.value ) }
								onChange={ ( e ) =>
									updateAt( i, "value", parseValue( e.target.value ) )
								}
							/>
						</Box>
						<IconButton
							aria-label="Remover dedução"
							icon={ <FaRegTrashCan /> }
							size="xs"
							colorScheme="red"
							variant="ghost"
							onClick={ () => remove( i ) }
						/>
					</Flex>
				) ) }
				<Button
					leftIcon={ <FaPlus /> }
					size="xs"
					variant="outline"
					colorScheme="green"
					w="fit-content"
					onClick={ add }
				>
					Adicionar dedução
				</Button>
			</Flex>
		</Box>
	)
}
