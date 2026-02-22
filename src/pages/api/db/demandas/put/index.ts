import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function PutDemanda(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = process.env.ATORIZZATION_TOKEN

	if (req.method !== "PUT") {
		return res.status(405).send({ message: "Only PUT requests are allowed" })
	}

	const { id } = req.query

	if (!id) {
		return res.status(400).send({ message: "Missing demanda id" })
	}

	const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/demandas/${id}`

	try {
		const response = await axios.put(url, req.body, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		})
		res.status(200).json(response.data.data)
	} catch (error: any) {
		res.status(400).json(error?.response?.data?.error ?? error)
	}
}
