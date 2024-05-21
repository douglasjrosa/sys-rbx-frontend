import axios from "axios"

/**
 * Logs empresa data.
 *
 * @param dados - The empresa data.
 * @param tipo - The tipo of the log.
 * @param solicitante - The solicitante of the log.
 *
 * @returns A promise that resolves to a string indicating the success of the operation.
 */

export const LogEmpresa = async (
	dados: any,
	tipo: string,
	solicitante: string
) => {
	try {
		const token = process.env.ATORIZZATION_TOKEN
		const STRAPI = axios.create( {
			baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )

		const atributes = !!dados.data.attributes ? dados.data.attributes : dados.data


		const DobyData = {
			data: {
				dados: { data: { ...atributes } },
				tipo: tipo,
				solicitante: solicitante,
				data: new Date().toISOString(),
				CNPJ: atributes.CNPJ,
			},
		}

		const response = await STRAPI.post( `/log-empresas`, DobyData )
		return "Empresa alterada com sucesso"
	} catch ( err: any ) {
		"registro erro de log alteração de empresas",
			err.response.data
		)
return err.response.data
	}
};

