import { Box, FormLabel, Skeleton, Text } from '@chakra-ui/react'

export const LabelEmpresa = ( props: { companyName: string } ) => (
	<>
		<FormLabel
			fontSize="xs"
			fontWeight="md"
			color="white"
		>
			Cliente
		</FormLabel>
		<Box w="full">
			{ props.companyName &&
				<Text
					fontSize="sm"
					fontWeight="md"
					color="white"
				>{ props.companyName }</Text>
				||
				<Skeleton height='27px' w="28" startColor='gray.600' endColor='gray.700' rounded={ "md" } />
			}
		</Box>
	</>
)