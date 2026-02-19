import { generateCurrentAndPast12Months } from '@/function/dateselect'
import {
	Box,
	Flex,
	FormLabel,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Button,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'

const CURRENT_MONTH_ID = 13
const SELECT_WIDTH = { base: '100%', sm: '10rem', md: '12rem' }

export const SelectMonth = ( props: {
	onValue?: any
} ) => {
	const [ date, setDate ] = useState<number>( CURRENT_MONTH_ID )
	const [ Object, setObject ] = useState<any>()

	useEffect( () => {
		setObject( generateCurrentAndPast12Months() )
	}, [] )

	const handleSelect = ( item: { id: number; name: string; month: number; year: number } ) => {
		setDate( item.id )
		props.onValue?.( item )
	}

	const selectedItem = Object?.find( ( i: any ) => i.id === date )

	return (
		<Flex gap={ 3 } flexDir="row" alignItems="flex-end" w={{ base: '100%', sm: 'auto' }}>
			<Box w={{ base: '100%', sm: 'auto' }}>
				<FormLabel fontSize="xs" fontWeight="md" color="white">
					Mes
				</FormLabel>
				<Menu matchWidth>
					<MenuButton
						as={ Button }
						rightIcon={ <ChevronDownIcon /> }
						w={ SELECT_WIDTH }
						textAlign="center"
						justifyContent="center"
						fontWeight="normal"
						bg="gray.600"
						color="white"
						borderColor="gray.500"
						_hover={{ bg: 'gray.500' }}
						_expanded={{ bg: 'gray.500' }}
					>
						{ selectedItem?.name ?? '...' }
					</MenuButton>
					<MenuList
						bg="gray.700"
						borderColor="gray.600"
						overflow="hidden"
					>
						{ !!Object && Object.map( ( i: any ) => (
							<MenuItem
								key={ i.id }
								onClick={ () => handleSelect( i ) }
								bg="transparent"
								color="white"
								justifyContent="center"
								textAlign="center"
								_hover={{ bg: 'gray.600' }}
								_focus={{ bg: 'gray.600' }}
								overflow="hidden"
								textOverflow="ellipsis"
								whiteSpace="nowrap"
							>
								{ i.name }
							</MenuItem>
						) ) }
					</MenuList>
				</Menu>
			</Box>
		</Flex>
	)
}
