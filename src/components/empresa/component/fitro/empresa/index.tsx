import { FormLabel, Input, InputGroup, InputLeftElement, Box, IconButton, Spinner } from "@chakra-ui/react"
import { memo, useCallback, useEffect, useState } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import { unMask } from "remask"

type FiltroEmpresaProps = {
	empresa: ( searchText: string ) => void
	isLoading?: boolean
}

// Função para detectar se o texto é um CNPJ (apenas números, 11-14 dígitos)
const isCNPJ = ( text: string ): boolean => {
	const cleanText = unMask( text )
	return /^\d{11,14}$/.test( cleanText )
}

export const FiltroEmpresa = memo( ( { empresa, isLoading = false }: FiltroEmpresaProps ) => {
	const [ searchText, setSearchText ] = useState<string>( '' )

	useEffect( () => {
		if ( searchText.length >= 3 ) {
			empresa( searchText )
		} else {
			empresa( '' )
		}
	}, [ searchText, empresa ] )

	const handleChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		setSearchText( e.target.value )
	}, [] )

	const handleClear = useCallback( () => {
		setSearchText( '' )
		empresa( '' )
	}, [ empresa ] )

	return (
		<Box position="relative" minW="150px">
			<InputGroup size="sm">
				<InputLeftElement pointerEvents="none">
					{ isLoading && searchText.length >= 3 ? (
						<Spinner size="sm" color="gray.400" />
					) : (
						<FaSearch color="gray" />
					) }
				</InputLeftElement>
				<Input
					type="text"
					borderColor="white"
					focusBorderColor="white"
					rounded="md"
					onChange={ handleChange }
					value={ searchText }
					placeholder="Nome ou CNPJ"
					pr={ searchText ? "2.5rem" : "0.75rem" }
					minW="150px"
					w="100%"
				/>
			</InputGroup>
			{ searchText && (
				<IconButton
					aria-label="Limpar busca"
					icon={ <FaTimes /> }
					size="xs"
					colorScheme="red"
					variant="ghost"
					position="absolute"
					right="0.25rem"
					top="50%"
					transform="translateY(-50%)"
					onClick={ handleClear }
					zIndex={ 10 }
					pointerEvents="auto"
					_hover={ { bg: "red.500", color: "white" } }
				/>
			) }
		</Box>
	)
} )

FiltroEmpresa.displayName = 'FiltroEmpresa'
