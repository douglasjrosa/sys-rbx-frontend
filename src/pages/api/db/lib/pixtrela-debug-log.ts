type PixtrelaDebugPayload = {
	sessionId: string
	location: string
	message: string
	data: Record<string, unknown>
	hypothesisId: string
	timestamp: number
}

const DEBUG_SESSION_ID = "cb9202"
const DEBUG_INGEST_URL =
	"http://127.0.0.1:7745/ingest/92e76b51-8514-4eb9-93ff-1a9f2e2f0e64"

/** Structured debug log for Pixtrela sync (Vercel + optional local ingest). */
export function pixtrelaDebugLog(
	location: string,
	message: string,
	data: Record<string, unknown>,
	hypothesisId: string,
): void {
	const payload: PixtrelaDebugPayload = {
		sessionId: DEBUG_SESSION_ID,
		location,
		message,
		data,
		hypothesisId,
		timestamp: Date.now(),
	}
	// #region agent log
	console.info("[pixtrela-debug]", JSON.stringify(payload))
	fetch(DEBUG_INGEST_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Debug-Session-Id": DEBUG_SESSION_ID,
		},
		body: JSON.stringify(payload),
	}).catch(() => undefined)
	// #endregion
}
