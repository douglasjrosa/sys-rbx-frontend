/* eslint-disable react/display-name */
import { Box, Flex, FormLabel, Select } from "@chakra-ui/react"
import axios from "axios"
import { useState, useEffect } from "react"


export const GetPrazoPg = ( props: { id: any; retorno: any; envio: any } ) => {
	const [ maxPg, setMaxPg ] = useState( "0" )
	const [ Data, setData ] = useState<any>( [] )
	const { id, retorno, envio } = props

	useEffect( () => {
		
		setMaxPg( retorno ?? "" )

		
		if ( id ) {
			( async () => {
				await axios( {
					method: "GET",
					url: `/api/db/empresas/getMaxPrazoPg?Empresa=${ id }`,
				} )
					.then( ( res ) => setData( res.data ) )
					.catch( ( err ) => console.error( err ) )
			} )()
		}
	}, [ id, retorno ] )
	
	return (
		<>
			<Flex gap={ 3 } alignItems={ 'self-end' }>
				<Box>
					{/* Label for the maximum payment deadline selection */ }
					<FormLabel
						htmlFor="prazo pagamento"
						fontSize="xs"
						fontWeight="md"
					>
						Máximo prazo p/ pagamento:
					</FormLabel>
					{/* Select element for choosing the maximum payment deadline */ }
					<Select
						focusBorderColor="#ffff"
						bg='#ffffff12'
						shadow="sm"
						size="xs"
						w="full"
						fontSize="xs"
						rounded="md"
						onChange={ ( e ) => {
							setMaxPg( e.target.value )
							envio( e.target.value )
						}
						}
						value={ maxPg }
					>
						{/* Default option */ }
						<option style={ { backgroundColor: "#1A202C" } }>
							Selecione uma tabela
						</option>
						{ Data.map( ( i: any ) => {
							return (
								<option style={ { backgroundColor: "#1A202C" } } key={ i.id } value={ i.attributes.value }>
									{ i.attributes.title }
								</option>
							)
						} ) }
					</Select>
				</Box>
			</Flex>
		</>
	)
}
