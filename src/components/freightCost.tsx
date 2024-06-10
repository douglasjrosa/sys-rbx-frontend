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
			>
				Valor de Frete
			</FormLabel>
			<CustomCurrencyInput
				onCurrencyChange={ setFreightCostOnChange }
				value={ freightCost }
				textAlign={ "end" }
				size="xs"
				w={ 24 }
				fontSize="xs"
				rounded="md"
			/>
		</>
	)
}
export default FreightCost