import { Box, Heading, Tooltip } from '@chakra-ui/react'
import { useMemo, useState, useEffect } from 'react'
import { parseCurrency, formatCurrency } from '@/utils/customNumberFormats'
import CustomCurrencyInput from '@/components/customCurrencyInput'

interface ManualDiscountProps {
	itemsList: any[]
	onDiscountChange: ( discountValue: number ) => void
}

export const ManualDiscount: React.FC<ManualDiscountProps> = ( {
	itemsList,
	onDiscountChange,
} ) => {
	const [ manualDiscount, setManualDiscount ] = useState<number>( 0 )

	const hasMontOrExpo = useMemo( () => {
		if ( !itemsList || itemsList.length === 0 ) return false
		return itemsList.some( item => item.mont || item.expo )
	}, [ itemsList ] )

	const maxDiscount = useMemo( () => {
		if ( !itemsList || itemsList.length === 0 ) return 0

		let total = 0

		itemsList.forEach( item => {
			if ( item.mont || item.expo ) {
				const itemTotal = parseCurrency( item.total )
				let discountPercentage = 0

				if ( item.mont ) discountPercentage += 0.03
				if ( item.expo ) discountPercentage += 0.03

				total += itemTotal * discountPercentage
			}
		} )

		// Round to 2 decimal places to avoid floating point precision issues
		return Math.round( total * 100 ) / 100
	}, [ itemsList ] )

	const handleManualDiscountChange = ( value: number ) => {
		const clampedValue = Math.max( 0, Math.min( value, maxDiscount ) )
		setManualDiscount( clampedValue )
		onDiscountChange( clampedValue )
	}

	useEffect( () => {
		if ( manualDiscount > maxDiscount ) {
			const clampedValue = Math.max( 0, Math.min( maxDiscount, maxDiscount ) )
			setManualDiscount( clampedValue )
			onDiscountChange( clampedValue )
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ maxDiscount ] )

	if ( !hasMontOrExpo ) {
		return null
	}

	return (
		<Box w="100%" mt={ 4 } px={ { base: 2, md: 5 } }>
			<Heading size="sm" mb={ 3 }>Desconto Manual</Heading>
			<Box>
				<Tooltip
					label={ `Desconto manual baseado em 3% do total dos itens com Montagem ou Exposição marcados. Máximo: R$ ${ formatCurrency( maxDiscount ) }` }
					placement="top"
				>
					<Box display="inline-block">
						<CustomCurrencyInput
							onCurrencyChange={ handleManualDiscountChange }
							value={ manualDiscount }
							textAlign="end"
							size="xs"
							w={ 24 }
							fontSize="xs"
							rounded="md"
						/>
					</Box>
				</Tooltip>
			</Box>
		</Box>
	)
}
