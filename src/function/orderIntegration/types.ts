import type { OrderStatusType, SendTasksToPixtrelaResult } from "@/function/setOrderFunctions"

export type OrderIntegrationTarget = "bling" | "trello" | "pixtrela" | "strapi"

export type OrderContext = {
	propostaId: string
	orderId: number
	businessId: string
	orderValue: string
	vendedor: string
	vendedorId: string
	fullOrderData: any
	orderStatus: OrderStatusType
	blingAccountCnpj: string
	clientCNPJ: string
	existingBlingOrderId?: string
	itemCount: number
}

export type IntegrationResult = {
	target: OrderIntegrationTarget
	ok: boolean
	message: string
	description?: string
}

export type PixtrelaItemToastPayload = {
	itemIndex: number
	prodId: number
	ok: boolean
	summary: string
	result?: SendTasksToPixtrelaResult
}

export type IntegrationToastHandlers = {
	onStart?: () => void
	onBling?: (result: IntegrationResult) => void
	onTrello?: (result: IntegrationResult) => void
	onPixtrelaItem?: (payload: PixtrelaItemToastPayload) => void
	onStrapi?: (result: IntegrationResult) => void
}
