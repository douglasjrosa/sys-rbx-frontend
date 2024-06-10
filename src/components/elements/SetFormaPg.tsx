import { Box, FormLabel, Select } from "@chakra-ui/react"
import axios from "axios"
import { useState, useEffect } from "react"


export const SetFormaPg = ( props: { id: any; retorno: any; envio: any; Disable: boolean } ) => {
	const [ maxPg, setMaxPg ] = useState( "" )
	const [ Data, setData ] = useState<any>( [] )
	const { id, retorno, envio, Disable } = props
	
	useEffect( () => {
		setMaxPg( retorno ?? "" )
		if ( id ) {
			( async () => {
				await axios( {
					method: "GET",
					url: `/api/db/empresas/getFormaPg?Empresa=${ id }`,
				} )
					.then( ( res ) => setData( res.data ) )
					.catch( ( err ) => console.error( err ) )
			} )()
		}
	}, [ id, retorno ] )


	return (
		<>
			<Box>
				<FormLabel
					fontSize="xs"
					fontWeight="md"
				>
					Condição de pagamento
				</FormLabel>
				<Select
					shadow="sm"
					size="xs"
					w="36"
					fontSize="xs"
					rounded="md"
					onChange={ ( e ) => {
						setMaxPg( e.target.value )
						envio( e.target.value )
					}}
					value={ maxPg }
					isDisabled={ Disable }
				>
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
		</>
	)
}
