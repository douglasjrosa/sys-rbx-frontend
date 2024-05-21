import { Box, FormLabel, Select } from "@chakra-ui/react"
import axios from "axios"
import { useState, useEffect } from "react"


export const SetFormaPg = ( props: { id: any; retorno: any; envio: any; Disable: boolean } ) => {
	const [ maxPg, setMaxpg ] = useState( "" )
	const [ Data, setData ] = useState<any>( [] )


	useEffect( () => {
		if ( props.retorno ) {
			setMaxpg( props.retorno )
		}
		if ( props.id ) {
			( async () => {
				await axios( {
					method: "GET",
					url: `/api/db/empresas/getFormaPg?Empresa=${ props.id }`,
				} )
					.then( ( res ) => setData( res.data ) )
					.catch( ( err ) => console.error( err ) )
			} )()
		}
	}, [ props.id, props.retorno ] )


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
					onChange={ ( e ) => props.envio( e.target.value ) }
					value={ maxPg }
					isDisabled={ props.Disable }
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
