import {
	Badge as ChakraBadge,
	Box,
	Center,
	Flex,
	IconButton,
	Image,
	Link,
	List,
	ListIcon,
	ListItem,
	Text,
	VStack,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { FiMessageSquare } from 'react-icons/fi'
import NavMenuItems from './nav-menu-items'
import ProfilePopover from './profile-popover'
import React, { useState, useEffect } from 'react'
import { useUnreadDemandas } from '@/utils/useUnreadDemandas'

function Navbar () {
	const router = useRouter()
	const { data: session } = useSession()
	const [ Dados, setDados ] = useState<any>( [] )
	const unreadCount = useUnreadDemandas()

	useEffect( () => {
		if ( session?.user.primeiro_acesso === true ) {
			router.push( '/user' )
		} else if ( session?.user.pemission !== 'Adm' ) {
			const filtro = NavMenuItems.filter( ( p ) => p.permission !== 'Adm' )
			setDados( filtro )
		} else {
			setDados( NavMenuItems )
		}
	}, [ router, session?.user.pemission, session?.user.primeiro_acesso ] )

	return (
		<Flex
			flexDir="column"
			h="100vh"
			justifyContent="space-between"
			display={ [ 'none', 'none', 'flex', 'flex', 'flex' ] }
		>
			<Flex flexDir="column" as="nav">
				<Image
					rounded="5px"
					w="80%"
					m="10%"
					bg={ 'white' }
					p={ 3 }
					src="/img/logomarca-efect.jpg"
					alt="Ribermax Logomarca"
				/>
				<Flex flexDir="column" m="10%">
					<List spacing={ 5 }>
						{ Dados.map( ( navItem: any ) => (
							<ListItem key={ `navbar-${ navItem.id }` }>
								<Flex align="center">
									<ListIcon fontSize={ { md: 'xl', lg: '2xl' } } color="#00dc00" as={ navItem.icon } mb={ 0 } />
									<Link
										as={ NextLink }
										href={ navItem.url }
										fontSize={ { md: 'md', lg: 'lg', '2xl': 'xl' } }
										color={
											router.asPath === navItem.url
												? '#00dc00'
												: 'whiteAlpha.800'
										}
										target={ navItem.url.includes( 'https' ) ? '_blank' : '_self' }
										whiteSpace="nowrap"
									>
										{ navItem.text }
									</Link>
								</Flex>
							</ListItem>
						) ) }
					</List>
				</Flex>
			</Flex>

			<VStack my="15px" spacing={2}>
				<NextLink href="/demandas">
					<Box position="relative" display="inline-block">
						<IconButton
							aria-label="Demandas"
							icon={
								<FiMessageSquare
									size={unreadCount > 0 ? 26 : 20}
								/>
							}
							variant="ghost"
							color={
								unreadCount > 0
									? "orange.300"
									: "whiteAlpha.800"
							}
							_hover={{
								bg: 'gray.600',
								color: '#00dc00',
							}}
							borderRadius="full"
							size="md"
						/>
						{unreadCount > 0 && (
							<ChakraBadge
								position="absolute"
								top="-2px"
								right="-4px"
								colorScheme="orange"
								variant="solid"
								borderRadius="full"
								fontSize="2xs"
								minW="18px"
								h="18px"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								{unreadCount}
							</ChakraBadge>
						)}
					</Box>
				</NextLink>
				<ProfilePopover />
			</VStack>
		</Flex>
	)
}
export default Navbar
