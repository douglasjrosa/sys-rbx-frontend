import {
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	Image,
	Input,
	Text,
	VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FaSave } from 'react-icons/fa'

import { modCaix } from '@/components/data/modCaix'
import { getTemplateImageSrc } from '@/lib/calculadora-de-embalagem/utils/templateImages'
import { formatCurrency, parseCurrency } from '@/utils/customNumberFormats'

const MODELS_WITH_IMAGE = new Set(
	modCaix
		.map( ( model ) => model.id )
		.filter( ( id ) => id !== 'modelo_especial' ),
)

type PackageSummary = {
	productName: string | null
	productCode: string | null
	modelName: string
	measurements: string
	footConfig: string | null
	assembly: string | null
}

type CalculationResultCardProps = {
	vFinal: number
	modelId: string
	marginLabel: string
	packageSummary: PackageSummary
	isAdmin: boolean
	onPriceChange: ( vFinal: number ) => void
	onSave: () => void
	isSaving: boolean
}

function ModelResultImage( { modelId }: { modelId: string } ) {
	const modelTitle = useMemo(
		() => modCaix.find( ( model ) => model.id === modelId )?.title ?? modelId,
		[ modelId ],
	)
	const hasImage = MODELS_WITH_IMAGE.has( modelId )

	if ( !hasImage ) {
		return (
			<Flex
				w="full"
				h="full"
				align="center"
				justify="center"
			>
				<Text
					fontSize="md"
					fontWeight="semibold"
					color="gray.600"
					textAlign="center"
					lineHeight="short"
				>
					{ modelTitle }
				</Text>
			</Flex>
		)
	}

	return (
		<Image
			src={ getTemplateImageSrc( modelId ) }
			alt={ modelTitle }
			w="full"
			h="full"
			maxH={ { base: '40vh', md: '100%' } }
			objectFit="contain"
		/>
	)
}

const resultRowColumnStyles = {
	flex: { base: '0 0 auto', md: '1 1 0' },
	w: 'full',
	minW: 0,
	alignSelf: 'stretch',
	display: 'flex',
	flexDirection: 'column',
}

const imagePanelStyles = {
	...resultRowColumnStyles,
	bg: 'white',
	borderRadius: 'xl',
	overflow: 'hidden',
	alignItems: 'center',
	justifyContent: 'center',
	p: { base: 8, md: 10 },
	minH: { base: '12rem', md: '100%' },
}

const resultPanelStyles = {
	...resultRowColumnStyles,
	borderRadius: 'xl',
	p: { base: 4, md: 8 },
	justifyContent: 'space-between',
}

export function CalculationResultCard( {
	vFinal,
	modelId,
	marginLabel,
	packageSummary,
	isAdmin,
	onPriceChange,
	onSave,
	isSaving,
}: CalculationResultCardProps ) {
	const [ priceText, setPriceText ] = useState( () => formatCurrency( vFinal ) )

	useEffect( () => {
		setPriceText( formatCurrency( vFinal ) )
	}, [ vFinal ] )

	const summaryDetailLines = useMemo(
		() =>
			[
				packageSummary.measurements,
				packageSummary.footConfig,
				packageSummary.assembly,
			].filter( ( line ): line is string => !!line ),
		[ packageSummary ],
	)

	const handlePriceInputChange = ( value: string ) => {
		setPriceText( value )
		onPriceChange( parseCurrency( value ) )
	}

	const formattedPrice = new Intl.NumberFormat( 'pt-BR', {
		style: 'currency',
		currency: 'BRL',
	} ).format( vFinal )

	return (
		<VStack spacing={ 6 } align="stretch">
			<Flex
				direction={ { base: 'column', md: 'row' } }
				gap={ { base: 6, md: 8 } }
				align={ { base: 'stretch', md: 'stretch' } }
				w="100%"
				p={ { base: 4, md: 6 } }
			>
				<Box { ...imagePanelStyles }>
					<ModelResultImage modelId={ modelId } />
				</Box>

				<Box
					{ ...resultPanelStyles }
					bg="green.900"
					border="1px"
					borderColor="green.500"
				>
					<VStack spacing={ 2 } align="center" w="full">
						{ packageSummary.productName && (
							<Text
								fontSize="lg"
								fontWeight="bold"
								color="green.100"
								textAlign="center"
								lineHeight="short"
							>
								{ packageSummary.productName }
							</Text>
						) }
						{ packageSummary.productCode && (
							<Text
								fontSize="md"
								fontWeight="medium"
								color="green.100"
								textAlign="center"
								lineHeight="short"
							>
								{ packageSummary.productCode }
							</Text>
						) }
						{ packageSummary.modelName && (
							<Text
								fontSize="lg"
								fontWeight="semibold"
								color="green.100"
								textAlign="center"
								lineHeight="short"
							>
								{ packageSummary.modelName }
							</Text>
						) }
						{ summaryDetailLines.map( ( line, index ) => (
							<Text
								key={ `${ line }-${ index }` }
								fontSize="md"
								fontWeight="medium"
								color="green.100"
								textAlign="center"
								lineHeight="short"
							>
								{ line }
							</Text>
						) ) }
					</VStack>

					<VStack spacing={ 4 } align="center" w="full" pt={ { base: 3, md: 4 } }>
						<Text
							fontSize="sm"
							fontWeight="bold"
							color="green.200"
							textTransform="uppercase"
						>
							Preço Calculado
						</Text>

						{ isAdmin ? (
							<Flex align="center" justify="center" gap={ 2 } w="full">
								<Text fontSize="2xl" fontWeight="bold" color="white">
									R$
								</Text>
								<Input
									value={ priceText }
									onChange={ ( e ) => handlePriceInputChange( e.target.value ) }
									fontSize={ { base: 'xl', md: '3xl' } }
									fontWeight="bold"
									color="white"
									textAlign="center"
									w="full"
									maxW="full"
									bg="green.800"
									border="1px solid"
									borderColor="green.400"
									borderRadius="lg"
									px={ 4 }
									py={ 2 }
									_hover={ { borderColor: 'green.300' } }
									_focus={ {
										borderColor: 'green.200',
										boxShadow: '0 0 0 1px var(--chakra-colors-green-200)',
									} }
									placeholder="0,00"
								/>
							</Flex>
						) : (
							<Heading
								size={ { base: 'xl', md: '2xl' } }
								color="white"
								textAlign="center"
							>
								{ formattedPrice }
							</Heading>
						) }

						<Badge
							colorScheme="green"
							fontSize="md"
							px={ 3 }
							py={ 1 }
							borderRadius="full"
						>
							{ marginLabel }
						</Badge>
					</VStack>
				</Box>
			</Flex>

			<Button
				leftIcon={ <FaSave /> }
				colorScheme="green"
				size="lg"
				w="full"
				onClick={ onSave }
				isLoading={ isSaving }
			>
				Salvar
			</Button>
		</VStack>
	)
}
