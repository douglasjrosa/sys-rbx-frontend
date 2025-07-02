import { Button, Flex, FormLabel, Input } from "@chakra-ui/react"
import { memo, useCallback, useState } from "react"

type FiltroEmpresaProps = {
	empresa: ( searchText: string ) => void
}

export const FiltroEmpresa = memo( ( { empresa }: FiltroEmpresaProps ) => {
	const [ searchText, setSearchText ] = useState<string>( '' )

	const handleSearch = useCallback( () => {
		empresa( searchText )
	}, [ empresa, searchText ] )

	const handleBlur = useCallback( ( e: React.FocusEvent<HTMLInputElement> ) => {
		const value = e.target.value
		if ( value.length === 0 ) {
			setSearchText( '' )
			empresa( '' )
		}
	}, [ empresa ] )

	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				Empresa
			</FormLabel>
			<Flex gap={ 5 }>
				<Input
					type="text"
					size={ 'sm' }
					borderColor="white"
					focusBorderColor="white"
					rounded="md"
					onChange={ ( e ) => setSearchText( e.target.value ) }
					value={ searchText }
					onBlur={ handleBlur }
				/>
				<Button
					px={ 8 }
					size={ 'sm' }
					onClick={ handleSearch }
					colorScheme="green"
				>
					Filtro
				</Button>
			</Flex>
		</>
	)
} )

FiltroEmpresa.displayName = 'FiltroEmpresa'
