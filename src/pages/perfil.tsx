import { getBlingToken } from "@/function/update-bling-token"
import { useEffect, useState } from "react"

function Perfil () {

	const [ vai, setVai ] = useState( false )

	useEffect( () => {
		if ( vai ) {
			( async () => {
				const account = "Daniela"
				const access_token = await getBlingToken( account )
				console.log( access_token )
				setVai( false )
			})()
		}
	} )

	return <h1><button onClick={ () => setVai( true ) }>Perfil</button></h1>
}

export default Perfil
