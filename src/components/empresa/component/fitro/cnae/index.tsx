import { FormLabel, Input, Box, IconButton } from "@chakra-ui/react"
import { memo, useCallback, useEffect, useState, useImperativeHandle, forwardRef } from "react"
import { formatCNAE, sanitizeCNAE } from "@/function/Mask/cnae"
import { unMask } from "remask"
import { FaTimes } from "react-icons/fa"

type FiltroCNAEProps = {
	cnae: ( cnaeText: string ) => void
	initialValue?: string
}

export type FiltroCNAERef = {
	setValue: ( value: string ) => void
}

export const FiltroCNAE = memo( forwardRef<FiltroCNAERef, FiltroCNAEProps>( ( { cnae, initialValue = '' }, ref ) => {
	const [ searchText, setSearchText ] = useState<string>( formatCNAE( initialValue ) )

	// Expor método para definir o valor externamente
	useImperativeHandle( ref, () => ( {
		setValue: ( value: string ) => {
			setSearchText( formatCNAE( value ) )
		}
	} ) )

	// Dispara a busca automaticamente quando o usuário parar de digitar
	useEffect( () => {
		// Se o campo estiver vazio, limpa o filtro imediatamente
		if ( searchText.length === 0 ) {
			cnae( '' )
			return
		}

		// Se houver texto, aguarda 500ms após parar de digitar para filtrar
		const timeoutId = setTimeout( () => {
			// Envia o valor sanitizado para o filtro
			cnae( sanitizeCNAE( searchText ) )
		}, 500 )

		return () => clearTimeout( timeoutId )
	}, [ searchText, cnae ] )

	const handleChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		const valor = e.target.value
		const valorLimpo = unMask( valor )
		const formatted = formatCNAE( valorLimpo )
		setSearchText( formatted )
	}, [] )

	const handleClear = useCallback( () => {
		setSearchText( '' )
		cnae( '' )
	}, [ cnae ] )

	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				CNAE
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
					placeholder="Digite o CNAE"
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

FiltroCNAE.displayName = 'FiltroCNAE'
