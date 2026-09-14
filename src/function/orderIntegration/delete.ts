import { defaultOrderStatus } from "./status"
import type { IntegrationResult, OrderContext, OrderIntegrationTarget } from "./types"
import {
	deleteBlingOrderForContext,
	deletePixtrelaTasks,
	deleteTrelloCardsForBusiness,
	resetStrapiOrderIntegration,
} from "@/function/setOrderFunctions"

function applyDeleteStatus(
	ctx: OrderContext,
	target: OrderIntegrationTarget,
): void {
	switch (target) {
		case "bling":
			ctx.orderStatus.blingClientExists = false
			ctx.orderStatus.blingProductsExist = false
			ctx.orderStatus.blingOrderCreated = false
			break
		case "trello":
			ctx.orderStatus.trelloCardsCreated = false
			break
		case "pixtrela":
			ctx.orderStatus.pixtrelaTasksCreated = false
			break
		case "strapi":
			ctx.orderStatus = defaultOrderStatus()
			break
		default:
			break
	}
}

async function persistStatusAfterDelete(
	ctx: OrderContext,
	options: { clearBpedido?: boolean; blingOrderId?: string } = {},
): Promise<void> {
	await resetStrapiOrderIntegration({
		orderId: ctx.orderId,
		businessId: ctx.businessId,
		orderStatus: ctx.orderStatus,
		blingOrderId: options.clearBpedido
			? undefined
			: options.blingOrderId ?? ctx.existingBlingOrderId,
		clearBpedido: options.clearBpedido,
	})
}

export async function runBlingDelete(
	ctx: OrderContext,
): Promise<IntegrationResult> {
	try {
		const result = await deleteBlingOrderForContext({
			blingAccountCnpj: ctx.blingAccountCnpj,
			propostaId: ctx.propostaId,
			existingBlingOrderId: ctx.existingBlingOrderId,
		})
		if (!result.ok) {
			return {
				target: "bling",
				ok: false,
				message: "BLING: Falha ao excluir pedido",
				description: result.error,
			}
		}
		applyDeleteStatus(ctx, "bling")
		ctx.existingBlingOrderId = undefined
		await persistStatusAfterDelete(ctx, { clearBpedido: true })
		return {
			target: "bling",
			ok: true,
			message: "BLING: Pedido excluído com sucesso.",
		}
	} catch (error) {
		return {
			target: "bling",
			ok: false,
			message: "BLING: Falha ao excluir pedido",
			description:
				error instanceof Error ? error.message : "Erro ao excluir no Bling.",
		}
	}
}

export async function runTrelloDelete(
	ctx: OrderContext,
): Promise<IntegrationResult> {
	try {
		const result = await deleteTrelloCardsForBusiness(ctx.businessId)
		if (!result.ok) {
			return {
				target: "trello",
				ok: false,
				message: "TRELLO: Falha ao excluir cards",
				description: result.error,
			}
		}
		applyDeleteStatus(ctx, "trello")
		await persistStatusAfterDelete(ctx)
		return {
			target: "trello",
			ok: true,
			message: "TRELLO: Cards arquivados com sucesso.",
		}
	} catch (error) {
		return {
			target: "trello",
			ok: false,
			message: "TRELLO: Falha ao excluir cards",
			description:
				error instanceof Error ? error.message : "Erro ao excluir no Trello.",
		}
	}
}

export async function runPixtrelaDelete(
	ctx: OrderContext,
): Promise<IntegrationResult> {
	try {
		const result = await deletePixtrelaTasks(ctx.propostaId)
		if (!result.ok) {
			return {
				target: "pixtrela",
				ok: false,
				message: "PIXTRELA: Falha ao excluir tarefas",
				description: result.error,
			}
		}
		applyDeleteStatus(ctx, "pixtrela")
		await persistStatusAfterDelete(ctx)
		return {
			target: "pixtrela",
			ok: true,
			message: "PIXTRELA: Tarefas excluídas com sucesso.",
		}
	} catch (error) {
		return {
			target: "pixtrela",
			ok: false,
			message: "PIXTRELA: Falha ao excluir tarefas",
			description:
				error instanceof Error ? error.message : "Erro ao excluir no Pixtrela.",
		}
	}
}

export async function runStrapiCascadeDelete(
	ctx: OrderContext,
): Promise<IntegrationResult> {
	const bling = await runBlingDelete(ctx)
	if (!bling.ok) return bling

	const trello = await runTrelloDelete(ctx)
	if (!trello.ok) return trello

	const pixtrela = await runPixtrelaDelete(ctx)
	if (!pixtrela.ok) return pixtrela

	try {
		applyDeleteStatus(ctx, "strapi")
		await resetStrapiOrderIntegration({
			orderId: ctx.orderId,
			businessId: ctx.businessId,
			orderStatus: ctx.orderStatus,
			clearBpedido: true,
		})
		return {
			target: "strapi",
			ok: true,
			message: "STRAPI: Integração removida com sucesso.",
		}
	} catch (error) {
		return {
			target: "strapi",
			ok: false,
			message: "STRAPI: Falha ao remover integração",
			description:
				error instanceof Error ? error.message : "Erro ao atualizar Strapi.",
		}
	}
}

export async function runIntegrationDelete(
	ctx: OrderContext,
	target: OrderIntegrationTarget,
): Promise<IntegrationResult> {
	if (target === "strapi") {
		return runStrapiCascadeDelete(ctx)
	}
	if (target === "bling") return runBlingDelete(ctx)
	if (target === "trello") return runTrelloDelete(ctx)
	return runPixtrelaDelete(ctx)
}
