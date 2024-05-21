import { Box, Button, Flex, FormLabel, Select, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export const SelectEmpresas = ( props: {
	onValue: any; Usuario: any
} ) => {
	const [ IdEmp, setIdEmp ] = useState( '' )
	const [ Data, setData ] = useState<any>( [] )
	const { data: session } = useSession()
	const toast = useToast()

	useEffect( () => {
		if ( props.Usuario ) {
			( async () => {
				localStorage.setItem( 'Usuario', props.Usuario )
				await axios.get( `/api/db/empresas/getEmpresamin?Vendedor=${ props.Usuario }` )
					.then( ( resp ) => {
						setData( resp.data )
					} )
					.catch( ( err ) => console.error( err ) )
			} )()
		}
	}, [ props.Usuario, session?.user.name ] )

	const EspecifcFilter: any = [
		{ id: 1, nome: 'EM ANDAMENTO' },
		{ id: 2, nome: 'CONCLUÍDOS' },
		{ id: 3, nome: 'TODOS OS NEGÓCIOS' },
		{ id: 4, nome: 'PERDIDO' }
	]

	const HandleValue = () => {
		( async () => {

			if ( IdEmp === '0' ) props.onValue( null )
			const filter = EspecifcFilter.filter( ( f: any ) => f.nome === IdEmp )
			if ( filter.length > 0 ) {
				await axios.get( `/api/db/business/get/filter?Pesqisa=${ IdEmp }&Vendedor=${ props.Usuario }` )
					.then( ( resp ) => {
						props.onValue( resp.data )
					} )
					.catch( ( err ) => console.error( err ) )
			} else {
				await axios.get( `/api/db/business/get/filter?Empresa=${ IdEmp }` )
					.then( ( resp ) => {
						props.onValue( resp.data )

					} )
					.catch( ( err ) => console.error( err ) )
			}
		} )()
	}

	return (
		<>
			<Flex flexDirection={ 'row' } gap={ 6 } w={ '100%' } alignItems={ 'self-end' }>
				<Box>
					<FormLabel
						htmlFor="cnpj"
						fontSize="xs"
						fontWeight="md"
						color="white"
					>
						Filtro
					</FormLabel>
					<Select
						w={ '20rem' }
						onChange={ ( e ) => setIdEmp( e.target.value ) }
						value={ IdEmp }
						color="white"
						bg='gray.800'
					>
						<option style={ { backgroundColor: "#1A202C" } } value={ '0' }>selecione uma opção</option>
						{ EspecifcFilter.map( ( f: any ) => {
							return (
								<option style={ { backgroundColor: "#1A202C" } } key={ f.id } value={ f.nome }>{ f.nome }</option>
							)
						} ) }
						{ Data.map( ( i: any ) => {
							return (
								<option style={ { backgroundColor: "#1A202C" } } key={ i.id } value={ i.id }>
									{ i.attributes.nome }
								</option>
							)
						} ) }
					</Select>
				</Box>
				<Button variant={ 'solid' } px={ 8 } colorScheme='green' onClick={ HandleValue }>Filtrar</Button>
			</Flex>
		</>
	)
}
