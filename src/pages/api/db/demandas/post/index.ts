import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function PostDemanda(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = process.env.ATORIZZATION_TOKEN

	if (req.method !== "POST") {
		return res.status(405).send({ message: "Only POST requests are allowed" })
	}

	const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/demandas`

	try {
		const response = await axios.post(url, req.body, {
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
