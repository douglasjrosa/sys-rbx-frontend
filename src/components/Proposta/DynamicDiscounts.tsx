import { Box, Badge, Checkbox, Flex, FormLabel, Heading, Tooltip } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { findClosestMarginTable } from '@/utils/marginUtils'
import { discounts } from '@/components/data/marginTables'
import { parseCurrency, formatCurrency } from '@/utils/customNumberFormats'
import CustomCurrencyInput from '@/components/customCurrencyInput'

interface DynamicDiscountsProps {
	companyTablecalc: number | string | undefined
	deliverDate: string
	paymentTerms: string
	freightType: string
	itemsList: any[]
	subtotal: number
	purchaseFrequency?: string
	onDiscountChange: ( discountValue: number ) => void
	onManualDiscountChange?: ( discountValue: number ) => void
}

const tableNameMap: Record<string, string> = {
	'Counter': 'Balcão',
	'Vip': 'Vip',
	'Bronze': 'Bronze',
	'Silver': 'Prata',
	'Gold': 'Ouro',
	'Platinum': 'Platinum',
	'Strategic': 'Estratégica',
}

const tableColorMap: Record<string, string> = {
	'Counter': 'gray',
	'Vip': 'purple',
	'Bronze': 'orange',
	'Silver': 'gray',
	'Gold': 'yellow',
	'Platinum': 'cyan',
	'Strategic': 'green',
}

const discountNameMap: Record<string, string> = {
	'wholesale': 'Atacado',
	'anticipation': 'Antecedência',
	'recurrence': 'Recorrência',
	'fobFreight': 'Frete FOB',
	'paymentOnOrder': 'Pagamento no Pedido',
	'fullVucLoad': 'Atacado VUC',
	'fullThreeQuarterLoad': 'Atacado 3/4',
	'straightTruckFullLoad': 'Atacado Truck',
}

const discountDescriptionMap: Record<string, string> = {
	'Discount for quantity above 10 units per item.': 'Desconto por quantidade acima de 10 unidades por item.',
	'Discount for order anticipation with at least 10 days notice.': 'Desconto por antecipação de pedido com ao menos 10 dias de antecedência.',
	'Discount for order recurrence.': 'Desconto por recorrência de pedido.',
	'Discount for FOB freight.': 'Desconto por frete FOB.',
	'Discount for payment on order.': 'Desconto por pagamento no pedido.',
	'Discount for full Vuc Load.': 'Desconto por carga completa VUC.',
	'Discount for full Three Quarter Load.': 'Desconto por carga completa 3/4.',
	'Discount for straight Truck Full Load.': 'Desconto por carga completa Truck.',
}

