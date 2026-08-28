import type { NextApiRequest, NextApiResponse } from "next"
import { createHmac, timingSafeEqual } from "crypto"

const SIGNATURE_PREFIX = "sha256="
const SIGNATURE_HEADER = "x-pixtrela-signature"

export const config = {
	api: {
		bodyParser: false,
	},
}

function readHeader(req: NextApiRequest, name: string): string {
	const value = req.headers[name.toLowerCase()]
	if (Array.isArray(value)) return value[0] ?? ""
	return value ?? ""
}

function readRawBody(req: NextApiRequest): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = []
		req.on("data", (chunk: Buffer) => {
			chunks.push(chunk)
		})
		req.on("end", () => {
			resolve(Buffer.concat(chunks).toString("utf8"))
		})
		req.on("error", reject)
	})
}

function signBody(body: string, secret: string): string {
	const digest = createHmac("sha256", secret).update(body).digest("hex")
	return `${SIGNATURE_PREFIX}${digest}`
}

function verifySignature(
	body: string,
	signatureHeader: string,
	secret: string,
): boolean {
	if (!signatureHeader.startsWith(SIGNATURE_PREFIX)) return false
	const expected = signBody(body, secret)
	const expectedBuf = Buffer.from(expected)
	const receivedBuf = Buffer.from(signatureHeader)
	if (expectedBuf.length !== receivedBuf.length) return false
	return timingSafeEqual(expectedBuf, receivedBuf)
}

function timingSafeTokenEqual(left: string, right: string): boolean {
	const a = Buffer.from(left)
	const b = Buffer.from(right)
	if (a.length !== b.length) return false
	return timingSafeEqual(a, b)
}

/**
 * Pixtrela CRM "Testar integração" handshake.
 *
 * Auth (either):
 * - Header `Token` equals PIXTRELA_WEBHOOK_SECRET
 * - POST with HMAC header `x-pixtrela-signature` over the raw body
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	res.setHeader("Cache-Control", "no-store")

	if (req.method !== "GET" && req.method !== "POST") {
		res.setHeader("Allow", "GET, POST")
		return res.status(405).json({ ok: false, error: "method_not_allowed" })
	}

	const secret = (process.env.PIXTRELA_WEBHOOK_SECRET || "").trim()
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

	if (req.method === "POST") {
		const rawBody = await readRawBody(req)
		const signature = readHeader(req, SIGNATURE_HEADER)
		if (rawBody && verifySignature(rawBody, signature, secret)) {
			return res.status(200).json({ ok: true })
		}
	}

	return res.status(401).json({ ok: false, error: "unauthorized" })
}
