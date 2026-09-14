import {
	buildOrderContext,
	integrationSent,
	integrationSubtitle,
	parseOrderStatus,
	runIntegrationsParallel,
	type OrderIntegrationTarget,
} from "@/function/orderIntegration"
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
	const [loadingTarget, setLoadingTarget] = useState<OrderIntegrationTarget | null>(
		null,
	)

	const orderStatus = useMemo(
		() => parseOrderStatus(props.orderStatusRaw),
		[props.orderStatusRaw],
	)

	const showResultToast = useCallback(
		(
			title: string,
			description?: string,
			status: "success" | "error" | "info" = "info",
		) => {
			toast({
				title,
				description,
				status,
				isClosable: true,
				duration: status === "error" ? 30000 : 8000,
				position: "bottom",
			})
		},
		[toast],
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
					showResultToast(
						"Erro",
						"Não foi possível carregar os dados do pedido.",
						"error",
					)
					return
				}

				toast({
					title: "Enviando dados do pedido.",
					status: "info",
					isClosable: true,
					duration: 4000,
					position: "bottom",
				})

				await runIntegrationsParallel(ctx, [target], {
					onBling: (result) => {
						showResultToast(
							result.message,
							result.description,
							result.ok ? "success" : "error",
						)
					},
					onTrello: (result) => {
						showResultToast(
							result.message,
							result.description,
							result.ok ? "success" : "error",
						)
					},
					onPixtrelaItem: (item) => {
						showResultToast(
							`PIXTRELA: item ${item.itemIndex + 1}`,
							item.summary,
							item.ok ? "success" : "error",
						)
					},
					onStrapi: (result) => {
						showResultToast(
							result.message,
							result.description,
							result.ok ? "success" : "error",
						)
					},
				})

				props.onRefresh?.()
			} catch (error) {
				const description =
					error instanceof Error ? error.message : "Erro inesperado."
				showResultToast("Falha no envio", description, "error")
			} finally {
				setLoadingTarget(null)
			}
		},
		[props, showResultToast, toast],
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
