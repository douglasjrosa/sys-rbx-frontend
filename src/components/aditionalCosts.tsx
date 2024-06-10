import { FormLabel } from "@chakra-ui/react"
import CustomCurrencyInput from "./customCurrencyInput"
import { Dispatch, SetStateAction } from "react"

interface AditionalCostsProps {
	setAditionalCostsOnChange: Dispatch<SetStateAction<number>>
	aditionalCosts: number
}

const AditionalCosts: React.FC<AditionalCostsProps> = ( { setAditionalCostsOnChange, aditionalCosts } ) => {
	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				Custos adicionais
			</FormLabel>
			<CustomCurrencyInput
				onCurrencyChange={ setAditionalCostsOnChange }
				value={ aditionalCosts }
				textAlign={ "end" }
				size="xs"
				w={ 24 }
				fontSize="xs"
				rounded="md"
			/>
		</>
	)
}
export default AditionalCosts