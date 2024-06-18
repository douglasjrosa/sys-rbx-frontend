import { Box, FormLabel, Select } from "@chakra-ui/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface PaymentTermsProps {
	maxPrazoPagto: string
	paymentTerms: string
	setPaymentTermsOnChange: Dispatch<SetStateAction<string>>
}

const PaymentTerms: React.FC<PaymentTermsProps> = ( { maxPrazoPagto, paymentTerms, setPaymentTermsOnChange } ) => {

	const [ options, setOptions ] = useState<any[]>()
	
	useEffect( () => {

		if ( !options ) {
			const formasPagto = [
				{ maxPg: 0, value: '0', title: 'À vista (antecipado)' },
				{ maxPg: 1, value: '1', title: 'Antecipado (c/ desconto)' },
				{ maxPg: 10, value: '10', title: '10 dias' },
				{ maxPg: 15, value: '15', title: '15 dias' },
				{ maxPg: 28, value: '28', title: '28 dias' },
				{ maxPg: 35, value: '28/35', title: '28 / 35 dias' },
				{ maxPg: 42, value: '28/35/42', title: '28 / 35 / 42 dias' },
				{ maxPg: 65, value: '45/55/65', title: '45 / 55 / 65 dias' },
				{ maxPg: 90, value: '90', title: '90 dias' },
			]

			const latestDueDate = Math.max( ...maxPrazoPagto.split( '/' ).map( Number ), 1 )
		
			const options = formasPagto.filter( formaPagto => formaPagto.maxPg <= latestDueDate )
			
			setOptions( options )
		}
	}, [])

	return (
		<>
			<Box>
				<FormLabel
					fontSize="xs"
					fontWeight="md"
				>
					Prazo p/ pagamento
				</FormLabel>
				<Select
					shadow="sm"
					size="xs"
					w="45"
					fontSize="xs"
					rounded="md"
					onChange={ ( e ) => {
						setPaymentTermsOnChange( e.target.value )
					} }
					value={ paymentTerms }
				>
					{ options && options.map( ( option: any, key ) => {
						return (
							<option style={ { backgroundColor: "#1A202C" } }
								key={ `formaPagto-${key}` }
								value={ option.value }
							>
								{ option.title }
							</option>
						)
					} ) }
				</Select>
			</Box>
		</>
	)
}
export default PaymentTerms