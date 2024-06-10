import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Input } from "@chakra-ui/react"
import { formatCurrency, parseCurrency } from '@/utils/customNumberFormats'

interface CustomCurrencyInputProps {
	onCurrencyChange: Dispatch<SetStateAction<number>>
	value: number
	[ key: string ]: any
}

const CustomCurrencyInput: React.FC<CustomCurrencyInputProps> = ( { onCurrencyChange, value, ...inputProps } ) => {
	const [ formattedValue, setFormattedValue ] = useState<string>( formatCurrency( value ) )

	const handleChange = useCallback( ( inputValue: string | number ) => {
		const num = parseCurrency( inputValue )
		setFormattedValue( formatCurrency( num ) )
		onCurrencyChange( num )
	}, [ onCurrencyChange ] )

	useEffect( () => {
		handleChange( value )
	}, [ handleChange, value ] )

	const handleFocus = ( event: React.FocusEvent<HTMLInputElement> ) => {
		const input = event.target
		const length = input.value.length
		window.requestAnimationFrame( () => {
			input.setSelectionRange( length, length )
		} )
	}

	const handleMouseDown = ( event: React.MouseEvent<HTMLInputElement> ) => {
		event.preventDefault()
		const input = event.currentTarget
		const length = input.value.length
		window.requestAnimationFrame( () => {
			input.setSelectionRange( length, length )
			input.focus()
		} )
	}

	const handleKeyDown = ( event: React.KeyboardEvent<HTMLInputElement> ) => {
		if ( event.key === 'ArrowLeft' || event.key === 'ArrowRight' ) {
			event.preventDefault()
		}
		if ( event.key === 'ArrowUp' ) {
			event.preventDefault()
			const num = parseCurrency( formattedValue )
			onCurrencyChange( num + 1 )
		}
		if ( event.key === 'ArrowDown' ) {
			event.preventDefault()
			const num = parseCurrency( formattedValue )
			onCurrencyChange( num - 1 )
		}

	}

	return (
		<Input
			type="text"
			onChange={ e => handleChange( e.target.value ) }
			value={ formattedValue }
			onFocus={ handleFocus }
			onMouseDown={ handleMouseDown }
			onKeyDown={ handleKeyDown }
			{ ...inputProps }
		/>
	)
}

export default CustomCurrencyInput
