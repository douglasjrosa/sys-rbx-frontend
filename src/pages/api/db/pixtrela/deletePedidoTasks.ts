import axios from "axios"

export async function deletePixtrelaTasksForPedido(
	pedidoId: string,
): Promise<{ ok: boolean; deletedCount: number; error?: string }> {
	const pixtrelaApiUrl = (process.env.PIXTRELA_API_URL || "").replace(/\/+$/, "")
	const pixtrelaApiSecret = (process.env.PIXTRELA_API_SECRET || "").trim()
	if (!pixtrelaApiUrl || !pixtrelaApiSecret) {
		return {
			ok: false,
			deletedCount: 0,
			error: "Pixtrela API is not configured.",
		}
	}

	const numericId = Number(pedidoId)
	if (!Number.isInteger(numericId) || numericId <= 0) {
		return { ok: false, deletedCount: 0, error: "Invalid pedido id." }
	}

	try {
		const response = await axios({
			method: "DELETE",
			url: `${pixtrelaApiUrl}/api/tasks?crmPedidoId=${numericId}`,
			headers: {
				Token: pixtrelaApiSecret,
				Accept: "application/json",
			},
			validateStatus: () => true,
		})

		if (response.status < 200 || response.status >= 300) {
			const message =
				response.data?.error ||
				response.data?.message ||
				`HTTP ${response.status}`
			return { ok: false, deletedCount: 0, error: String(message) }
		}

		return {
			ok: true,
			deletedCount: Number(response.data?.deletedCount ?? 0),
		}
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to delete Pixtrela tasks."
		return { ok: false, deletedCount: 0, error: message }
	}
}
