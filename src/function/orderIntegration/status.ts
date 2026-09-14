import type { OrderStatusType } from "@/function/setOrderFunctions"
import type { OrderIntegrationTarget } from "./types"

export const defaultOrderStatus = (): OrderStatusType => ({
	blingClientExists: false,
	blingProductsExist: false,
	blingOrderCreated: false,
	strapiBusinessUpdated: false,
	strapiLastOrderUpdated: false,
	strapiLoteUpdated: false,
	trelloCardsCreated: false,
	pixtrelaTasksCreated: false,
	strapiOrderUpdated: false,
})

export function parseOrderStatus(raw: unknown): OrderStatusType {
	if (!raw) return defaultOrderStatus()
	if (typeof raw === "string") {
		try {
			return { ...defaultOrderStatus(), ...JSON.parse(raw) }
		} catch {
			return defaultOrderStatus()
		}
	}
	if (typeof raw === "object") {
		return { ...defaultOrderStatus(), ...(raw as OrderStatusType) }
	}
	return defaultOrderStatus()
}

export function isBlingSent(status: OrderStatusType): boolean {
	return status.blingOrderCreated
}

export function isTrelloSent(status: OrderStatusType): boolean {
	return status.trelloCardsCreated
}

export function isPixtrelaSent(status: OrderStatusType): boolean {
	return status.pixtrelaTasksCreated
}

export function isStrapiSent(status: OrderStatusType): boolean {
	return (
		status.strapiBusinessUpdated &&
		status.strapiLastOrderUpdated &&
		status.strapiLoteUpdated &&
		status.strapiOrderUpdated
	)
}

export function integrationSent(
	target: OrderIntegrationTarget,
	status: OrderStatusType,
): boolean {
	switch (target) {
		case "bling":
			return isBlingSent(status)
		case "trello":
			return isTrelloSent(status)
		case "pixtrela":
			return isPixtrelaSent(status)
		case "strapi":
			return isStrapiSent(status)
		default:
			return false
	}
}

export function integrationSubtitle(sent: boolean): string {
	return sent ? "Pedido já enviado." : "Falha no envio."
}
