import {
	Box,
	Button,
	Flex,
	FormLabel,
	IconButton,
	Input,
} from "@chakra-ui/react"
import { FaPlus, FaRegTrashCan } from "react-icons/fa6"
import { CommissionMilestone } from "@/utils/commissionCalculator"

export const MilestoneEditor = ( props: {
	value: CommissionMilestone[]
	onChange: ( value: CommissionMilestone[] ) => void
} ) => {
	const { value, onChange } = props

	const updateAt = ( index: number, field: keyof CommissionMilestone, val: number ) => {
		const next = [ ...value ]
		next[ index ] = { ...next[ index ], [ field ]: val }
		onChange( next )
	}

	const add = () => {
		const last = value[ value.length - 1 ]
		const nextTarget = last ? last.targetPercent + 0.25 : 0.5
		const nextComission = last ? last.comissionPercent + 0.25 : 0.25
		onChange( [ ...value, { targetPercent: nextTarget, comissionPercent: nextComission } ] )
	}

	const remove = ( index: number ) => {
		onChange( value.filter( ( _, i ) => i !== index ) )
	}

	const toDisplay = ( n: number ) => ( n * 100 ).toString()
	const fromDisplay = ( s: string ) => {
		const n = parseFloat( String( s ).replace( ",", "." ) )
		return isNaN( n ) ? 0 : n / 100
	}

	return (
		<Box w="100%">
			<FormLabel fontSize="xs" mb={ 2 }>
				Patamares de comissão
			</FormLabel>
			<Flex flexDir="column" gap={ 2 }>
				{ value.length > 0 && (
					<Flex gap={ 2 } pl={ 2 } fontSize="xs" color="gray.400">
						<Box w="70px">Atingimento %</Box>
						<Box w="70px">Comissão %</Box>
						<Box w="32px" />
					</Flex>
				) }
				{ value.map( ( m, i ) => (
					<Flex key={ i } gap={ 2 } alignItems="center" flexWrap="wrap">
						<Box w="70px">
							<Input
								focusBorderColor="#ffff"
								bg="#ffffff12"
								shadow="sm"
								size="xs"
								type="number"
								step="1"
								min={ 0 }
								placeholder="50"
								value={ toDisplay( m.targetPercent ) }
								onChange={ ( e ) =>
									updateAt( i, "targetPercent", fromDisplay( e.target.value ) )
								}
							/>
						</Box>
						<Box w="70px">
							<Input
								focusBorderColor="#ffff"
								bg="#ffffff12"
								shadow="sm"
								size="xs"
								type="number"
								step="1"
								min={ 0 }
								placeholder="25"
								value={ toDisplay( m.comissionPercent ) }
								onChange={ ( e ) =>
									updateAt( i, "comissionPercent", fromDisplay( e.target.value ) )
								}
							/>
						</Box>
						<IconButton
							aria-label="Remover patamar"
							icon={ <FaRegTrashCan /> }
							size="xs"
							colorScheme="red"
							variant="ghost"
							onClick={ () => remove( i ) }
							isDisabled={ value.length <= 1 }
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
					Adicionar patamar
				</Button>
			</Flex>
		</Box>
	)
}
