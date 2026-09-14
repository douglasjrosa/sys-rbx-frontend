import { formatPixtrelaItemToast } from "@/utils/formatPixtrelaItemToast"
import { parseCurrency } from "@/utils/customNumberFormats"
import { normalizeCnpj } from "@/utils/blingOAuth"
import {
	type BlingOrderDataType,
	type OrderStatusType,
	clientExists,
	fetchOrderData,
	getFormattedDate,
	handleInstallments,
	handleItems,
	ensureOrderLotes,
	resolveBlingClientIdAfterSave,
	resolveBusinessBudget,
	saveClient,
	sendBlingOrder,
	sendCardsToTrello,
	sendPixtrelaItem,
	updateBusinessInStrapi,
	updateLastOrderInStrapi,
	updateOrderInStrapi,
	resendStrapiOrderStatus,
} from "@/function/setOrderFunctions"
import { parseOrderStatus } from "./status"
import type {
	IntegrationResult,
	IntegrationToastHandlers,
	OrderContext,
	OrderIntegrationTarget,
} from "./types"

export {
	defaultOrderStatus,
	integrationSent,
	integrationSubtitle,
	isBlingSent,
	isPixtrelaSent,
	isStrapiSent,
	isTrelloSent,
	parseOrderStatus,
} from "./status"
export type {
	IntegrationResult,
	IntegrationToastHandlers,
	OrderContext,
	OrderIntegrationTarget,
	PixtrelaItemToastPayload,
} from "./types"
export {
	runBlingDelete,
	runIntegrationDelete,
	runPixtrelaDelete,
	runStrapiCascadeDelete,
	runTrelloDelete,
} from "./delete"

function parseItemCount(itens: unknown): number {
	if (!Array.isArray(itens)) return 0
	return itens.length
}

export async function buildOrderContext(input: {
	propostaId: string
	businessId: string
	orderValue: string
	vendedor: string
	vendedorId: string
	existingBlingOrderId?: string
}): Promise<OrderContext | null> {
	const order = await fetchOrderData(String(input.propostaId))
	const fullOrderData = order?.data
	if (!fullOrderData?.attributes) return null

	const attrs = fullOrderData.attributes
	return {
		propostaId: String(input.propostaId),
		orderId: Number(fullOrderData.id),
		businessId: String(input.businessId),
		orderValue: input.orderValue,
		vendedor: input.vendedor,
		vendedorId: input.vendedorId,
		fullOrderData,
		orderStatus: parseOrderStatus(attrs.orderStatus),
		blingAccountCnpj: normalizeCnpj(
			attrs.fornecedorId.data.attributes.CNPJ,
		),
		clientCNPJ: attrs.empresa.data.attributes.CNPJ,
		existingBlingOrderId:
			input.existingBlingOrderId ??
			(attrs.Bpedido ? String(attrs.Bpedido) : undefined),
		itemCount: parseItemCount(attrs.itens),
	}
}

async function persistOrderStatus(
	ctx: OrderContext,
	blingOrderId: string,
): Promise<boolean> {
	const update = await updateOrderInStrapi(
		blingOrderId,
		ctx.orderId,
		ctx.orderStatus,
	)
	return Boolean(update.data?.id)
}

