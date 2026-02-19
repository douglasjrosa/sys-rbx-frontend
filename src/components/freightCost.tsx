import { FormLabel } from "@chakra-ui/react"
import CustomCurrencyInput from "./customCurrencyInput"
import { Dispatch, SetStateAction } from "react"

interface FreightCostProps {
	setFreightCostOnChange: Dispatch<SetStateAction<number>>
	freightCost: number
}

const FreightCost: React.FC<FreightCostProps> = ( { setFreightCostOnChange, freightCost } ) => {
	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
				textAlign="center"
				w="full"
			>
				Valor de Frete
			</FormLabel>
			<CustomCurrencyInput
				onCurrencyChange={ setFreightCostOnChange }
				value={ freightCost }
				textAlign={ "center" }
				size="xs"
				py={1}
				w="full"
				fontSize="xs"
				rounded="md"
			/>
		</>
	)
}
export default FreightCost