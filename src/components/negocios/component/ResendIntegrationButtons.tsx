import {
	buildOrderContext,
	integrationSent,
	integrationSubtitle,
	parseOrderStatus,
	runIntegrationDelete,
	runIntegrationsParallel,
	type OrderIntegrationTarget,
} from "@/function/orderIntegration"
import { buildBusinessStrapiStatusUpdate } from "@/function/orderIntegration/businessStrapiStatus"
import { OrderIntegrationToastManager } from "@/utils/orderIntegrationToasts"
import axios from "axios"
import { useCallback, useMemo, useState } from "react"
import { Box, Button, Flex, Text, VStack, useToast } from "@chakra-ui/react"

type ResendIntegrationButtonsProps = {
	propostaId: string
	businessId: string
	orderValue: string
	vendedor: string
	vendedorId: string
	blingOrderId?: string
	orderStatusRaw?: unknown
	itemCount: number
	etapa: number
	andamento: number
	onRefresh?: () => void
}

const TARGETS: Array<{
	key: OrderIntegrationTarget
	resendLabel: string
	deleteLabel: string
}> = [
	{ key: "bling", resendLabel: "Reenviar", deleteLabel: "Excluir do Bling" },
	{ key: "trello", resendLabel: "Reenviar", deleteLabel: "Excluir do Trello" },
	{
		key: "pixtrela",
		resendLabel: "Reenviar",
		deleteLabel: "Excluir do Pixtrela",
	},
	{
		key: "strapi",
		resendLabel: "Atualizar no Strapi",
		deleteLabel: "Excluir do Strapi",
	},
]

const TARGET_LABELS: Record<OrderIntegrationTarget, string> = {
	bling: "Bling",
	trello: "Trello",
	pixtrela: "Pixtrela",
	strapi: "Strapi",
}

