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

import { ASSEMBLY_OPTIONS } from '@/lib/calculadora-de-embalagem/utils/formOptions'
import type { AssemblyType } from '@/lib/calculadora-de-embalagem/utils/packagingCalculator'
import {
	assemblyAssetFolderForModel,
	assemblyIllustrationSrc,
} from '@/lib/calculadora-de-embalagem/utils/templateMeta'

type AssemblyPickerProps = {
	value: string
	modelId: string
	onChange: ( assembly: AssemblyType ) => void
}

function AssemblyThumbnail( {
	modelId,
	assembly,
	size = 'md',
}: {
	modelId: string
	assembly: AssemblyType
	size?: 'sm' | 'md'
} ) {
	const folder = assemblyAssetFolderForModel( modelId )
	const imgH = size === 'sm' ? '40px' : '120px'

	if ( !folder ) {
		return null
	}

	return (
		<Box
			h={ imgH }
			w={ size === 'sm' ? '40px' : '100%' }
			borderRadius="md"
			bg="white"
			overflow="hidden"
			display="flex"
			alignItems="center"
			justifyContent="center"
			flexShrink={ 0 }
		>
			<Image
				src={ assemblyIllustrationSrc( folder, assembly ) }
				alt=""
				aria-hidden
				w="100%"
				h="100%"
				objectFit="contain"
			/>
		</Box>
	)
}

export function AssemblyPicker( {
	value,
	modelId,
	onChange,
}: AssemblyPickerProps ) {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const assetFolder = useMemo(
		() => assemblyAssetFolderForModel( modelId ),
		[ modelId ],
	)

	const selectedOption = useMemo(
		() => ASSEMBLY_OPTIONS.find( ( opt ) => opt.value === value ),
		[ value ],
	)

	const handleSelect = ( assembly: AssemblyType ) => {
		onChange( assembly )
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
					{ selectedOption && assetFolder ? (
						<>
							<AssemblyThumbnail
								modelId={ modelId }
								assembly={ selectedOption.value }
								size="sm"
							/>
							<Text
								fontSize="md"
								fontWeight="semibold"
								color="white"
								noOfLines={ 2 }
								textAlign="left"
							>
								{ selectedOption.label }
							</Text>
						</>
					) : selectedOption ? (
						<Text
							fontSize="md"
							fontWeight="semibold"
							color="white"
							noOfLines={ 2 }
							textAlign="left"
						>
							{ selectedOption.label }
						</Text>
					) : (
						<Text fontSize="md" fontWeight="medium" color="gray.400">
							Selecione a montagem
						</Text>
					) }
				</Flex>
				<FaChevronDown color="#A0AEC0" />
			</Button>

			<Modal isOpen={ isOpen } onClose={ onClose } size="4xl" scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent bg="gray.800" color="white">
					<ModalHeader fontSize="md">
						Montagem e aberturas
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={ 6 }>
						<Grid
							templateColumns={ {
								base: 'repeat(1, minmax(0, 1fr))',
								sm: 'repeat(2, minmax(0, 1fr))',
								md: 'repeat(3, minmax(0, 1fr))',
							} }
							gap={ 4 }
						>
							{ ASSEMBLY_OPTIONS.map( ( opt ) => {
								const isSelected = value === opt.value
								const imgSrc = assetFolder
									? assemblyIllustrationSrc( assetFolder, opt.value )
									: ''

								return (
									<Box
										key={ opt.value }
										as="button"
										type="button"
										textAlign="left"
										borderWidth="2px"
										borderColor={ isSelected ? 'blue.400' : 'gray.600' }
										borderRadius="lg"
										bg={ isSelected ? 'gray.700' : 'gray.900' }
										p={ 3 }
										cursor="pointer"
										w="full"
										transition="border-color 0.2s ease, background 0.2s ease"
										_hover={ {
											borderColor: isSelected ? 'blue.300' : 'gray.500',
											bg: 'gray.700',
										} }
										onClick={ () => handleSelect( opt.value ) }
									>
										{ imgSrc ? (
											<Box
												h="120px"
												w="full"
												borderRadius="md"
												bg="white"
												overflow="hidden"
												display="flex"
												alignItems="center"
												justifyContent="center"
												mb={ 3 }
											>
												<Image
													src={ imgSrc }
													alt=""
													aria-hidden
													w="full"
													h="full"
													objectFit="contain"
												/>
											</Box>
										) : null }
										<Text
											fontSize="sm"
											fontWeight={ isSelected ? 'bold' : 'semibold' }
											color="white"
											lineHeight="short"
										>
											{ opt.label }
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
