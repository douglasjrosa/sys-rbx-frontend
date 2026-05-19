import { Box, Heading, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type ProductFormCardProps = BoxProps & {
	title: string
	children: ReactNode
}

export function ProductFormCard( {
	title,
	children,
	...boxProps
}: ProductFormCardProps ) {
	return (
		<Box
			bg="gray.700"
			p={ 6 }
			borderRadius="xl"
			shadow="2xl"
			{ ...boxProps }
		>
			<Heading size="sm" color="blue.300" mb={ 4 } textTransform="uppercase">
				{ title }
			</Heading>
			{ children }
		</Box>
	)
}
