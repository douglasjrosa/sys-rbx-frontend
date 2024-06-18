import EmitenteSelect from "@/components/emitenteSelect"
import { useEffect, useState, useCallback } from "react"

function Perfil () {

	const [ vai, setVai ] = useState( false )
	const [ emitenteCnpj, setEmitenteCnpj ] = useState( "" )
	const [ accountsData, setAccountsData ] = useState<any[]>()


	const fetchAccounts = useCallback( async () => {
		const response = await fetch( '/api/strapi/tokens' )

		if ( !response.ok ) console.error( response )

		const accounts = await response.json()
		const accountsData = [ { attributes: { cnpj: '', account: 'Selecione um emitente' } }, ...accounts.data ]

		setAccountsData( accountsData )
	}, [] )

	const runFetch = useCallback( async () => {

		const resp = await fetch( `/api/bling/${ emitenteCnpj }/produtos?codigo=` ).then( r => r.json() )
		//console.log( resp )
		setVai( false )

	}, [] )

	useEffect( () => {
		fetchAccounts()
		if ( vai ) {
			runFetch()
		}
	}, [ vai ] )

	return (
		<div>
			<h1>Perfil</h1>
			{ accountsData &&
				<>
					<EmitenteSelect
						accountsData={ accountsData }
						emitenteCnpj={ emitenteCnpj }
						setEmitenteCnpjOnChange={ setEmitenteCnpj }
					/>
					<button onClick={ () => setVai( true ) }>Vai</button>
				</>
			}
		</div>
	)

}

export default Perfil