export default function ResendIntegrationButtons(
	props: ResendIntegrationButtonsProps,
) {
	const toast = useToast()
	const toastManager = useMemo(
		() => new OrderIntegrationToastManager(toast),
		[toast],
	)
	const [loadingResend, setLoadingResend] =
		useState<OrderIntegrationTarget | null>(null)
	const [loadingDelete, setLoadingDelete] =
		useState<OrderIntegrationTarget | null>(null)

	const orderStatus = useMemo(
		() => parseOrderStatus(props.orderStatusRaw),
		[props.orderStatusRaw],
	)

	const isBusy = loadingResend !== null || loadingDelete !== null

	const runStrapiStatusUpdate = useCallback(async () => {
		if (!props.businessId) return
		setLoadingResend("strapi")
		try {
			toastManager.startPending()
			await axios.put(`/api/db/business/put/id/${props.businessId}`, {
				data: buildBusinessStrapiStatusUpdate({
					etapa: props.etapa,
					andamento: props.andamento,
				}),
			})
			toastManager.showFinalSuccess(
				"Tudo certo!",
				"Etapa e status atualizados no Strapi.",
			)
			props.onRefresh?.()
		} catch (error) {
			toastManager.closePending()
			const description =
				error instanceof Error ? error.message : "Erro inesperado."
			toastManager.showFinalError("Falha no envio", description)
		} finally {
			setLoadingResend(null)
		}
	}, [props, toastManager])

	const runTarget = useCallback(
		async (target: OrderIntegrationTarget) => {
			if (target === "strapi") {
				await runStrapiStatusUpdate()
				return
			}
			if (!props.propostaId) return
			setLoadingResend(target)
			try {
				const ctx = await buildOrderContext({
					propostaId: props.propostaId,
					businessId: props.businessId,
					orderValue: props.orderValue,
					vendedor: props.vendedor,
					vendedorId: props.vendedorId,
					existingBlingOrderId: props.blingOrderId,
				})
				if (!ctx) {
					toastManager.showFinalError(
						"Erro",
						"Não foi possível carregar os dados do pedido.",
					)
					return
				}

				toastManager.startPending()

				const { ok } = await runIntegrationsParallel(
					ctx,
					[target],
					{
						onBling: (result) => {
							toastManager.showResult(
								result.message,
								result.description,
								!result.ok,
							)
						},
						onTrello: (result) => {
							toastManager.showResult(
								result.message,
								result.description,
								!result.ok,
							)
						},
						onPixtrelaItem: (item) => {
							toastManager.showResult(
								item.title,
								item.description,
								!item.ok,
							)
						},
						onStrapi: (result) => {
							toastManager.showResult(
								result.message,
								result.description,
								!result.ok,
							)
						},
					},
					{ strapiResendOnly: target === "strapi" },
				)

				if (ok) {
					toastManager.showFinalSuccess(
						"Tudo certo!",
						`Pedido reenviado para o ${TARGET_LABELS[target]} com sucesso.`,
					)
				} else {
					toastManager.closePending()
				}

				props.onRefresh?.()
			} catch (error) {
				toastManager.closePending()
				const description =
					error instanceof Error ? error.message : "Erro inesperado."
				toastManager.showFinalError("Falha no envio", description)
			} finally {
				setLoadingResend(null)
			}
		},
		[props, toastManager, runStrapiStatusUpdate],
	)

	const runDelete = useCallback(
		async (target: OrderIntegrationTarget) => {
			if (!props.propostaId) return
			setLoadingDelete(target)
			try {
				const ctx = await buildOrderContext({
					propostaId: props.propostaId,
					businessId: props.businessId,
					orderValue: props.orderValue,
					vendedor: props.vendedor,
					vendedorId: props.vendedorId,
					existingBlingOrderId: props.blingOrderId,
				})
				if (!ctx) {
					toastManager.showFinalError(
						"Erro",
						"Não foi possível carregar os dados do pedido.",
					)
					return
				}

				toastManager.startPending()
				const result = await runIntegrationDelete(ctx, target)
				toastManager.showResult(
					result.message,
					result.description,
					!result.ok,
				)

				if (result.ok) {
					toastManager.showFinalSuccess(
						"Exclusão concluída",
						result.message,
					)
				} else {
					toastManager.closePending()
				}

				props.onRefresh?.()
			} catch (error) {
				toastManager.closePending()
				const description =
					error instanceof Error ? error.message : "Erro inesperado."
				toastManager.showFinalError("Falha na exclusão", description)
			} finally {
				setLoadingDelete(null)
			}
		},
		[props, toastManager],
	)

	return (
		<VStack w="full" spacing={2} align="stretch" mb={2}>
			{TARGETS.map((row) => {
				const sent = integrationSent(row.key, orderStatus)
				const destination = TARGET_LABELS[row.key]
				const resendDisabled =
					row.key === "strapi"
						? !props.businessId || isBusy
						: !props.propostaId || isBusy
				const resendLabel =
					row.key === "strapi"
						? row.resendLabel
						: `${row.resendLabel} para o ${destination}`
				return (
					<Box key={row.key} w="full">
						<Flex w="full" gap={2}>
							<Button
								flex={1}
								size="sm"
								h="auto"
								minH="36px"
								py={2}
								colorScheme="linkedin"
								variant="solid"
								isDisabled={resendDisabled}
								isLoading={loadingResend === row.key}
								onClick={() => runTarget(row.key)}
							>
								{resendLabel}
							</Button>
							<Button
								flex={1}
								size="sm"
								h="auto"
								minH="36px"
								py={2}
								colorScheme="red"
								variant="outline"
								isDisabled={!props.propostaId || isBusy}
								isLoading={loadingDelete === row.key}
								onClick={() => runDelete(row.key)}
							>
								{row.deleteLabel}
							</Button>
						</Flex>
						<Text fontSize="xs" color="gray.300" textAlign="center" mt={1}>
							{integrationSubtitle(sent)}
						</Text>
					</Box>
				)
			})}
		</VStack>
	)
}
