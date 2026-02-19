import { FormLabel, Select } from "@chakra-ui/react"
import { Dispatch, SetStateAction } from "react"

interface FreightSelectProps {
	freightType: string
	setFreightTypeOnChange: Dispatch<SetStateAction<string>>
}

const FreightSelect: React.FC<FreightSelectProps> = ( { freightType, setFreightTypeOnChange } ) => {
	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
				textAlign="center"
				w="full"
			>
				Frete
			</FormLabel>
			<Select
				shadow="sm"
				size="xs"
				py={1}
				w="full"
				fontSize="xs"
				rounded="md"
				textAlign="center"
				onChange={ e => setFreightTypeOnChange( e.target.value ) }
				value={ freightType }
			>
				<option style={ { backgroundColor: "#1A202C" } } value="FOB">FOB</option>
				<option style={ { backgroundColor: "#1A202C" } } value="CIF">CIF</option>
			</Select>
		</>
	)
}

export default FreightSelect
