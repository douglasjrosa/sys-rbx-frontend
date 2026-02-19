import { Box, FormLabel, Select, Skeleton } from "@chakra-ui/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface PaymentTermsProps {
	maxPrazoPagto: string
	paymentTerms: string
	setPaymentTermsOnChange: Dispatch<SetStateAction<string>>
}

const PaymentTerms: React.FC<PaymentTermsProps> = ( { maxPrazoPagto, paymentTerms, setPaymentTermsOnChange } ) => {

	const [ options, setOptions ] = useState<any[]>( [
		{ maxPg: 0, title: 'À vista (antecipado)' }
	] )

	useEffect( () => {
		let allowedOptions: any[] = []
		if ( maxPrazoPagto ) {
			const formasPagto = [
				{ maxPg: 7, title: '7 dias' },
				{ maxPg: 10, title: '10 dias' },
				{ maxPg: 15, title: '15 dias' },
				{ maxPg: 28, title: '28 dias' },
				{ maxPg: 30, title: '15 / 30 dias' },
				{ maxPg: 35, title: '28 / 35 dias' },
				{ maxPg: 42, title: '28 / 35 / 42 dias' },
				{ maxPg: 45, title: '15 / 30 / 45 dias' },
				{ maxPg: 60, title: '30 / 60 dias' },
				{ maxPg: 65, title: '45 / 55 / 65 dias' },
				{ maxPg: 65, title: '65 dias' },
				{ maxPg: 90, title: '30 / 60 / 90 dias' },
				{ maxPg: 90, title: '90 dias' },
				{ maxPg: 120, title: '120 dias' }
			]

			const latestDueDate = Math.max( ...maxPrazoPagto.split( '/' ).map( Number ), 1 )

			allowedOptions = formasPagto.filter( formaPagto => formaPagto.maxPg <= latestDueDate )

			setOptions( [
				{ maxPg: 0, title: 'À vista (antecipado)' },
				...allowedOptions
			] )
		}
	}, [ maxPrazoPagto ] )

	return (
		<>
			<Box textAlign="center">
				<FormLabel
					fontSize="xs"
					fontWeight="md"
					textAlign="center"
					w="full"
				>
					Prazo p/ pagamento
				</FormLabel>
				{ options &&
					<Select
						shadow="sm"
						size="xs"
						py={1}
						w="full"
						fontSize="xs"
						rounded="md"
						textAlign="center"
						onChange={ ( e ) => {
							setPaymentTermsOnChange( e.target.value )
						} }
						value={ paymentTerms }
					>
						{ options.map( ( option: any, key ) => {
							return (
								<option 
									style={ { backgroundColor: "#1A202C" } }
									key={ `formaPagto-${ key }` }
									value={ option.title }
								>
									{ option.title }
								</option>
							)
						} ) }
					</Select>
					||
					<Skeleton height='28px' startColor='gray.600' endColor='gray.700' rounded={ "md" } w="full" />
				}
			</Box>
		</>
	)
}
export default PaymentTerms