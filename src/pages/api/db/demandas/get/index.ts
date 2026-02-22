import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetDemandas(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = process.env.ATORIZZATION_TOKEN

	if (req.method !== "GET") {
		return res.status(405).send({ message: "Only GET requests are allowed" })
	}

	const { vendedor, all } = req.query
	const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/demandas`
		+ `?populate=*&sort[0]=createdAt%3Adesc&pagination[pageSize]=1000`

	try {
		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		})
		let data = response.data.data ?? []

		if (all !== "true" && vendedor) {
			const v = String(vendedor)
			data = data.filter((d: any) => {
				const owner =
					d.attributes?.user?.data?.attributes?.username
				if (owner === v) return true
				const viewers: string[] = d.attributes?.viewers ?? []
				return Array.isArray(viewers) && viewers.includes(v)
			})
		}

		res.status(200).json(data)
	} catch (error: any) {
		res.status(400).json(error?.response?.data ?? error)
	}
}
