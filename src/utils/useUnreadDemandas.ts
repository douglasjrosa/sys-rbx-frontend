import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"

const DEFAULT_INTERVAL_MS = 60_000

interface ContentEntry {
	author?: string
}

interface DemandaItem {
	id: number
	attributes: {
		content?: ContentEntry[]
	}
}

export function useUnreadDemandas(
	intervalMs = DEFAULT_INTERVAL_MS
): number {
	const { data: session } = useSession()
	const [count, setCount] = useState(0)

	const username = session?.user?.name ?? ""
	const isAdmin = session?.user?.pemission === "Adm"
	const seenKey = `demandas_seen_${username}`

	const compute = useCallback(async () => {
		if (!session?.user || !username) return
		try {
			const params = isAdmin
				? "?all=true"
				: `?vendedor=${encodeURIComponent(username)}`
			const res = await axios.get(
				`/api/db/demandas/get${params}`
			)
			const data: DemandaItem[] = Array.isArray(res.data)
				? res.data
				: []

			let seenMap: Record<string, number> = {}
			try {
				const raw = localStorage.getItem(seenKey)
				seenMap = raw ? JSON.parse(raw) : {}
			} catch {
				seenMap = {}
			}

			let total = 0
			for (const d of data) {
				const content = d.attributes.content ?? []
				if (content.length === 0) continue
				const lastSeen = seenMap[String(d.id)] ?? 0
				const unseen = content.slice(lastSeen)
				if (unseen.some((e) => e.author !== username)) {
					total++
				}
			}
			setCount(total)
		} catch {
			setCount(0)
		}
	}, [session?.user, username, isAdmin, seenKey])

	useEffect(() => {
		compute()
		const interval = setInterval(compute, intervalMs)

		const onSeenUpdate = () => compute()
		window.addEventListener(
			"demandas_seen_update", onSeenUpdate
		)

		const onVisibility = () => {
			if (document.visibilityState === "visible") compute()
		}
		document.addEventListener(
			"visibilitychange", onVisibility
		)

		return () => {
			clearInterval(interval)
			window.removeEventListener(
				"demandas_seen_update", onSeenUpdate
			)
			document.removeEventListener(
				"visibilitychange", onVisibility
			)
		}
	}, [compute, intervalMs])

	return count
}