export async function runBlingIntegration(
	ctx: OrderContext,
): Promise<IntegrationResult & { blingOrderId?: string }> {
	const { fullOrderData, blingAccountCnpj, propostaId } = ctx
	const attrs = fullOrderData.attributes
	const clientCNPJ = attrs.empresa.data.attributes.CNPJ

	const checkIfClientExists = await clientExists(blingAccountCnpj, clientCNPJ)
	const blingClientId = checkIfClientExists?.id
	const saved = await saveClient(fullOrderData, blingClientId)

	if (typeof saved === "object" && saved !== null && "error" in saved && saved.error) {
		ctx.orderStatus.blingClientExists = false
		return {
			target: "bling",
			ok: false,
			message: "BLING: Problemas com o cadastro do cliente.",
			description: "Não foi possível cadastrar o cliente no Bling.",
		}
	}

	const clientId = resolveBlingClientIdAfterSave(saved, blingClientId)
	if (!clientId) {
		ctx.orderStatus.blingClientExists = false
		return {
			target: "bling",
			ok: false,
			message: "BLING: Cliente sem identificador",
			description:
				"O cliente foi processado, mas o Bling não retornou um ID válido.",
		}
	}
	ctx.orderStatus.blingClientExists = true

	const { itens } = attrs
	if (!Array.isArray(itens) || itens.length === 0) {
		ctx.orderStatus.blingProductsExist = false
		return {
			target: "bling",
			ok: false,
			message: "BLING: Proposta sem itens",
			description: "Não há produtos na proposta para enviar ao Bling.",
		}
	}

	let blingItems
	try {
		blingItems = await handleItems(blingAccountCnpj, itens)
	} catch (productError) {
		ctx.orderStatus.blingProductsExist = false
		const detail =
			productError instanceof Error
				? productError.message
				: "Erro ao cadastrar produtos no Bling."
		return {
			target: "bling",
			ok: false,
			message: "BLING: Falha no cadastro de produtos",
			description: detail,
		}
	}

	const missingProductId = blingItems.some(
		(row) => !row?.produto?.id || Number(row.produto.id) <= 0,
	)
	if (blingItems.length !== itens.length || missingProductId) {
		ctx.orderStatus.blingProductsExist = false
		return {
			target: "bling",
			ok: false,
			message: "BLING: Produtos incompletos",
			description:
				"Parece que nem todos os produtos foram cadastrados no Bling.",
		}
	}
	ctx.orderStatus.blingProductsExist = true

	const { dataEntrega, prazo, totalGeral, cliente_pedido, obs } = attrs
	const totalOrderValue = parseCurrency(totalGeral)
	const today = getFormattedDate()
	const installments = await handleInstallments(
		blingAccountCnpj,
		dataEntrega,
		prazo,
		totalOrderValue,
	)

	const orderNumber = cliente_pedido ?? ""
	const obsText = obs ?? ""
	let observacoes = orderNumber ? `Pedido: ${orderNumber}` : ""
	observacoes += orderNumber && obsText ? " | " : ""
	observacoes += obsText ? obsText : ""

	const blingOrderData: BlingOrderDataType = {
		numero: +propostaId,
		data: today,
		dataSaida: dataEntrega,
		dataPrevista: dataEntrega,
		contato: { id: clientId },
		itens: blingItems,
		parcelas: installments,
		numeroPedidoCompra: orderNumber,
		outrasDespesas: parseCurrency(attrs.custoAdicional),
		desconto: { valor: parseCurrency(attrs.descontoTotal) },
		transporte: {
			fretePorConta: attrs.frete === "CIF" ? 0 : 1,
			frete: parseCurrency(attrs.valorFrete),
		},
		observacoes,
	}

	const blingOrder = await sendBlingOrder(blingAccountCnpj, blingOrderData)
	if (!blingOrder.data?.id && blingOrder.error) {
		ctx.orderStatus.blingOrderCreated = false
		const fields: string[] = []
		if (blingOrder.error?.fields?.length) {
			blingOrder.error.fields.forEach((field: { msg?: string; collection?: Array<{ msg?: string }> }) => {
				if (field.msg) fields.push(field.msg)
				field.collection?.forEach((col) => {
					if (col.msg) fields.push(col.msg)
				})
			})
		}
		return {
			target: "bling",
			ok: false,
			message: `BLING: ${blingOrder.message ?? "Falha ao enviar pedido"}`,
			description: fields.join(" ") || "Erro ao enviar pedido para o Bling.",
		}
	}

	ctx.orderStatus.blingOrderCreated = true
	return {
		target: "bling",
		ok: true,
		message: "BLING: Pedido enviado com sucesso.",
		blingOrderId: String(blingOrder.data.id),
	}
}

export async function runTrelloIntegration(
	ctx: OrderContext,
): Promise<IntegrationResult> {
	try {
		const sendToTrello = await sendCardsToTrello(ctx.propostaId)
		if (!sendToTrello.length) {
			ctx.orderStatus.trelloCardsCreated = false
			return {
				target: "trello",
				ok: false,
				message: "TRELLO: Falha no envio",
				description: "Erro ao enviar os cards para o Trello.",
			}
		}
		ctx.orderStatus.trelloCardsCreated = true
		return {
			target: "trello",
			ok: true,
			message: "TRELLO: Cards enviados com sucesso.",
		}
	} catch (error) {
		ctx.orderStatus.trelloCardsCreated = false
		return {
			target: "trello",
			ok: false,
			message: "TRELLO: Falha no envio",
			description:
				error instanceof Error ? error.message : "Erro ao enviar ao Trello.",
		}
	}
}

