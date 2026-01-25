import { FormLabel, Input, Box, IconButton } from "@chakra-ui/react"
import { memo, useCallback, useEffect, useState, useImperativeHandle, forwardRef } from "react"
import { FaTimes } from "react-icons/fa"

type FiltroCidadeProps = {
	cidade: ( searchText: string ) => void
}

export type FiltroCidadeRef = {
	setValue: ( value: string ) => void
}

export const FiltroCidade = memo( forwardRef<FiltroCidadeRef, FiltroCidadeProps>( ( { cidade }, ref ) => {
	const [ searchText, setSearchText ] = useState<string>( '' )

	// Expor método para definir o valor externamente
	useImperativeHandle( ref, () => ( {
		setValue: ( value: string ) => {
			setSearchText( value )
		}
	} ) )

	// Dispara a busca automaticamente quando o texto tiver 1 ou mais caracteres
	useEffect( () => {
		if ( searchText.length >= 1 ) {
			cidade( searchText )
		} else if ( searchText.length === 0 ) {
			// Limpa o filtro quando o campo estiver vazio
			cidade( '' )
		}
	}, [ searchText, cidade ] )

	const handleChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		setSearchText( e.target.value )
	}, [] )

	const handleClear = useCallback( () => {
		setSearchText( '' )
		cidade( '' )
	}, [ cidade ] )

	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				Cidade
			</FormLabel>
			<Box position="relative" minW="150px">
				<Input
					type="text"
					size={ 'sm' }
					borderColor="white"
					focusBorderColor="white"
					rounded="md"
					onChange={ handleChange }
					value={ searchText }
					placeholder="Cidade"
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
		</>
	)
} ) )

FiltroCidade.displayName = 'FiltroCidade'
