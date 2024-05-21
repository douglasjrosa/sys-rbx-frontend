import { Td, Tr } from "@chakra-ui/react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"

export const NovoCliente = ( props: { user: string } ) => {
	const [ data, setData ] = useState<any>( [] )
	const { data: session } = useSession()

	useEffect( () => {
		( async () => {
			if ( props.user ) {
				try {
					const response2 = await axios.get(
						`/api/db/empresas/search/powerbi/novo_cliente?Vendedor=${ props.user }`
					)
					setData( response2.data )
				} catch ( error ) {
					console.error( error )
				}
			}
		} )()
	}, [ props.user ] )

	const renderedData = useMemo( () => {
		return data.map( ( i: any ) => {

			return (
				<Tr key={ i.id }>
					<Td py='2' color={ 'white' } fontSize={ '12px' } borderBottom={ '1px solid #CBD5E0' } textAlign={ "center" }>
						{ i.attributes.nome }
					</Td>
					<Td py='2' color={ 'white' } fontSize={ '12px' } borderBottom={ '1px solid #CBD5E0' } textAlign={ "center" }>
						{ new Date( i.attributes.ultima_compra ).toLocaleDateString( 'pt-BR' ) }
					</Td>
				</Tr>
			)
		} )
	}, [ data ] )

	return <>{ renderedData }</>
}
