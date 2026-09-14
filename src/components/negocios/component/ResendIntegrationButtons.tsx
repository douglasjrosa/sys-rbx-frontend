import {
	buildOrderContext,
	integrationSent,
	integrationSubtitle,
	parseOrderStatus,
	runIntegrationsParallel,
	type OrderIntegrationTarget,
} from "@/function/orderIntegration"
import { OrderIntegrationToastManager } from "@/utils/orderIntegrationToasts"
import { useCallback, useMemo, useState } from "react"
import { Box, Button, Text, VStack, useToast } from "@chakra-ui/react"

type ResendIntegrationButtonsProps = {
	propostaId: string
	businessId: string
	orderValue: string
	vendedor: string
	vendedorId: string
	blingOrderId?: string
	orderStatusRaw?: unknown
	itemCount: number
	onRefresh?: () => void
}

const TARGETS: Array<{
	key: OrderIntegrationTarget
	label: string
}> = [
	{ key: "bling", label: "Reenviar para o Bling" },
	{ key: "trello", label: "Reenviar para o Trello" },
	{ key: "pixtrela", label: "Reenviar para o Pixtrela" },
	{ key: "strapi", label: "Reenviar para o Strapi" },
]

export default function ResendIntegrationButtons(
	props: ResendIntegrationButtonsProps,
) {
	const toast = useToast()
	const toastManager = useMemo(
		() => new OrderIntegrationToastManager(toast),
		[toast],
	)
	const [loadingTarget, setLoadingTarget] = useState<OrderIntegrationTarget | null>(
		null,
	)

	const orderStatus = useMemo(
		() => parseOrderStatus(props.orderStatusRaw),
		[props.orderStatusRaw],
	)

	const runTarget = useCallback(
		async (target: OrderIntegrationTarget) => {
			if (!props.propostaId) return
			setLoadingTarget(target)
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

				const { ok } = await runIntegrationsParallel(ctx, [target], {
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
				})

				if (ok) {
					toastManager.showFinalSuccess(
						"Tudo certo!",
						"Pedido reenviado com sucesso.",
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
				setLoadingTarget(null)
			}
		},
		[props, toastManager],
	)

	return (
		<VStack w="full" spacing={2} align="stretch" mb={2}>
			{TARGETS.map((row) => {
				const sent = integrationSent(row.key, orderStatus)
				return (
					<Box key={row.key} w="full">
						<Button
							w="full"
							size="sm"
							h="auto"
							minH="36px"
							py={2}
							colorScheme="linkedin"
							variant="solid"
							isDisabled={!props.propostaId || loadingTarget !== null}
							isLoading={loadingTarget === row.key}
							onClick={() => runTarget(row.key)}
						>
							{row.label}
						</Button>
						<Text fontSize="xs" color="gray.300" textAlign="center" mt={1}>
							{integrationSubtitle(sent)}
						</Text>
					</Box>
				)
			})}
		</VStack>
	)
}
