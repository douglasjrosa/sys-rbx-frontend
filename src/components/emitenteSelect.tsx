import { FormLabel, Select, Skeleton } from "@chakra-ui/react"
import React, { SetStateAction } from "react"

interface EmitenteOption {
	id?: number
	attributes: {
		CNPJ?: string
		cnpj?: string
		razao?: string
		nome?: string
		account?: string
	}
}

interface EmitenteSelectProps {
	accountsData: EmitenteOption[] | undefined
	emitenteCnpj: string
	setEmitenteCnpjOnChange: React.Dispatch<SetStateAction<string>>
}

const getEmitenteCnpj = ( option: EmitenteOption ) =>
	option.attributes.CNPJ ?? option.attributes.cnpj ?? ""

const getEmitenteLabel = ( option: EmitenteOption ) =>
	option.attributes.razao
	|| option.attributes.nome
	|| option.attributes.account
	|| getEmitenteCnpj( option )

const EmitenteSelect: React.FC<EmitenteSelectProps> = ( {
	accountsData,
	emitenteCnpj,
	setEmitenteCnpjOnChange
} ) => {
	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
				textAlign="center"
				w="full"
			>
				Emitente
			</FormLabel>
			{
				accountsData &&
				<Select
					shadow="sm"
					size="xs"
					py={1}
					w="full"
					fontSize="xs"
					rounded="md"
					textAlign="center"
					onChange={ ( e ) => setEmitenteCnpjOnChange( e.target.value ) }
					value={ emitenteCnpj }
				>
					{ accountsData.map( ( accountData, key ) => (
						<option
							key={ accountData.id ?? `emitente-${ key }` }
							style={ { backgroundColor: "#1A202C" } }
							value={ getEmitenteCnpj( accountData ) }
						>
							{ getEmitenteLabel( accountData ) }
						</option>
					) )
					}
				</Select>
				|| <Skeleton height='27px' w="full" startColor='gray.600' endColor='gray.700' rounded={ "md" } />
			}
		</>
	)
}
export default EmitenteSelect
