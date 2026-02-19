import { FormLabel, Input, useToast } from "@chakra-ui/react"
import { Dispatch, SetStateAction } from "react"


interface TableItemsProps {
	deliverDate: string
	setDeliverDateOnChange: Dispatch<SetStateAction<string>>
}

const DeliverDate: React.FC<TableItemsProps> = ({ deliverDate, setDeliverDateOnChange }) => {
	const toast = useToast()

	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
				textAlign="center"
				w="full"
			>
				Data Entrega
			</FormLabel>
			<Input
				shadow="sm"
				type={ "date" }
				color={ 'white' }
				size="xs"
				py={1}
				w="full"
				fontSize="xs"
				rounded="md"
				textAlign="center"
				onChange={ ( e ) => {
					const chosenDate = new Date( e.target.value )
					const today = new Date()
					if ( chosenDate > today ) setDeliverDateOnChange( e.target.value )
					else {
						toast( {
							title: "Oooopss...",
							description: 'A data de entrega não pode ser anterior à data atual',
							status: "warning",
							duration: 6000,
							isClosable: true,
						} )
					}
				}
				}
				value={ deliverDate }
			/>
		</>
	)
}
export default DeliverDate