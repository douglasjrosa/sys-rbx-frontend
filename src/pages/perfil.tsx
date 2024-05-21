import { getBlingToken } from "@/pages/api/bling/auth/update-bling-token"
import { useEffect, useState, useCallback } from "react"

function Perfil () {

	const [ vai, setVai ] = useState( false )

	const accessToken = useCallback( async () => {
		const account = "45683129000180"
		const access_token = await getBlingToken( account )
		setVai( false )
	}, [ setVai ] )

	const getContatos = useCallback( async () => {

		const account = "45683129000180"
		const access_token = await getBlingToken( account )
		console.log( access_token )

		const url = "api/bling/contatos"
		const contatos = await fetch( url, {
			method: "GET",
			headers: {
				authorization: `Bearer ${ access_token }`
			}
		} ).then( r => r.json() )
		setVai( false )
	}, [ setVai ] )

	useEffect( () => {
		if ( vai ) {
			//accessToken()
			getContatos()
		}
	}, [ vai, getContatos ] )

	return (
		<div>
			<h1>Perfil</h1>
			<button onClick={ () => setVai( true ) }>Vai</button>
		</div>
	)

}

export default Perfil