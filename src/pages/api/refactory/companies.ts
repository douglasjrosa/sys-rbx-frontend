import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import qs from 'qs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { calculateExpiresInFromFrequency } from '../lib/update-empresa-purchase'

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === 'GET' ) {
		try {
			const { searchString } = req.query

			// Verificar autenticação
			const session = await getServerSession( req, res, authOptions )

			if ( !session ) {
				return res.status( 401 ).json( { error: 'Unauthorized' } )
			}

			// Construir a query string para o Strapi
			const query = qs.stringify( {
				filters: {
					nome: {
						$containsi: searchString,
					},
					user: {
						id: {
							$eq: session?.user?.id,
						},
					},
				},
			}, {
				encodeValuesOnly: true,
			} )

			const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
			const authToken = process.env.ATORIZZATION_TOKEN

			if ( !strapiUrl ) {
				return res.status( 500 ).json( { error: 'Strapi API URL not defined' } )
			}

			if ( !authToken ) {
				return res.status( 500 ).json( { error: 'Authorization token not defined' } )
			}

			// Fazer a requisição para o Strapi
			const response = await axios.get( `${ strapiUrl }/empresas?${ query }`, {
				headers: {
					Authorization: `Bearer ${ authToken }`,
				},
			} )

			return res.status( 200 ).json( response.data )
		} catch ( error ) {
			console.error( 'Error fetching companies:', error )
			return res.status( 500 ).json( { error: 'Failed to fetch companies' } )
		}
	} else if ( req.method === 'PUT' ) {
		try {
			const { id, ...dataToUpdate } = req.body

			const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
			const authToken = process.env.ATORIZZATION_TOKEN

			if ( !strapiUrl || !authToken ) {
				return res.status( 500 ).json( { error: 'Missing API URL or authorization token' } )
			}

			// Check if vendedor was assigned (user or vendedor was updated with a valid value)
			const vendedorAssigned = (
				( dataToUpdate.user !== undefined && dataToUpdate.user !== null ) ||
				( dataToUpdate.vendedor !== undefined && dataToUpdate.vendedor !== null && dataToUpdate.vendedor !== "" ) ||
				( dataToUpdate.vendedorId !== undefined && dataToUpdate.vendedorId !== null && dataToUpdate.vendedorId !== "" )
			)

			if ( vendedorAssigned ) {
				try {
					// Fetch current empresa data to get purchaseFrequency
					const empresaResponse = await axios.get(
						`${ strapiUrl }/empresas/${ id }?fields[0]=purchaseFrequency`,
						{
							headers: {
								Authorization: `Bearer ${ authToken }`,
								"Content-Type": "application/json",
							},
						}
					)

					const purchaseFrequency = empresaResponse.data?.data?.attributes?.purchaseFrequency || null

					// Calculate expiresIn based on purchaseFrequency from current date
					if ( purchaseFrequency ) {
						const expiresIn = calculateExpiresInFromFrequency( purchaseFrequency )
						if ( expiresIn ) {
							dataToUpdate.expiresIn = expiresIn
						}
					} else {
						// If no purchaseFrequency, set to Raramente with 12 months
						dataToUpdate.purchaseFrequency = "Raramente"
						const expiresIn = calculateExpiresInFromFrequency( "Raramente" )
						if ( expiresIn ) {
							dataToUpdate.expiresIn = expiresIn
						}
					}
				} catch ( error: any ) {
					console.error( `Error fetching empresa data to calculate expiresIn:`, error.response?.data || error.message )
					// Don't fail the request if this fails
				}
			}

			console.log( 'Sending data to Strapi:', { data: dataToUpdate } )

			const response = await axios.put(
				`${ strapiUrl }/empresas/${ id }`,
				{ data: dataToUpdate },
				{
					headers: {
						Authorization: `Bearer ${ authToken }`,
					},
				}
			)

			return res.status( 200 ).json( response.data )
		} catch ( error: any ) {
			console.error( 'Error saving company:', error.response?.data || error.message || error )
			return res.status( 500 ).json( {
				error: 'Failed to save company',
				details: error.response?.data || error.message
			} )
		}
	}
	else {
		res.setHeader( 'Allow', [ 'GET' ] )
		return res.status( 405 ).json( { error: `Method ${ req.method } Not Allowed` } )
	}
}