export const DynamicDiscounts: React.FC<DynamicDiscountsProps> = ( {
	companyTablecalc,
	deliverDate,
	paymentTerms,
	freightType,
	itemsList,
	subtotal,
	purchaseFrequency,
	onDiscountChange,
	onManualDiscountChange,
} ) => {
	const [ selectedDiscounts, setSelectedDiscounts ] = useState<Set<string>>( new Set() )
	const [ manualDiscount, setManualDiscount ] = useState<number>( 0 )

	const marginTable = useMemo( () => {
		// Get the highest tabela value from items in the proposal
		if ( itemsList && itemsList.length > 0 ) {
			const tabelaValues = itemsList
				.map( item => {
					if ( !item.tabela ) return null
					const numericTabela = typeof item.tabela === 'string' ? parseFloat( item.tabela ) : item.tabela
					return isNaN( numericTabela ) ? null : numericTabela
				} )
				.filter( ( value ): value is number => value !== null )
			
			if ( tabelaValues.length > 0 ) {
				const minTabela = Math.min( ...tabelaValues )
				return findClosestMarginTable( minTabela )
			}
		}
		
		// Fallback to companyTablecalc if no items or no tabela values
		return findClosestMarginTable( companyTablecalc )
	}, [ itemsList, companyTablecalc ] )

	const isAnticipationAvailable = useMemo( () => {
		if ( !deliverDate ) return false
		try {
			// Parse date string (format: YYYY-MM-DD)
			const [ year, month, day ] = deliverDate.split( '-' ).map( Number )
			if ( !year || !month || !day ) return false

			const delivery = new Date( year, month - 1, day )
			const today = new Date()
			today.setHours( 0, 0, 0, 0 )
			delivery.setHours( 0, 0, 0, 0 )

			const daysDiff = Math.floor( ( delivery.getTime() - today.getTime() ) / ( 1000 * 60 * 60 * 24 ) )
			return daysDiff >= 10
		} catch {
			return false
		}
	}, [ deliverDate ] )

	const isPaymentOnOrderAvailable = useMemo( () => {
		if ( !paymentTerms ) return false
		const paymentStr = String( paymentTerms ).trim()

		// Direct comparison first (most common case)
		if ( paymentStr === 'À vista (antecipado)' || paymentStr === '0' || paymentStr === '1' ) {
			return true
		}

		// Check if it contains the key words (case insensitive)
		const lowerStr = paymentStr.toLowerCase()

		// Check for "vista" and "antecipado" together (more specific check first)
		if ( lowerStr.includes( 'vista' ) && lowerStr.includes( 'antecipado' ) ) {
			return true
		}

		// Check for just "à vista" or "a vista"
		if ( lowerStr === 'à vista' || lowerStr === 'a vista' || lowerStr.startsWith( 'à vista' ) || lowerStr.startsWith( 'a vista' ) ) {
			return true
		}

		// Normalize for comparison (remove accents and convert to lowercase)
		const normalized = paymentStr
			.toLowerCase()
			.normalize( 'NFD' )
			.replace( /[\u0300-\u036f]/g, '' )
			.replace( /[()]/g, '' )
			.trim()

		// Check for various possible formats
		const isAvailable = normalized === 'a vista antecipado' ||
			normalized === 'a vista' ||
			normalized === '0' ||
			normalized === '1' ||
			normalized.includes( 'antecipado' ) ||
			normalized.includes( 'vista' )

		return isAvailable
	}, [ paymentTerms ] )

	const isFobFreightAvailable = useMemo( () => {
		return freightType === 'FOB'
	}, [ freightType ] )

	const hasQuantityDiscount = useMemo( () => {
		if ( !itemsList || itemsList.length === 0 ) return false
		return itemsList.some( item => {
			// Try both 'quantity' and 'Qtd' (case-insensitive)
			const qty = item.quantity || item.Qtd || item.qtd || item.qtde || 0
			const quantity = typeof qty === 'number'
				? qty
				: parseFloat( String( qty || '0' ) )
			return quantity >= 10
		} )
	}, [ itemsList ] )

	const isRecurrenceAvailable = useMemo( () => {
		return purchaseFrequency === 'Mensalmente'
	}, [ purchaseFrequency ] )

	const hasMontOrExpo = useMemo( () => {
		if ( !itemsList || itemsList.length === 0 ) return false
		return itemsList.some( item => item.mont || item.expo )
	}, [ itemsList ] )

	const maxManualDiscount = useMemo( () => {
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

		return Math.round( total * 100 ) / 100
	}, [ itemsList ] )

	const handleManualDiscountChange: React.Dispatch<React.SetStateAction<number>> = ( value ) => {
		const numericValue = typeof value === 'function' ? value( manualDiscount ) : value
		const clampedValue = Math.max( 0, Math.min( numericValue, maxManualDiscount ) )
		setManualDiscount( clampedValue )
		if ( onManualDiscountChange ) {
			onManualDiscountChange( clampedValue )
		}
	}

	useEffect( () => {
		if ( manualDiscount > maxManualDiscount ) {
			const clampedValue = Math.max( 0, Math.min( maxManualDiscount, maxManualDiscount ) )
			setManualDiscount( clampedValue )
			if ( onManualDiscountChange ) {
				onManualDiscountChange( clampedValue )
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ maxManualDiscount ] )

	// Get numeric subtotal value
	const numericSubtotal = useMemo( () => {
		return typeof subtotal === 'number'
			? subtotal
			: typeof subtotal === 'string'
				? parseCurrency( subtotal )
				: 0
	}, [ subtotal ] )

	const isWholesaleDiscountEnabled = ( discountKey: string ): boolean => {
		switch ( discountKey ) {
			case 'fullVucLoad':
				return numericSubtotal >= 20000 && numericSubtotal < 30000
			case 'fullThreeQuarterLoad':
				return numericSubtotal >= 30000 && numericSubtotal < 40000
			case 'straightTruckFullLoad':
				return numericSubtotal >= 40000
			default:
				return false
		}
	}

	const regularDiscounts = useMemo( () => {
		if ( !marginTable ) return []

		return discounts.filter( discount => {
			const discountRate = marginTable.discounts[ discount.key as keyof typeof marginTable.discounts ]

			// Hide if discount rate is 0
			if ( discountRate === 0 ) return false

			// Exclude wholesale load discounts (they will be shown separately)
			if ( discount.key === 'fullVucLoad' || discount.key === 'fullThreeQuarterLoad' || discount.key === 'straightTruckFullLoad' ) {
				return false
			}

			// Check specific conditions
			switch ( discount.key ) {
				case 'anticipation':
					return isAnticipationAvailable
				case 'paymentOnOrder':
					return isPaymentOnOrderAvailable
				case 'fobFreight':
					return isFobFreightAvailable
				case 'wholesale':
					return hasQuantityDiscount
				case 'recurrence':
					return isRecurrenceAvailable
				default:
					return true
			}
		} )
	}, [ marginTable, isAnticipationAvailable, isPaymentOnOrderAvailable, isFobFreightAvailable, hasQuantityDiscount, isRecurrenceAvailable, paymentTerms ] )

	const wholesaleLoadDiscounts = useMemo( () => {
		if ( !marginTable ) return []

		return discounts.filter( discount => {
			const discountRate = marginTable.discounts[ discount.key as keyof typeof marginTable.discounts ]

			// Only include wholesale load discounts with rate > 0
			if ( discount.key === 'fullVucLoad' || discount.key === 'fullThreeQuarterLoad' || discount.key === 'straightTruckFullLoad' ) {
				return discountRate > 0
			}
			return false
		} )
	}, [ marginTable ] )

	const totalDiscount = useMemo( () => {
		if ( !marginTable ) return 0

		let totalDiscountValue = 0

		// Calculate all selected discounts
		selectedDiscounts.forEach( discountKey => {
			const discountRate = marginTable.discounts[ discountKey as keyof typeof marginTable.discounts ]

			if ( discountKey === 'wholesale' ) {
				// Wholesale discount applies only to items with quantity >= 10
				const wholesaleDiscountValue = itemsList.reduce( ( acc, item ) => {
					// Try both 'quantity' and 'Qtd' (case-insensitive)
					const qty = item.quantity || item.Qtd || item.qtd || item.qtde || 0
					const quantity = typeof qty === 'number'
						? qty
						: parseFloat( String( qty || '0' ) )
					if ( quantity >= 10 ) {
						const itemTotal = parseCurrency( item.total )
						return acc + ( itemTotal * discountRate )
					}
					return acc
				}, 0 )
				totalDiscountValue += wholesaleDiscountValue
			} else {
				// Other discounts apply to the subtotal
				totalDiscountValue += numericSubtotal * discountRate
			}
		} )

		return totalDiscountValue
	}, [ marginTable, selectedDiscounts, itemsList, numericSubtotal ] )

	useEffect( () => {
		onDiscountChange( totalDiscount + manualDiscount )
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ totalDiscount, manualDiscount ] )

	const handleDiscountToggle = ( discountKey: string ) => {
		setSelectedDiscounts( prev => {
			const newSet = new Set( prev )
			if ( newSet.has( discountKey ) ) {
				newSet.delete( discountKey )
			} else {
				newSet.add( discountKey )
			}
			return newSet
		} )
	}

	if ( !marginTable || ( regularDiscounts.length === 0 && wholesaleLoadDiscounts.length === 0 && !hasMontOrExpo ) ) {
		return null
	}

	const tableNamePt = tableNameMap[ marginTable.name ] || marginTable.name
	const tableColor = tableColorMap[ marginTable.name ] || 'blue'

	return (
		<Box w="100%" mt={ 4 } px={ { base: 2, md: 5 } } pb={ 4 }>
			<Box display="flex" alignItems="center" gap={ 2 } mb={ 3 }>
				<Heading fontSize="1.3rem" fontWeight="bold">Descontos Disponíveis para Produtos com Tabela:</Heading>
				<Badge colorScheme={ tableColor } fontSize="sm" px={ 1.5 } py={ 0.5 }>
					{ tableNamePt }
				</Badge>
			</Box>

			<Flex flexWrap="wrap" rowGap={ 5 } columnGap={ 4 } mb={ 2 } alignItems="center">
				{ regularDiscounts.map( discount => {
					const discountRate = marginTable.discounts[ discount.key as keyof typeof marginTable.discounts ]
					const isChecked = selectedDiscounts.has( discount.key )
					const percentage = ( discountRate * 100 ).toFixed( 0 )
					const namePt = discountNameMap[ discount.key ] || discount.name
					const descriptionPt = discountDescriptionMap[ discount.description ] || discount.description

					return (
						<Tooltip
							key={ discount.id }
							label={ `${ descriptionPt } (${ percentage }%)` }
							placement="top"
						>
							<Box flexShrink={ 0 } minW="140px" display="flex" alignItems="center">
								<Checkbox
									isChecked={ isChecked }
									onChange={ () => handleDiscountToggle( discount.key ) }
									colorScheme="green"
									size="md"
								>
									<FormLabel fontSize="sm" mb={ 0 } cursor="pointer" onClick={ () => handleDiscountToggle( discount.key ) }>
										{ namePt } ({ percentage }%)
									</FormLabel>
								</Checkbox>
							</Box>
						</Tooltip>
					)
				} ) }

				{ wholesaleLoadDiscounts.map( discount => {
					const discountRate = marginTable.discounts[ discount.key as keyof typeof marginTable.discounts ]
					const isChecked = selectedDiscounts.has( discount.key )
					const isEnabled = isWholesaleDiscountEnabled( discount.key )
					const percentage = ( discountRate * 100 ).toFixed( 0 )
					const namePt = discountNameMap[ discount.key ] || discount.name
					const descriptionPt = discountDescriptionMap[ discount.description ] || discount.description

					return (
						<Tooltip
							key={ discount.id }
							label={ `${ descriptionPt } (${ percentage }%)` }
							placement="top"
						>
							<Box flexShrink={ 0 } minW="140px" display="flex" alignItems="center">
								<Checkbox
									isChecked={ isChecked }
									onChange={ () => handleDiscountToggle( discount.key ) }
									isDisabled={ !isEnabled }
									colorScheme="green"
									size="md"
									sx={ {
										'& .chakra-checkbox__control[data-disabled]': {
											borderColor: 'gray.500',
											bg: 'gray.700',
											opacity: 0.5,
										},
									} }
								>
									<FormLabel
										fontSize="sm"
										mb={ 0 }
										cursor={ isEnabled ? "pointer" : "not-allowed" }
										opacity={ isEnabled ? 1 : 0.5 }
										onClick={ isEnabled ? () => handleDiscountToggle( discount.key ) : undefined }
									>
										{ namePt } ({ percentage }%)
									</FormLabel>
								</Checkbox>
							</Box>
						</Tooltip>
					)
				} ) }

				{ hasMontOrExpo && (
					<Tooltip
						label={ `Desconto manual baseado em 3% do total dos itens com Montagem ou Exposição marcados. Máximo: R$ ${ formatCurrency( maxManualDiscount ) }` }
						placement="top"
					>
						<Box flexShrink={ 0 } minW="140px" display="flex" alignItems="center" gap={ 2 }>
							<FormLabel fontSize="sm" mb={ 0 } fontWeight="md">
								Desconto Manual:
							</FormLabel>
							<CustomCurrencyInput
								onCurrencyChange={ handleManualDiscountChange }
								value={ manualDiscount }
								textAlign="end"
								size="xs"
								w={ 24 }
								px={ 0.5 }
								h={ 7 }
								fontSize="sm"
								rounded="md"
							/>
						</Box>
					</Tooltip>
				) }
			</Flex>

		</Box>
	)
}
