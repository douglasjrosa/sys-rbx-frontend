import type { NextApiRequest, NextApiResponse } from "next"
import { timingSafeEqual } from "crypto"

function readHeader(req: NextApiRequest, name: string): string {
	const value = req.headers[name.toLowerCase()]
	if (Array.isArray(value)) return value[0] ?? ""
	return value ?? ""
}

function timingSafeTokenEqual(left: string, right: string): boolean {
	const a = Buffer.from(left)
	const b = Buffer.from(right)
	if (a.length !== b.length) return false
	return timingSafeEqual(a, b)
}

/**
 * Pixtrela CRM "Testar integração" handshake.
 * Header `Token` must equal PIXTRELA_API_SECRET.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.setHeader("Cache-Control", "no-store")

	if (req.method !== "GET") {
		res.setHeader("Allow", "GET")
		return res.status(405).json({ ok: false, error: "method_not_allowed" })
	}

	const secret = (process.env.PIXTRELA_API_SECRET || "").trim()
	if (!secret) {
		return res.status(503).json({
			ok: false,
			error: "handshake_not_configured",
		})
	}

	const tokenHeader = readHeader(req, "token")
	const tokenQuery =
		typeof req.query.Token === "string" ? req.query.Token : ""
	const token = tokenHeader || tokenQuery

	if (token && timingSafeTokenEqual(token, secret)) {
		return res.status(200).json({ ok: true })
	}

	return res.status(401).json({ ok: false, error: "unauthorized" })
}
