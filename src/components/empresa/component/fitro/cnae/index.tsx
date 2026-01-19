import { FormLabel, Input } from "@chakra-ui/react"
import { memo, useCallback, useEffect, useState, useImperativeHandle, forwardRef } from "react"

type FiltroCNAEProps = {
	cnae: ( cnaeText: string ) => void
	initialValue?: string
}

export type FiltroCNAERef = {
	setValue: ( value: string ) => void
}

export const FiltroCNAE = memo( forwardRef<FiltroCNAERef, FiltroCNAEProps>( ( { cnae, initialValue = '' }, ref ) => {
	const [ searchText, setSearchText ] = useState<string>( initialValue )

	// Expor método para definir o valor externamente
	useImperativeHandle( ref, () => ( {
		setValue: ( value: string ) => {
			setSearchText( value )
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
			cnae( searchText )
		}, 500 )

		return () => clearTimeout( timeoutId )
	}, [ searchText, cnae ] )

	const handleChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		setSearchText( e.target.value )
	}, [] )

	return (
		<>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				CNAE
			</FormLabel>
			<Input
				type="text"
				size={ 'sm' }
				borderColor="white"
				focusBorderColor="white"
				rounded="md"
				onChange={ handleChange }
				value={ searchText }
				placeholder="Digite o CNAE"
			/>
		</>
	)
} ) )

FiltroCNAE.displayName = 'FiltroCNAE'
