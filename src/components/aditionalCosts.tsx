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
				textAlign="center"
				w="full"
			>
				Custos adicionais
			</FormLabel>
			<CustomCurrencyInput
				onCurrencyChange={ setAditionalCostsOnChange }
				value={ aditionalCosts }
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
export default AditionalCosts