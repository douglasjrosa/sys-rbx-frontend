import { Center, Flex, Text } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { GiHamburgerMenu } from 'react-icons/gi'
import { BsArrowLeftCircleFill } from 'react-icons/bs'
import { CloseIcon } from '@chakra-ui/icons'
import ProfilePopover from './profile-popover'

import React from 'react'
import {
	Button,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	IconButton,
	ResponsiveArray,
	Spacer,
	useDisclosure,
} from '@chakra-ui/react'
import { Property } from 'csstype'
import NavMenuItems from './nav-menu-items'
import { Z_INDEX } from '@/utils/zIndex'

const DRAWER_CLOSE_BLOCK_MS = 500

const MobileNavbar = () => {
	const drawerJustClosedRef = React.useRef( false )
	let fontColor:
		| string
		| ResponsiveArray<
			| Property.Color
			| 'current'
			| 'whiteAlpha.50'
			| 'whiteAlpha.100'
			| 'whiteAlpha.200'
			| 'whiteAlpha.300'
			| 'whiteAlpha.400'
			| 'whiteAlpha.500'
			| 'whiteAlpha.600'
			| 'whiteAlpha.700'
			| 'whiteAlpha.800'
			| 'whiteAlpha.900'
			| 'blackAlpha.50'
			| 'blackAlpha.100'
			| 'blackAlpha.200'
			| 'blackAlpha.300'
			| 'blackAlpha.400'
			| 'blackAlpha.500'
			| 'blackAlpha.600'
			| 'blackAlpha.700'
			| 'blackAlpha.800'
			| 'blackAlpha.900'
			| 'gray.50'
			| 'gray.100'
			| 'gray.200'
			| 'gray.300'
			| 'gray.400'
			| 'gray.500'
			| 'gray.600'
			| 'gray.700'
			| 'gray.800'
			| 'gray.900'
			| 'red.50'
			| 'red.100'
			| 'red.200'
			| 'red.300'
			| 'red.400'
			| 'red.500'
			| 'red.600'
			| 'red.700'
			| 'red.800'
			| 'red.900'
			| 'orange.50'
			| 'orange.100'
			| 'orange.200'
			| 'orange.300'
			| 'orange.400'
			| 'orange.500'
			| 'orange.600'
			| 'orange.700'
			| 'orange.800'
			| 'orange.900'
			| 'yellow.50'
			| 'yellow.100'
			| 'yellow.200'
			| 'yellow.300'
			| 'yellow.400'
			| 'yellow.500'
			| 'yellow.600'
			| 'yellow.700'
			| 'yellow.800'
			| 'yellow.900'
			| 'green.50'
			| 'green.100'
			| 'green.200'
			| 'green.300'
			| 'green.400'
			| 'green.500'
			| 'green.600'
			| 'green.700'
			| 'green.800'
			| 'green.900'
			| 'teal.50'
			| 'teal.100'
			| 'teal.200'
			| 'teal.300'
			| 'teal.400'
			| 'teal.500'
			| 'teal.600'
			| 'teal.700'
			| 'teal.800'
			| 'teal.900'
			| 'blue.50'
			| 'blue.100'
			| 'blue.200'
			| 'blue.300'
			| 'blue.400'
			| 'blue.500'
			| 'blue.600'
			| 'blue.700'
			| 'blue.800'
			| 'blue.900'
			| 'cyan.50'
			| 'cyan.100'
			| 'cyan.200'
			| 'cyan.300'
			| 'cyan.400'
			| 'cyan.500'
			| 'cyan.600'
			| 'cyan.700'
			| 'cyan.800'
			| 'cyan.900'
			| 'purple.50'
			| 'purple.100'
			| 'purple.200'
			| 'purple.300'
			| 'purple.400'
			| 'purple.500'
			| 'purple.600'
			| 'purple.700'
			| 'purple.800'
			| 'purple.900'
			| 'pink.50'
			| 'pink.100'
			| 'pink.200'
			| 'pink.300'
			| 'pink.400'
			| 'pink.500'
			| 'pink.600'
			| 'pink.700'
			| 'pink.800'
			| 'pink.900'
			| 'linkedin.50'
			| 'linkedin.100'
			| 'linkedin.200'
			| 'linkedin.300'
			| 'linkedin.400'
			| 'linkedin.500'
			| 'linkedin.600'
			| 'linkedin.700'
			| 'linkedin.800'
			| 'linkedin.900'
			| 'facebook.50'
			| 'facebook.100'
			| 'facebook.200'
			| 'facebook.300'
			| 'facebook.400'
			| 'facebook.500'
			| 'facebook.600'
			| 'facebook.700'
			| 'facebook.800'
			| 'facebook.900'
			| 'messenger.50'
			| 'messenger.100'
			| 'messenger.200'
			| 'messenger.300'
			| 'messenger.400'
			| 'messenger.500'
			| 'messenger.600'
			| 'messenger.700'
			| 'messenger.800'
			| 'messenger.900'
			| 'whatsapp.50'
			| 'whatsapp.100'
			| 'whatsapp.200'
			| 'whatsapp.300'
			| 'whatsapp.400'
			| 'whatsapp.500'
			| 'whatsapp.600'
			| 'whatsapp.700'
			| 'whatsapp.800'
			| 'whatsapp.900'
			| 'twitter.50'
			| 'twitter.100'
			| 'twitter.200'
			| 'twitter.300'
			| 'twitter.400'
			| 'twitter.500'
			| 'twitter.600'
			| 'twitter.700'
			| 'twitter.800'
			| 'twitter.900'
			| 'telegram.50'
			| 'telegram.100'
			| 'telegram.200'
			| 'telegram.300'
			| 'telegram.400'
			| 'telegram.500'
			| 'telegram.600'
			| 'telegram.700'
			| 'telegram.800'
			| 'telegram.900'
			| 'chakra-body-text'
			| 'chakra-body-bg'
			| 'chakra-border-color'
			| 'chakra-placeholder-color'
		>
		| Partial<
			Record<
				string | ( string & {} ),
				| Property.Color
				| 'current'
				| 'whiteAlpha.50'
				| 'whiteAlpha.100'
				| 'whiteAlpha.200'
				| 'whiteAlpha.300'
				| 'whiteAlpha.400'
				| 'whiteAlpha.500'
				| 'whiteAlpha.600'
				| 'whiteAlpha.700'
				| 'whiteAlpha.800'
				| 'whiteAlpha.900'
				| 'blackAlpha.50'
				| 'blackAlpha.100'
				| 'blackAlpha.200'
				| 'blackAlpha.300'
				| 'blackAlpha.400'
				| 'blackAlpha.500'
				| 'blackAlpha.600'
				| 'blackAlpha.700'
				| 'blackAlpha.800'
				| 'blackAlpha.900'
				| 'gray.50'
				| 'gray.100'
				| 'gray.200'
				| 'gray.300'
				| 'gray.400'
				| 'gray.500'
				| 'gray.600'
				| 'gray.700'
				| 'gray.800'
				| 'gray.900'
				| 'red.50'
				| 'red.100'
				| 'red.200'
				| 'red.300'
				| 'red.400'
				| 'red.500'
				| 'red.600'
				| 'red.700'
				| 'red.800'
				| 'red.900'
				| 'orange.50'
				| 'orange.100'
				| 'orange.200'
				| 'orange.300'
				| 'orange.400'
				| 'orange.500'
				| 'orange.600'
				| 'orange.700'
				| 'orange.800'
				| 'orange.900'
				| 'yellow.50'
				| 'yellow.100'
				| 'yellow.200'
				| 'yellow.300'
				| 'yellow.400'
				| 'yellow.500'
				| 'yellow.600'
				| 'yellow.700'
				| 'yellow.800'
				| 'yellow.900'
				| 'green.50'
				| 'green.100'
				| 'green.200'
				| 'green.300'
				| 'green.400'
				| 'green.500'
				| 'green.600'
				| 'green.700'
				| 'green.800'
				| 'green.900'
				| 'teal.50'
				| 'teal.100'
				| 'teal.200'
				| 'teal.300'
				| 'teal.400'
				| 'teal.500'
				| 'teal.600'
				| 'teal.700'
				| 'teal.800'
				| 'teal.900'
				| 'blue.50'
				| 'blue.100'
				| 'blue.200'
				| 'blue.300'
				| 'blue.400'
				| 'blue.500'
				| 'blue.600'
				| 'blue.700'
				| 'blue.800'
				| 'blue.900'
				| 'cyan.50'
				| 'cyan.100'
				| 'cyan.200'
				| 'cyan.300'
				| 'cyan.400'
				| 'cyan.500'
				| 'cyan.600'
				| 'cyan.700'
				| 'cyan.800'
				| 'cyan.900'
				| 'purple.50'
				| 'purple.100'
				| 'purple.200'
				| 'purple.300'
				| 'purple.400'
				| 'purple.500'
				| 'purple.600'
				| 'purple.700'
				| 'purple.800'
				| 'purple.900'
				| 'pink.50'
				| 'pink.100'
				| 'pink.200'
				| 'pink.300'
				| 'pink.400'
				| 'pink.500'
				| 'pink.600'
				| 'pink.700'
				| 'pink.800'
				| 'pink.900'
				| 'linkedin.50'
				| 'linkedin.100'
				| 'linkedin.200'
				| 'linkedin.300'
				| 'linkedin.400'
				| 'linkedin.500'
				| 'linkedin.600'
				| 'linkedin.700'
				| 'linkedin.800'
				| 'linkedin.900'
				| 'facebook.50'
				| 'facebook.100'
				| 'facebook.200'
				| 'facebook.300'
				| 'facebook.400'
				| 'facebook.500'
				| 'facebook.600'
				| 'facebook.700'
				| 'facebook.800'
				| 'facebook.900'
				| 'messenger.50'
				| 'messenger.100'
				| 'messenger.200'
				| 'messenger.300'
				| 'messenger.400'
				| 'messenger.500'
				| 'messenger.600'
				| 'messenger.700'
				| 'messenger.800'
				| 'messenger.900'
				| 'whatsapp.50'
				| 'whatsapp.100'
				| 'whatsapp.200'
				| 'whatsapp.300'
				| 'whatsapp.400'
				| 'whatsapp.500'
				| 'whatsapp.600'
				| 'whatsapp.700'
				| 'whatsapp.800'
				| 'whatsapp.900'
				| 'twitter.50'
				| 'twitter.100'
				| 'twitter.200'
				| 'twitter.300'
				| 'twitter.400'
				| 'twitter.500'
				| 'twitter.600'
				| 'twitter.700'
				| 'twitter.800'
				| 'twitter.900'
				| 'telegram.50'
				| 'telegram.100'
				| 'telegram.200'
				| 'telegram.300'
				| 'telegram.400'
				| 'telegram.500'
				| 'telegram.600'
				| 'telegram.700'
				| 'telegram.800'
				| 'telegram.900'
		| 'chakra-body-text'
			| 'chakra-body-bg'
			| 'chakra-border-color'
			| 'chakra-placeholder-color'
		>
		>
	const router = useRouter()
	const { isOpen, onOpen, onClose } = useDisclosure()
	const MENU_ITEM_FONT_SIZE = '1.5rem'
	const MENU_ITEM_ICON_SIZE = '1.75rem'

	const isPrimaryRoute = NavMenuItems.some( ( item ) => router.asPath === item.url )
	const matchedPrimaryItem = NavMenuItems.find( ( item ) => router.asPath === item.url )

	const handleDrawerClose = ( e?: React.MouseEvent ) => {
		e?.stopPropagation()
		e?.preventDefault()
		drawerJustClosedRef.current = true
		onClose()
		setTimeout( () => {
			drawerJustClosedRef.current = false
		}, DRAWER_CLOSE_BLOCK_MS )
	}

	return (
		<Flex
			flexDir="row"
			h="60px"
			minH="60px"
			w="100%"
			p="10px"
			bg="gray.700"
			flexShrink={ 0 }
			overflow="hidden"
			display={ [ 'flex', 'flex', 'none', 'none', 'none' ] }
		>
			<Center>
				<IconButton
					h="36px"
					w="36px"
					minW="36px"
					p="6px"
					color="#00dc00"
					aria-label="Options"
					icon={ <GiHamburgerMenu /> }
					fontSize="22px"
					ml="0"
					bg="transparent"
					borderRadius="md"
					transition="all 0.2s"
					border="1px solid"
					borderColor="#00dc00"
					_hover={ { bg: '#00dc00', color: 'white', borderColor: '#00dc00' } }
					_active={ { bg: '#00dc00', color: 'white', borderColor: '#00dc00' } }
					onClick={ onOpen }
				/>
				<Drawer
					isOpen={ isOpen }
					onClose={ handleDrawerClose }
					placement="left"
					size="full"
					closeOnOverlayClick={ false }
				>
					<DrawerOverlay zIndex={ Z_INDEX.MOBILE_NAVBAR_OVERLAY } bg="blackAlpha.700" />
					<DrawerContent
						bg="gray.700"
						maxW="100vw"
						zIndex={ Z_INDEX.MOBILE_NAVBAR_CONTENT }
						sx={ { position: 'fixed' } }
					>
						<DrawerHeader
							bg="gray.600"
							borderBottom="1px"
							borderColor="gray.600"
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							px="24px"
							py="20px"
						>
							<Text color="white" fontSize="1.25rem">
								Menu
							</Text>
							<IconButton
								aria-label="Fechar menu"
								icon={ <CloseIcon /> }
								color="white"
								bg="transparent"
								_hover={ { bg: 'gray.500' } }
								onClick={ ( e ) => handleDrawerClose( e ) }
							/>
						</DrawerHeader>
						<DrawerBody p="0">
							<Flex flexDir="column" h="100%">
								{ NavMenuItems.map( ( item ) => {
									if ( router.asPath === item.url ) {
										fontColor = '#00dc00'
									} else {
										fontColor = 'whiteAlpha.800'
									}

									return (
										<NextLink
											href={ item.url }
											key={ `mobile-nav-link-${ item.id }` }
											target={ item.url.includes( 'https' ) ? '_blank' : '_self' }
											onClick={ onClose }
										>
											<Flex
												alignItems="center"
												gap="4"
												px="24px"
												py="20px"
												minH="64px"
												bg="gray.600"
												color={ fontColor }
												fontSize={ MENU_ITEM_FONT_SIZE }
												_hover={ { bg: 'gray.500', color: 'white' } }
												_focus={ { bg: 'gray.500', color: 'white' } }
												sx={ { '& svg': { fontSize: MENU_ITEM_ICON_SIZE, flexShrink: 0 } } }
												cursor="pointer"
											>
												{ item.iconComponent }
												{ item.text }
											</Flex>
										</NextLink>
									)
								} ) }
							</Flex>
						</DrawerBody>
					</DrawerContent>
				</Drawer>
				{ isPrimaryRoute && matchedPrimaryItem ? (
					<Text ml="15px" color="whiteAlpha.800" fontSize="2xl">
						{ matchedPrimaryItem.text }
					</Text>
				) : (
					<Button
						ml="15px"
						h="36px"
						leftIcon={ <BsArrowLeftCircleFill size={ 20 } /> }
						variant="outline"
						color="#00dc00"
						borderColor="#00dc00"
						_hover={ { bg: '#00dc00', color: 'white', borderColor: '#00dc00' } }
						onClick={ () => router.back() }
					>
						Voltar
					</Button>
				) }
			</Center>
			<Spacer />
			<Center px="0">
				<ProfilePopover isMobile blockOpenRef={ drawerJustClosedRef } />
			</Center>
		</Flex>
	)
}
export default MobileNavbar
