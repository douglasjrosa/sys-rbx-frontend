import {
	Box,
	Button,
	Flex,
	Grid,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { FaChevronDown } from 'react-icons/fa'

import { modCaix } from '@/components/data/modCaix'
import { getTemplateImageSrc } from '@/lib/calculadora-de-embalagem/utils/templateImages'

const MODELS_WITH_IMAGE = new Set(
	modCaix
		.map( ( model ) => model.id )
		.filter( ( id ) => id !== 'modelo_especial' ),
)

type PackagingModelPickerProps = {
	value: string
	onChange: ( modelId: string ) => void
}

function ModelThumbnail( {
	modelId,
	title,
	size = 'md',
}: {
	modelId: string
	title: string
	size?: 'sm' | 'md'
} ) {
	const boxSize = size === 'sm' ? '40px' : '100%'
	const hasImage = MODELS_WITH_IMAGE.has( modelId )

	if ( !hasImage ) {
		return (
			<Flex
				w={ boxSize }
				h={ size === 'sm' ? '40px' : '120px' }
				align="center"
				justify="center"
				bg="gray.700"
				borderRadius="md"
				p={ 2 }
			>
				<Text
					fontSize={ size === 'sm' ? '2xs' : 'xs' }
					color="gray.300"
					textAlign="center"
					lineHeight="short"
				>
					{ title }
				</Text>
			</Flex>
		)
	}

	return (
		<Image
			src={ getTemplateImageSrc( modelId ) }
			alt={ title }
			w={ boxSize }
			h={ size === 'sm' ? '40px' : '120px' }
			objectFit="contain"
			bg="white"
			borderRadius="md"
			p={ size === 'sm' ? 1 : 2 }
		/>
	)
}

export function PackagingModelPicker( {
	value,
	onChange,
}: PackagingModelPickerProps ) {
	const { isOpen, onOpen, onClose } = useDisclosure()

	const selectedModel = useMemo(
		() => modCaix.find( ( model ) => model.id === value ),
		[ value ],
	)

	const handleSelect = ( modelId: string ) => {
		onChange( modelId )
		onClose()
	}

	return (
		<>
			<Button
				type="button"
				variant="unstyled"
				w="full"
				h="auto"
				minH="40px"
				px={ 3 }
				py={ 2 }
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				bg="gray.800"
				color="white"
				border="none"
				borderRadius="md"
				fontWeight="semibold"
				_hover={ { bg: 'gray.700', color: 'white' } }
				_active={ { bg: 'gray.700', color: 'white' } }
				onClick={ onOpen }
			>
				<Flex align="center" gap={ 3 } minW={ 0 } flex={ 1 }>
					{ selectedModel ? (
						<>
							<Box flexShrink={ 0 }>
								<ModelThumbnail
									modelId={ selectedModel.id }
									title={ selectedModel.title }
									size="sm"
								/>
							</Box>
							<Text
								fontSize="md"
								fontWeight="semibold"
								color="white"
								noOfLines={ 1 }
								textAlign="left"
							>
								{ selectedModel.title }
							</Text>
						</>
					) : (
						<Text fontSize="md" fontWeight="medium" color="gray.400">
							Selecione o modelo
						</Text>
					) }
				</Flex>
				<FaChevronDown color="#A0AEC0" />
			</Button>

			<Modal isOpen={ isOpen } onClose={ onClose } size="4xl" scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent bg="gray.800" color="white">
					<ModalHeader fontSize="md">
						Selecione o modelo da embalagem
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={ 6 }>
						<Grid
							templateColumns={ {
								base: 'repeat(2, minmax(0, 1fr))',
								sm: 'repeat(3, minmax(0, 1fr))',
								md: 'repeat(4, minmax(0, 1fr))',
							} }
							gap={ 3 }
						>
							{ modCaix.map( ( model ) => {
								const isSelected = value === model.id
								return (
									<Box
										key={ model.id }
										as="button"
										type="button"
										textAlign="center"
										borderWidth="2px"
										borderColor={ isSelected ? 'blue.400' : 'gray.600' }
										borderRadius="lg"
										bg={ isSelected ? 'gray.700' : 'gray.900' }
										p={ 3 }
										cursor="pointer"
										transition="border-color 0.2s ease, background 0.2s ease"
										_hover={ {
											borderColor: isSelected ? 'blue.300' : 'gray.500',
											bg: 'gray.700',
										} }
										onClick={ () => handleSelect( model.id ) }
									>
										<ModelThumbnail
											modelId={ model.id }
											title={ model.title }
										/>
										<Text
											mt={ 3 }
											fontSize={ { base: 'sm', md: 'md' } }
											fontWeight={ isSelected ? 'bold' : 'semibold' }
											color="white"
											lineHeight="short"
										>
											{ model.title }
										</Text>
									</Box>
								)
							} ) }
						</Grid>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	)
}
