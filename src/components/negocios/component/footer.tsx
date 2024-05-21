import { NotasSms } from '@/components/data/notas'
import { Box, Flex, IconButton, Select, Textarea, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FaLocationArrow } from 'react-icons/fa'

export const NegocioFooter = ( props: { onGetValue: any; data: any } ) => {
	const router = useRouter()
	const ID = router.query.id
	const toast = useToast()
	const { data: session } = useSession()
	const [ Valor, setValor ] = useState( '' )
	const [ Flag, setFlag ] = useState( 'Notas' )

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
			flag: Flag,
			msg: Valor,
		}

		const record = [ ...props.data, msg ]

		const data = {
			data: {
				incidentRecord: record,
			},
		}
		if ( Valor.trim() !== '' ) {
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
		}
	}

	return (
		<>

			<Flex
				px={ { base: '2rem', md: '4rem' } }
				py={ 4 }
				h={ '100%' }
				justifyContent={ 'space-between' }
				alignItems={ 'center' }
				gap={ 5 }
			>
				<Textarea
					resize={ 'none' }
					overflowY={ 'hidden' }
					fontSize={ '15px' }
					lineHeight={ '1.2' }
					bg={ '#ffffff12' }
					color={ 'white' }
					p={ '10px' }
					w={ '85%' }
					rounded={ '5px' }
					borderColor={ 'gray.300' }
					rows={ 1 }
					onChange={ ( e: any ) => setValor( e.target.value ) }
				/>
				<Box color={ 'white' }>
					<Select
						bg='#2a303b'
						borderColor='white'
						p={ '10px' }
						rounded={ '5px' }
						fontSize='12px'
						w='11rem'
						focusBorderColor='white'
						onChange={ ( e ) => setFlag( e.target.value ) }
					>
						{ NotasSms.map( ( i: any ) => {
							return (
								<option
									key={ i.id }
									style={ { backgroundColor: '#2a303b' } }
								>
									{ i.title }
								</option >
							)
						} ) }
					</Select>
				</Box>
				<IconButton
					aria-label="Send"
					style={ { backgroundColor: '#38A169' } }
					fontSize={ 'xl' }
					icon={ <FaLocationArrow /> }
					color="gray.700"
					onClick={ addItens }
					h='3rem'
					w='5rem'
				/>
			</Flex >

		</>
	)
}