export async function runPixtrelaIntegration(
	ctx: OrderContext,
	onItemComplete?: IntegrationToastHandlers["onPixtrelaItem"],
): Promise<IntegrationResult> {
	if (ctx.itemCount <= 0) {
		ctx.orderStatus.pixtrelaTasksCreated = false
		return {
			target: "pixtrela",
			ok: false,
			message: "PIXTRELA: Proposta sem itens",
			description: "Não há itens para enviar ao Pixtrela.",
		}
	}

	const itemIndexes = Array.from({ length: ctx.itemCount }, (_, i) => i)
	let usedRbxFallback = false
	let successCount = 0
	const errors: string[] = []

	await Promise.all(
		itemIndexes.map(async (itemIndex) => {
			try {
				const result = await sendPixtrelaItem(ctx.propostaId, itemIndex)
				if (result.usedRbxFallback) usedRbxFallback = true
				if (result.ok) {
					successCount += 1
				} else {
					errors.push(
						result.message ?? `Item ${itemIndex + 1} falhou no Pixtrela.`,
					)
				}
				const prodId = result.prodId ?? 0
				const action = result.results?.[0]?.action
				const toastCopy = formatPixtrelaItemToast({
					itemIndex,
					prodId,
					action,
					ok: Boolean(result.ok),
				})
				onItemComplete?.({
					itemIndex,
					prodId,
					ok: Boolean(result.ok),
					action,
					title: toastCopy.title,
					description: toastCopy.description,
				})
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Erro no Pixtrela."
				errors.push(`Item ${itemIndex + 1}: ${message}`)
				const toastCopy = formatPixtrelaItemToast({
					itemIndex,
					ok: false,
					errorMessage: message,
				})
				onItemComplete?.({
					itemIndex,
					prodId: 0,
					ok: false,
					title: toastCopy.title,
					description: toastCopy.description,
				})
			}
		}),
	)

	const ok = successCount === ctx.itemCount
	ctx.orderStatus.pixtrelaTasksCreated = ok
	return {
		target: "pixtrela",
		ok,
		message: ok
			? "PIXTRELA: Tarefas enviadas com sucesso."
			: "PIXTRELA: Falha no envio",
		description: ok
			? usedRbxFallback
				? "Alguns itens usaram fallback RBX."
				: undefined
			: errors.join(" | "),
	}
}

export async function runStrapiResendIntegration(
	ctx: OrderContext,
	blingOrderId: string,
): Promise<IntegrationResult> {
	const dataEntrega = ctx.fullOrderData.attributes?.dataEntrega ?? ""

	try {
		ctx.orderStatus.strapiOrderUpdated = true
		const update = await resendStrapiOrderStatus(
			ctx.orderId,
			blingOrderId,
			dataEntrega,
			ctx.orderStatus,
		)
		if (!update.data?.id) {
			ctx.orderStatus.strapiOrderUpdated = false
			return {
				target: "strapi",
				ok: false,
				message: "STRAPI: Falha ao atualizar status",
				description: "Não foi possível salvar data e status do pedido.",
			}
		}
		return {
			target: "strapi",
			ok: true,
			message: "STRAPI: Data e status atualizados com sucesso.",
		}
	} catch (error) {
		ctx.orderStatus.strapiOrderUpdated = false
		return {
			target: "strapi",
			ok: false,
			message: "STRAPI: Falha ao atualizar status",
			description:
				error instanceof Error ? error.message : "Erro ao atualizar Strapi.",
		}
	}
}

export async function runStrapiIntegration(
	ctx: OrderContext,
	blingOrderId: string,
): Promise<IntegrationResult> {
	const { fullOrderData, propostaId, clientCNPJ, orderValue, vendedor, vendedorId } =
		ctx

	try {
		const resolvedBudget = await resolveBusinessBudget(
			propostaId,
			fullOrderData.attributes.totalGeral ?? orderValue,
		)
		const updateNegocio = await updateBusinessInStrapi(
			ctx.businessId,
			blingOrderId,
			resolvedBudget,
		)
		if (!updateNegocio.data?.id) {
			ctx.orderStatus.strapiBusinessUpdated = false
			return {
				target: "strapi",
				ok: false,
				message: "STRAPI: Falha ao atualizar negócio",
				description: "Houve um erro ao atualizar o negócio.",
			}
		}
		ctx.orderStatus.strapiBusinessUpdated = true

		const updateLastOrder = await updateLastOrderInStrapi(
			clientCNPJ,
			orderValue,
			vendedor,
			vendedorId,
		)
		if (!updateLastOrder.data?.id) {
			ctx.orderStatus.strapiLastOrderUpdated = false
			return {
				target: "strapi",
				ok: false,
				message: "STRAPI: Falha na última compra",
				description:
					"Não foi possível atualizar o valor da última compra da empresa.",
			}
		}
		ctx.orderStatus.strapiLastOrderUpdated = true

		const loteEnsure = await ensureOrderLotes(propostaId)
		if (!loteEnsure.ready || !loteEnsure.lotes?.length) {
			ctx.orderStatus.strapiLoteUpdated = false
			return {
				target: "strapi",
				ok: false,
				message: "STRAPI: Falha no lote",
				description:
					"Não foi possível atualizar o lote referente a esta compra.",
			}
		}
		ctx.orderStatus.strapiLoteUpdated = true
		ctx.orderStatus.strapiOrderUpdated = true

		const persisted = await persistOrderStatus(ctx, blingOrderId)
		if (!persisted) {
			ctx.orderStatus.strapiOrderUpdated = false
			return {
				target: "strapi",
				ok: false,
				message: "STRAPI: Falha ao salvar pedido",
				description: "Houve um erro ao atualizar o pedido.",
			}
		}

		return {
			target: "strapi",
			ok: true,
			message: "STRAPI: Dados salvos com sucesso.",
		}
	} catch (error) {
		return {
			target: "strapi",
			ok: false,
			message: "STRAPI: Falha no envio",
			description:
				error instanceof Error ? error.message : "Erro ao atualizar Strapi.",
		}
	}
}

