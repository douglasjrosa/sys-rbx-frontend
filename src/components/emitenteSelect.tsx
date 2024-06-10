import { FormLabel, Select, Skeleton } from "@chakra-ui/react"
import React, { SetStateAction, useEffect, useState } from "react"

interface EmitenteSelectProps {
	accountsData: any[] | undefined
	emitenteCnpj: string
	setEmitenteCnpjOnChange: React.Dispatch<SetStateAction<string>>
}

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
			>
				Emitente
			</FormLabel>
			{
				accountsData &&
				<Select
					shadow="sm"
					size="xs"
					w="28"
					fontSize="xs"
					rounded="md"
					onChange={ ( e ) => setEmitenteCnpjOnChange( e.target.value ) }
					value={ emitenteCnpj }
				>
					{ accountsData.map( ( accountData: any, key ) => (
						<option
							key={ `accountData${ key }` }
							style={ { backgroundColor: "#1A202C" } }
							value={ accountData.attributes.cnpj }
						>
							{ accountData.attributes.account }
						</option>
					) )
					}
				</Select>
				|| <Skeleton height='27px' w="28" startColor='gray.600' endColor='gray.700' rounded={ "md" } />
			}
		</>
	)
}
export default EmitenteSelect