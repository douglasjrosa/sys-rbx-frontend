import { FormLabel, Input } from "@chakra-ui/react"
import { memo, useCallback, useEffect, useState } from "react"

type FiltroEmpresaProps = {
	empresa: ( searchText: string ) => void
}

export const FiltroEmpresa = memo( ( { empresa }: FiltroEmpresaProps ) => {
	const [ searchText, setSearchText ] = useState<string>( '' )

	// Dispara a busca automaticamente quando o texto tiver 3 ou mais caracteres
	useEffect( () => {
		if ( searchText.length >= 3 ) {
			empresa( searchText )
		} else if ( searchText.length === 0 ) {
			// Limpa o filtro quando o campo estiver vazio
			empresa( '' )
		}
	}, [ searchText, empresa ] )

	const handleChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		setSearchText( e.target.value )
	}, [] )

	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				Empresa
			</FormLabel>
			<Input
				type="text"
				size={ 'sm' }
				borderColor="white"
				focusBorderColor="white"
				rounded="md"
				onChange={ handleChange }
				value={ searchText }
			/>
		</>
	)
} )

FiltroEmpresa.displayName = 'FiltroEmpresa'
