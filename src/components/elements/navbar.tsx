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
					src="https://ribermax.com.br/images/logomarca-h.webp?w=1080&q=75"
					alt="Ribermax Logomarca"
				/>
				<Flex flexDir="column" m="10%">
					<List spacing={ 5 }>
						{ Dados.map( ( navItem: any ) => (
							<ListItem key={ `navbar-${ navItem.id }` }>
								<Text>
									<ListIcon fontSize="2xl" color="lime" as={ navItem.icon } />
									<Link
										as={ NextLink }
										href={ navItem.url }
										fontSize="lg"
										color={
											router.asPath === navItem.url
												? 'lime'
												: 'whiteAlpha.800'
										}
									>
										{ navItem.text }
									</Link>
								</Text>
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