function resolveBlingOrderId(
	ctx: OrderContext,
	blingResult?: IntegrationResult & { blingOrderId?: string },
): string | null {
	if (blingResult?.blingOrderId) return blingResult.blingOrderId
	if (ctx.existingBlingOrderId) return ctx.existingBlingOrderId
	const fromOrder = ctx.fullOrderData.attributes?.Bpedido
	if (fromOrder) return String(fromOrder)
	return null
}

export async function runIntegrationsParallel(
	ctx: OrderContext,
	targets: OrderIntegrationTarget[],
	handlers: IntegrationToastHandlers = {},
	options: { strapiResendOnly?: boolean } = {},
): Promise<{
	ok: boolean
	blingOrderId?: string
	results: IntegrationResult[]
}> {
	handlers.onStart?.()

	const wantsBling = targets.includes("bling")
	const wantsTrello = targets.includes("trello")
	const wantsPixtrela = targets.includes("pixtrela")
	const wantsStrapi = targets.includes("strapi")

	let trelloPreFailure: IntegrationResult | null = null

	if (wantsTrello || wantsStrapi) {
		try {
			const loteEnsure = await ensureOrderLotes(ctx.propostaId)
			if (loteEnsure.ready && loteEnsure.lotes?.length) {
				ctx.orderStatus.strapiLoteUpdated = true
			}
		} catch (error) {
			if (wantsTrello) {
				const message =
					error instanceof Error ? error.message : "Erro ao gerar lotes."
				trelloPreFailure = {
					target: "trello",
					ok: false,
					message: "TRELLO: Lotes indisponíveis",
					description: message,
				}
				ctx.orderStatus.trelloCardsCreated = false
			}
		}
	}

	const blingPromise = wantsBling
		? runBlingIntegration(ctx)
		: Promise.resolve(null)
	const trelloPromise = wantsTrello
		? trelloPreFailure
			? Promise.resolve(trelloPreFailure)
			: runTrelloIntegration(ctx)
		: Promise.resolve(null)
	const pixtrelaPromise = wantsPixtrela
		? runPixtrelaIntegration(ctx, handlers.onPixtrelaItem)
		: Promise.resolve(null)

	const [blingResult, trelloResult, pixtrelaResult] = await Promise.all([
		blingPromise,
		trelloPromise,
		pixtrelaPromise,
	])

	const results: IntegrationResult[] = []
	if (blingResult) {
		handlers.onBling?.(blingResult)
		results.push(blingResult)
	}
	if (trelloResult) {
		handlers.onTrello?.(trelloResult)
		results.push(trelloResult)
	}
	if (pixtrelaResult) {
		results.push(pixtrelaResult)
	}

	const blingOrderId = resolveBlingOrderId(ctx, blingResult ?? undefined)

	if (wantsStrapi) {
		if (!blingOrderId) {
			const strapiFail: IntegrationResult = {
				target: "strapi",
				ok: false,
				message: "STRAPI: Pedido Bling ausente",
				description:
					"Envie o pedido ao Bling antes de sincronizar com o Strapi.",
			}
			handlers.onStrapi?.(strapiFail)
			results.push(strapiFail)
		} else {
			const strapiResult = options.strapiResendOnly
				? await runStrapiResendIntegration(ctx, blingOrderId)
				: await runStrapiIntegration(ctx, blingOrderId)
			handlers.onStrapi?.(strapiResult)
			results.push(strapiResult)
		}
	} else if (blingOrderId) {
		await persistOrderStatus(ctx, blingOrderId)
	}

	const ok = results.every((row) => row.ok)
	return { ok, blingOrderId: blingOrderId ?? undefined, results }
}
