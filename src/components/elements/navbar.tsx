import {
	Center,
	Flex,
	Image,
	Link,
	List,
	ListIcon,
	ListItem,
	Text,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import NavMenuItems from './nav-menu-items'
import ProfilePopover from './profile-popover'
import React, { useState, useEffect } from 'react'

function Navbar () {
	const router = useRouter()
	const { data: session } = useSession()
	const [ Dados, setDados ] = useState<any>( [] )

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
									<ListIcon fontSize={ { md: 'xl', lg: '2xl' } } color="lime" as={ navItem.icon } mb={ 0 } />
									<Link
										as={ NextLink }
										href={ navItem.url }
										fontSize={ { md: 'md', lg: 'lg', '2xl': 'xl' } }
										color={
											router.asPath === navItem.url
												? 'lime'
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

			<Center my="15px">
				<ProfilePopover />
			</Center>
		</Flex>
	)
}
export default Navbar
