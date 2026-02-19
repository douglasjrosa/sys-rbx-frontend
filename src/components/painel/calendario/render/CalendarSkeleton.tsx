import { Box, Flex, Skeleton } from '@chakra-ui/react'

const DECENDIO_TITLES = [
	'Vendas do 1° Decêndio',
	'Vendas do 2° Decêndio',
	'Vendas do 3° Decêndio',
]

const DAYS_PER_DECENDIO = 10

export const CalendarSkeleton = () => (
	<>
		{ DECENDIO_TITLES.map( ( _, index ) => (
			<Flex
				key={ index }
				bg="gray.700"
				direction="column"
				w="100%"
				maxW="1200px"
				alignItems="center"
				px={{ base: 3, md: 5 }}
				pt={ 3 }
				pb={ 3 }
				mb={ 4 }
				borderRadius="md"
			>
				<Box w="100%" textAlign="center" mb={ 2 }>
					<Skeleton height="20px" width="180px" borderRadius="md" mx="auto" />
				</Box>
				<Box pt={ 4 } w="full">
					<Flex gap={ 1 } flexWrap="wrap" justifyContent="center">
						{ Array.from( { length: DAYS_PER_DECENDIO } ).map( ( _, dayIndex ) => (
							<Skeleton
								key={ dayIndex }
								w={{ base: '5.5rem', sm: '6rem', md: '7rem' }}
								minH={{ base: '5rem', md: '6rem' }}
								borderRadius="md"
								startColor="gray.600"
								endColor="gray.700"
							/>
						) ) }
					</Flex>
				</Box>
			</Flex>
		) ) }
	</>
)
