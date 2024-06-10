import { FormLabel } from "@chakra-ui/react"
import CustomCurrencyInput from "./customCurrencyInput"
import { Dispatch, SetStateAction } from "react"

interface AditionalDiscountProps {
	setAditionalDiscountOnChange: Dispatch<SetStateAction<number>>
	aditionalDiscount: number
}

const AditionalDiscount: React.FC<AditionalDiscountProps> = ( { setAditionalDiscountOnChange, aditionalDiscount } ) => {
	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				Desconto no pedido
			</FormLabel>
			<CustomCurrencyInput
				onCurrencyChange={ setAditionalDiscountOnChange }
				value={ aditionalDiscount }
				textAlign={ "end" }
				size="xs"
				w={ 24 }
				fontSize="xs"
				rounded="md"
			/>
		</>
	)
}
export default AditionalDiscount