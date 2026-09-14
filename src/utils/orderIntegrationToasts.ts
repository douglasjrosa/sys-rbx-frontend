import type { ToastId, UseToastOptions } from "@chakra-ui/react"

const TOAST_POSITION = "bottom" as const

type ToastFn = (options?: UseToastOptions) => ToastId

export class OrderIntegrationToastManager {
	private pendingId?: ToastId

	constructor(private readonly toast: ToastFn) {}

	startPending(): void {
		this.closePending()
		this.pendingId = this.toast({
			title: "Enviando dados do pedido. Aguarde...",
			status: "info",
			duration: null,
			isClosable: false,
			position: TOAST_POSITION,
		})
	}

	closePending(): void {
		if (!this.pendingId) return
		this.toast.close(this.pendingId)
		this.pendingId = undefined
	}

	showResult(title: string, description?: string, failed = false): void {
		this.toast({
			title,
			description,
			status: failed ? "error" : "info",
			duration: failed ? 30000 : 8000,
			isClosable: true,
			position: TOAST_POSITION,
		})
	}

	showFinalSuccess(title: string, description?: string): void {
		this.closePending()
		this.toast({
			title,
			description,
			status: "success",
			duration: 5000,
			isClosable: true,
			position: TOAST_POSITION,
		})
	}

	showFinalError(title: string, description?: string): void {
		this.closePending()
		this.toast({
			title,
			description,
			status: "error",
			duration: 30000,
			isClosable: true,
			position: TOAST_POSITION,
		})
	}
}
