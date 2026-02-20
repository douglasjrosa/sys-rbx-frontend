/* eslint-disable react/prop-types */
import { Box, Flex, useToast } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import Loading from './elements/loading'
import MobileNavbar from './elements/mobile-navbar'
import Navbar from './elements/navbar'
import { Z_INDEX } from '@/utils/zIndex'
import { PortalManager } from '@chakra-ui/react'

function Layout ( { children }: { children: React.ReactNode } ): JSX.Element {
	const [ navbarContainer, setNavbarContainer ] = useState<HTMLDivElement | null>( null )

	useEffect( () => {
		const container = document.createElement( 'div' )
		container.id = 'navbar-portal-root'
		container.style.cssText =
			`position:fixed;top:0;left:0;right:0;height:60px;z-index:${Z_INDEX.MOBILE_NAVBAR_LAYER};pointer-events:none;`
		document.body.appendChild( container )
		setNavbarContainer( container )
		return () => {
			if ( document.body.contains( container ) ) {
				document.body.removeChild( container )
			}
		}
	}, [] )
	const toast = useToast()
	const router = useRouter()
	const { data: session, status } = useSession()

	if ( status === 'loading' ) {
		return <Loading size="200px">Carregando...</Loading>
	}

	if ( !session && router.asPath !== '/auth/signin' ) {
		router.push( '/auth/signin' )
	}

	if ( !status && router.asPath !== '/auth/signin' ) {
		router.push( '/auth/signin' )
	}

	if ( !session && router.asPath === '/auth/signin' ) {
		return <>{ children }</>
	}

	if ( !session && router.asPath !== '/auth/signin' ) {
		router.push( '/auth/signin' )
	}

	if (
		!session &&
		router.asPath ===
		'/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000&error=CredentialsSignin'
	) {
		toast( {
			title: 'Email ou senha incorreto',
			description: 'As credenciais que você está usando são inválidas.',
			status: 'error',
			duration: 7000,
			position: 'top-right',
			isClosable: true,
		} )
		return <>{ children }</>
	}

	if ( !status && router.asPath === '/' ) {
		router.push( '/auth/signin' )
		return (
			<Box w={ '100vw' } h={ '100vh' }>
				<Loading size="200px">Carregando...</Loading>
			</Box>
		)
	}

	if ( !session && router.asPath === '/' ) {
		router.push( '/auth/signin' )
		return (
			<Box w={ '100vw' } h={ '100vh' }>
				<Loading size="200px">Carregando...</Loading>
			</Box>
		)
	}

	if (
		( session && router.asPath === '/auth/signin' ) ||
		( status && router.asPath === '/auth/signin' )
	) {
		router.push( '/' )
		const UserEmail: any | null = session?.user.email
		localStorage.setItem( "email", UserEmail )
		return (
			<Box w={ '100vw' } h={ '100vh' }>
				<Loading size="200px">Carregando...</Loading>
			</Box>
		)
	}

	if ( router.asPath === '/auth/signin#' ) {
		router.push( '/auth/signin' )
		return (
			<Box w={ '100vw' } h={ '100vh' }>
				<Loading size="200px">Carregando...</Loading>
			</Box>
		)
	}



	return (
		<Flex
			h={ '100vh' }
			w={ '100vw' }
			flexDir={ [ 'column', 'column', 'row' ] }
			overflow="hidden"
			maxW="2000px"
			fontSize={ '1rem' }
					>
			<PortalManager zIndex={100}>
			<Flex
				alignItems="center"
				bg="gray.700"
				flexDir="column"
				minW="150px"
				w={ [ '100%', '100%', '15%', '15%', '15%' ] }
				display={ [ 'none', 'none', 'flex', 'flex', 'flex' ] }
			>
				<Navbar />
			</Flex>
			{ navbarContainer && createPortal(
				<Box
					position="fixed"
					top={ 0 }
					left={ 0 }
					right={ 0 }
					display={ [ 'block', 'block', 'none', 'none', 'none' ] }
					pointerEvents="auto"
				>
					<PortalManager zIndex={Z_INDEX.MOBILE_NAVBAR_LAYER}>
						<MobileNavbar />
					</PortalManager>
				</Box>,
				navbarContainer
			) }

			<Flex
				flexDir="column"
				minH={ [ 'calc(100vh - 60px)', 'calc(100vh - 60px)', '100vh', '100vh', '100vh' ] }
				h={ [ 'calc(100vh - 60px)', 'calc(100vh - 60px)', '100%', '100%', '100%' ] }
				w={ { sm: '100%', md: '100%' } }
				mt={ [ '60px', '60px', 0, 0, 0 ] }
				position="relative"
				zIndex={ 1 }
			>
				<Box flex={1} minH={0} overflow="auto">
					{ children }
				</Box>
			</Flex>
			</PortalManager>
		</Flex>
	)
}


export default Layout
