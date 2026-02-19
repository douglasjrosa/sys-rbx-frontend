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
				textAlign="center"
				w="full"
			>
				Desconto no pedido
			</FormLabel>
			<CustomCurrencyInput
				onCurrencyChange={ setAditionalDiscountOnChange }
				value={ aditionalDiscount }
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
export default AditionalDiscount