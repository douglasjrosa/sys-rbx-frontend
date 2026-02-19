import { Flex, IconButton, Textarea, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FaLocationArrow } from 'react-icons/fa'

export const NegocioFooter = ( props: { onGetValue: any; onOptimisticUpdate?: ( record: any[] ) => void; data: any } ) => {
	const router = useRouter()
	const ID = router.query.id
	const toast = useToast()
	const { data: session } = useSession()
	const [ Valor, setValor ] = useState( '' )
	const [ isSending, setIsSending ] = useState( false )

	useEffect( () => {
		setTimeout( () => {
			props.onGetValue( false )
		}, 500 )
	}, [ props ] )

	const addItens = async () => {
		const date = new Date()
		const DateAtua = date.toISOString()

		const msg = {
			date: DateAtua,
			user: session?.user.name,
			msg: Valor,
		}

		const record = [ ...props.data, msg ]

		const data = {
			data: {
				incidentRecord: record,
			},
		}
		if ( Valor.trim() !== '' ) {
			setIsSending( true )
			props.onOptimisticUpdate?.( record )
			await axios( {
				method: 'PUT',
				url: '/api/db/business/put/id/' + ID,
				data: data,
			} )
				.then( ( res ) => {
					props.onGetValue( true )
					setValor( '' )
				} )
				.catch( ( err ) => {
					props.onGetValue( true )
					console.error( err )
					toast( {
						title: 'ops erro',
						description: err,
						status: 'error',
						duration: 9000,
						isClosable: true,
					} )
				} )
				.finally( () => setIsSending( false ) )
		}
	}

	return (
		<Flex gap={3} alignItems="stretch" w="full">
			<Textarea
				flex={1}
				resize="none"
				overflowY="auto"
				fontSize="15px"
				lineHeight="1.2"
				bg="#ffffff12"
				color="white"
				p="10px"
				rounded="5px"
				borderColor="gray.300"
				minH="44px"
				value={Valor}
				onChange={( e: any ) => setValor( e.target.value )}
				placeholder="Digite sua anotação"
			/>
			<IconButton
				aria-label="Enviar"
				bg="#38A169"
				color="gray.700"
				icon={<FaLocationArrow />}
				onClick={addItens}
				isLoading={isSending}
				minH="44px"
				minW="44px"
				flexShrink={0}
			/>
		</Flex>
	)
}
