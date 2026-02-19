import { FormLabel, Input, Box, IconButton } from "@chakra-ui/react"
import { memo, useCallback, useEffect, useState } from "react"
import { FaTimes } from "react-icons/fa"
import { unMask } from "remask"

type FiltroEmpresaProps = {
	empresa: ( searchText: string ) => void
}

// Função para detectar se o texto é um CNPJ (apenas números, 11-14 dígitos)
const isCNPJ = ( text: string ): boolean => {
	const cleanText = unMask( text )
	return /^\d{11,14}$/.test( cleanText )
}

export const FiltroEmpresa = memo( ( { empresa }: FiltroEmpresaProps ) => {
	const [ searchText, setSearchText ] = useState<string>( '' )

	// Dispara a busca automaticamente quando o texto tiver 1 ou mais caracteres
	useEffect( () => {
		if ( searchText.length >= 1 ) {
			empresa( searchText )
		} else if ( searchText.length === 0 ) {
			// Limpa o filtro quando o campo estiver vazio
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
			<Input
				type="text"
				size={ 'sm' }
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
