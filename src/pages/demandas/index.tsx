import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Select,
	Text,
	Textarea,
	VStack,
	Wrap,
	WrapItem,
	useDisclosure,
	useToast,
} from "@chakra-ui/react"
import { useSession } from "next-auth/react"
import {
	useCallback, useEffect, useRef, useState,
} from "react"
import axios from "axios"
import {
	FiBriefcase,
	FiCalendar,
	FiClock,
	FiMessageSquare,
	FiPlus,
	FiTool,
} from "react-icons/fi"
import {
	FaLocationArrow, FaTimes, FaTrash,
} from "react-icons/fa"

const STATUS_OPTIONS = ["Na fila", "Em andamento", "Concluido"] as const
type StatusType = typeof STATUS_OPTIONS[number]

const CATEGORY_OPTIONS = [
	"Suporte comercial",
	"Suporte tecnico",
] as const
type CategoryType = typeof CATEGORY_OPTIONS[number]

const STATUS_COLOR: Record<StatusType, string> = {
	"Na fila": "yellow",
	"Em andamento": "blue",
	"Concluido": "green",
}

const CATEGORY_COLOR: Record<CategoryType, string> = {
	"Suporte comercial": "green",
	"Suporte tecnico": "red",
}

const CATEGORY_ICON: Record<CategoryType, any> = {
	"Suporte comercial": FiBriefcase,
	"Suporte tecnico": FiTool,
}

interface ContentEntry {
	date: string
	text: string
	author?: string
}

interface DemandaAttributes {
	titulo: string
	content: ContentEntry[]
	status: StatusType
	category: CategoryType
	viewers?: string[]
	user?: {
		data?: {
			id: number
			attributes?: { username?: string; nome?: string }
		}
	}
	createdAt: string
	publishedAt?: string
}

interface UserItem {
	id: number
	username: string
}

interface DemandaItem {
	id: number
	attributes: DemandaAttributes
}

export default function Demandas() {
	const { data: session } = useSession()
	const toast = useToast()

	const [demandas, setDemandas] = useState<DemandaItem[]>([])
	const [loading, setLoading] = useState(true)
	const [activeFilters, setActiveFilters] = useState<Set<StatusType>>(
		new Set(["Na fila", "Em andamento"] as StatusType[]) as Set<StatusType>
	)
	const [activeCategoryFilters, setActiveCategoryFilters] = useState<
		Set<CategoryType>
	>(new Set([...CATEGORY_OPTIONS]))
	const [activeVendorFilters, setActiveVendorFilters] = useState<
		Set<string>
	>(new Set())

	const [selectedDemanda, setSelectedDemanda] =
		useState<DemandaItem | null>(null)
	const [newMessage, setNewMessage] = useState("")
	const [sendingMessage, setSendingMessage] = useState(false)

	const {
		isOpen: isNewOpen,
		onOpen: onNewOpen,
		onClose: onNewClose,
	} = useDisclosure()
	const {
		isOpen: isDetailOpen,
		onOpen: onDetailOpen,
		onClose: onDetailClose,
	} = useDisclosure()

	const [newTitle, setNewTitle] = useState("")
	const [newCategory, setNewCategory] = useState<string>(
		CATEGORY_OPTIONS[0]
	)
	const [newText, setNewText] = useState("")
	const [creating, setCreating] = useState(false)

	const [usersList, setUsersList] = useState<UserItem[]>([])
	const [allUsersList, setAllUsersList] = useState<UserItem[]>([])
	const [selectedViewers, setSelectedViewers] = useState<
		Set<string>
	>(new Set())

	const isAdmin = session?.user?.pemission === "Adm"
	const username = session?.user?.name ?? ""

	const SEEN_KEY = `demandas_seen_${username}`

	const getSeenMap = useCallback((): Record<string, number> => {
		try {
			const raw = localStorage.getItem(SEEN_KEY)
			return raw ? JSON.parse(raw) : {}
		} catch {
			return {}
		}
	}, [SEEN_KEY])

	const markAsSeen = useCallback(
		(demandaId: number, contentLength: number) => {
			const map = getSeenMap()
			map[String(demandaId)] = contentLength
			localStorage.setItem(SEEN_KEY, JSON.stringify(map))
			window.dispatchEvent(new Event("demandas_seen_update"))
		},
		[getSeenMap, SEEN_KEY]
	)

	const hasUnseenFromOthers = useCallback(
		(d: DemandaItem): boolean => {
			const content = d.attributes.content ?? []
			if (content.length === 0) return false
			const seen = getSeenMap()
			const lastSeen = seen[String(d.id)] ?? 0
			const newEntries = content.slice(lastSeen)
			return newEntries.some((e) => e.author !== username)
		},
		[getSeenMap, username]
	)

	const initialLoadDone = useRef(false)
	const chatScrollRef = useRef<HTMLDivElement>(null)

	const fetchDemandas = useCallback(async () => {
		if (!session?.user) return
		if (!initialLoadDone.current) setLoading(true)
		try {
			const params = isAdmin
				? "?all=true"
				: `?vendedor=${encodeURIComponent(username)}`
			const res = await axios.get(
				`/api/db/demandas/get${params}`
			)
			const data = Array.isArray(res.data) ? res.data : []
			setDemandas(data)
		} catch {
			setDemandas([])
		} finally {
			setLoading(false)
			initialLoadDone.current = true
		}
	}, [session?.user, isAdmin, username])

	useEffect(() => {
		fetchDemandas()
		const interval = setInterval(fetchDemandas, 10_000)

		const onVisibility = () => {
			if (document.visibilityState === "visible") {
				fetchDemandas()
			}
		}
		document.addEventListener(
			"visibilitychange", onVisibility
		)

		return () => {
			clearInterval(interval)
			document.removeEventListener(
				"visibilitychange", onVisibility
			)
		}
	}, [fetchDemandas])

	useEffect(() => {
		if (!isAdmin) return
		axios
			.get("/api/db/user")
			.then((res) => {
				const data = res.data?.data ?? res.data
				const list: UserItem[] = Array.isArray(data)
					? data
					: []
				setAllUsersList(list)
				setUsersList(
					list.filter(
						(u: UserItem) => u.username !== username
					)
				)
				setActiveVendorFilters(
					new Set(list.map((u) => u.username))
				)
			})
			.catch(() => {
				setUsersList([])
				setAllUsersList([])
			})
	}, [isAdmin, username])

	const toggleViewer = (uname: string) => {
		setSelectedViewers((prev) => {
			const next = new Set(prev)
			if (next.has(uname)) {
				next.delete(uname)
			} else {
				next.add(uname)
			}
			return next
		})
	}

	const handleCreate = async () => {
		if (!newTitle.trim() || !newCategory || !newText.trim()) {
			toast({
				title: "Preencha todos os campos",
				status: "warning",
				duration: 3000,
				position: "top-right",
				isClosable: true,
			})
			return
		}
		setCreating(true)
		try {
			const userId = session?.user?.id
			const contentEntry: ContentEntry = {
				date: new Date().toISOString(),
				text: newText.trim(),
				author: username,
			}
			const viewers = isAdmin
				? Array.from(selectedViewers)
				: [username]
			await axios.post("/api/db/demandas/post", {
				data: {
					titulo: newTitle.trim().toUpperCase().slice(0, 50),
					content: [contentEntry],
					status: "Na fila",
					category: newCategory,
					user: userId ? Number(userId) : undefined,
					viewers: viewers?.length ? viewers : undefined,
					publishedAt: new Date().toISOString(),
				},
			})
			toast({
				title: "Demanda criada",
				status: "success",
				duration: 3000,
				position: "top-right",
				isClosable: true,
			})
			setNewTitle("")
			setNewCategory(CATEGORY_OPTIONS[0])
			setNewText("")
			setSelectedViewers(new Set())
			onNewClose()
			fetchDemandas()
		} catch {
			toast({
				title: "Erro ao criar demanda",
				status: "error",
				duration: 4000,
				position: "top-right",
				isClosable: true,
			})
		} finally {
			setCreating(false)
		}
	}

	const handleAddMessage = async () => {
		if (!selectedDemanda || !newMessage.trim()) return
		setSendingMessage(true)
		try {
			const currentContent: ContentEntry[] =
				selectedDemanda.attributes.content ?? []
			const entry: ContentEntry = {
				date: new Date().toISOString(),
				text: newMessage.trim(),
				author: username,
			}
			await axios.put(
				`/api/db/demandas/put?id=${selectedDemanda.id}`,
				{ data: { content: [...currentContent, entry] } }
			)
			setNewMessage("")
			const updated: DemandaItem = {
				...selectedDemanda,
				attributes: {
					...selectedDemanda.attributes,
					content: [...currentContent, entry],
				},
			}
			setSelectedDemanda(updated)
			setDemandas((prev) =>
				prev.map((d) => (d.id === updated.id ? updated : d))
			)
		} catch {
			toast({
				title: "Erro ao enviar mensagem",
				status: "error",
				duration: 4000,
				position: "top-right",
				isClosable: true,
			})
		} finally {
			setSendingMessage(false)
		}
	}

	const handleStatusChange = async (
		demanda: DemandaItem,
		newStatus: StatusType
	) => {
		try {
			await axios.put(
				`/api/db/demandas/put?id=${demanda.id}`,
				{ data: { status: newStatus } }
			)
			setDemandas((prev) =>
				prev.map((d) =>
					d.id === demanda.id
						? {
							...d,
							attributes: {
								...d.attributes,
								status: newStatus,
							},
						}
						: d
				)
			)
			if (selectedDemanda?.id === demanda.id) {
				setSelectedDemanda((prev) =>
					prev
						? {
							...prev,
							attributes: {
								...prev.attributes,
								status: newStatus,
							},
						}
						: null
				)
			}
			toast({
				title: "Status atualizado",
				status: "success",
				duration: 2000,
				position: "top-right",
				isClosable: true,
			})
		} catch {
			toast({
				title: "Erro ao atualizar status",
				status: "error",
				duration: 4000,
				position: "top-right",
				isClosable: true,
			})
		}
	}

	const handleDelete = async (demanda: DemandaItem) => {
		try {
			await axios.delete(
				`/api/db/demandas/delete?id=${demanda.id}`
			)
			setDemandas((prev) =>
				prev.filter((d) => d.id !== demanda.id)
			)
			onDetailClose()
			toast({
				title: "Demanda excluida",
				status: "success",
				duration: 2000,
				position: "top-right",
				isClosable: true,
			})
		} catch {
			toast({
				title: "Erro ao excluir demanda",
				status: "error",
				duration: 4000,
				position: "top-right",
				isClosable: true,
			})
		}
	}

	const handleToggleViewer = async (
		demanda: DemandaItem,
		viewerName: string
	) => {
		const owner = getDemandaOwner(demanda)
		if (viewerName === owner) return
		const current = demanda.attributes.viewers ?? []
		const updated = current.includes(viewerName)
			? current.filter((v) => v !== viewerName)
			: [...current, viewerName]
		try {
			await axios.put(
				`/api/db/demandas/put?id=${demanda.id}`,
				{ data: { viewers: updated } }
			)
			const updatedDemanda: DemandaItem = {
				...demanda,
				attributes: {
					...demanda.attributes,
					viewers: updated,
				},
			}
			setSelectedDemanda(updatedDemanda)
			setDemandas((prev) =>
				prev.map((d) =>
					d.id === demanda.id ? updatedDemanda : d
				)
			)
		} catch {
			toast({
				title: "Erro ao atualizar vendedores",
				status: "error",
				duration: 4000,
				position: "top-right",
				isClosable: true,
			})
		}
	}

	useEffect(() => {
		if (!selectedDemanda) return
		const updated = demandas.find(
			(d) => d.id === selectedDemanda.id
		)
		if (!updated) {
			onDetailClose()
			setSelectedDemanda(null)
			return
		}
		const oldLen =
			selectedDemanda.attributes.content?.length ?? 0
		const newLen =
			updated.attributes.content?.length ?? 0
		const changed =
			newLen !== oldLen ||
			updated.attributes.status !==
				selectedDemanda.attributes.status ||
			JSON.stringify(updated.attributes.viewers) !==
				JSON.stringify(
					selectedDemanda.attributes.viewers
				)
		if (changed) {
			setSelectedDemanda(updated)
			if (newLen !== oldLen) {
				markAsSeen(updated.id, newLen)
			}
		}
	}, [demandas, selectedDemanda, markAsSeen])

	useEffect(() => {
		if (!isDetailOpen) return
		const t = setTimeout(() => {
			const el = chatScrollRef.current
			if (el) el.scrollTop = el.scrollHeight
		}, 50)
		return () => clearTimeout(t)
	}, [
		isDetailOpen,
		selectedDemanda?.attributes.content?.length,
	])

	const openDetail = (demanda: DemandaItem) => {
		markAsSeen(
			demanda.id,
			demanda.attributes.content?.length ?? 0
		)
		setSelectedDemanda(demanda)
		setNewMessage("")
		onDetailOpen()
	}

	const filteredDemandas = demandas.filter((d) => {
		const statusOk =
			activeFilters.size === 0 ||
			activeFilters.has(d.attributes.status)
		const categoryOk =
			activeCategoryFilters.has(d.attributes.category)
		const vendorOk =
			!isAdmin ||
			activeVendorFilters.has(
				d.attributes.user?.data?.attributes
					?.username ?? ""
			)
		return statusOk && categoryOk && vendorOk
	})

	const getDemandaOwner = (d: DemandaItem): string => {
		return (
			d.attributes.user?.data?.attributes?.username ??
			d.attributes.user?.data?.attributes?.nome ??
			""
		)
	}

	const getLatestContent = (d: DemandaItem): ContentEntry | null => {
		const arr = d.attributes.content
		if (!arr || arr.length === 0) return null
		return arr[arr.length - 1]
	}

	const formatDate = (iso: string): string => {
		try {
			const d = new Date(iso)
			const date = d.toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
			})
			const time = d.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			})
			return `${date} ${time}`
		} catch {
			return iso
		}
	}

	if (!session) return null

	return (
		<Box
			minH="100vh"
			w="full"
			bg="gray.900"
			p={{ base: 4, md: 8 }}
		>
			<Flex
				justify="space-between"
				align="center"
				mb={6}
			>
				<Heading size="lg" color="white">
					Minhas Demandas
				</Heading>
				<Button
					leftIcon={<FiPlus />}
					colorScheme="blue"
					onClick={onNewOpen}
					size="sm"
				>
					Nova Demanda
				</Button>
			</Flex>

			<Flex
				direction={{ base: "column", md: "row" }}
				justify={{ base: "center", md: "space-between" }}
				align="center"
				gap={3}
				mb={6}
			>
				<HStack spacing={2} flexWrap="wrap" justify="center">
					{STATUS_OPTIONS.map((s) => (
						<Badge
							key={s}
							as="button"
							cursor="pointer"
							px={3}
							py={1}
							borderRadius="md"
							colorScheme={
								activeFilters.has(s)
									? STATUS_COLOR[s]
									: "gray"
							}
							onClick={() => {
								setActiveFilters((prev) => {
									const next = new Set(prev)
									if (next.has(s)) {
										next.delete(s)
									} else {
										next.add(s)
									}
									return next
								})
							}}
						>
							{s}
						</Badge>
					))}
				</HStack>
				<HStack spacing={2} justify="center">
					{CATEGORY_OPTIONS.map((c) => {
						const active = activeCategoryFilters.has(c)
						return (
							<IconButton
								key={c}
								aria-label={c}
								icon={
									<Icon
										as={CATEGORY_ICON[c]}
										boxSize="16px"
									/>
								}
								size="sm"
								variant={active ? "solid" : "outline"}
								colorScheme={
									active
										? CATEGORY_COLOR[c]
										: "gray"
								}
								borderRadius="md"
								onClick={() => {
									setActiveCategoryFilters(
										(prev) => {
											const next = new Set(
												prev
											)
											if (next.has(c)) {
												next.delete(c)
											} else {
												next.add(c)
											}
											return next
										}
									)
								}}
							/>
						)
					})}
				</HStack>
			</Flex>

			{isAdmin && allUsersList.length > 0 && (
				<Wrap
					spacing={1}
					mb={6}
					justify="center"
				>
					{allUsersList.map((u) => {
						const active = activeVendorFilters.has(
							u.username
						)
						return (
							<WrapItem key={u.id}>
								<Badge
									as="button"
									cursor="pointer"
									px={2}
									py={1}
									borderRadius="md"
									colorScheme={
										active ? "blue" : "gray"
									}
									variant={
										active ? "solid" : "outline"
									}
									opacity={active ? 1 : 0.6}
									onClick={() => {
										setActiveVendorFilters(
											(prev) => {
												const next =
													new Set(prev)
												if (
													next.has(
														u.username
													)
												) {
													next.delete(
														u.username
													)
												} else {
													next.add(
														u.username
													)
												}
												return next
											}
										)
									}}
								>
									{u.username}
								</Badge>
							</WrapItem>
						)
					})}
				</Wrap>
			)}

			{loading ? (
				<Text color="gray.400">Carregando...</Text>
			) : filteredDemandas.length === 0 ? (
				<Text color="gray.500">
					Nenhuma demanda encontrada.
				</Text>
			) : (
				<Flex
					flexWrap="wrap"
					gap={3}
				>
					{filteredDemandas.map((d) => {
						const latest = getLatestContent(d)
						const owner = getDemandaOwner(d)
						const isNew = hasUnseenFromOthers(d)
						return (
							<Card
								key={d.id}
								bg="gray.800"
								borderWidth={isNew ? "2px" : "1px"}
								borderStyle="solid"
								borderColor={
									isNew
										? "orange.400"
										: "gray.700"
								}
								cursor="pointer"
								w={{
									base: "100%",
									sm: "calc(50% - 6px)",
									lg: "calc(33.333% - 8px)",
								}}
								_hover={{
									borderColor: isNew
										? "orange.300"
										: "blue.500",
									transform: "translateY(-1px)",
								}}
								transition="all 0.15s"
								onClick={() => openDetail(d)}
							>
								<CardBody py={3} px={4}>
									<Flex
										justify="space-between"
										align="start"
										mb={2}
									>
										<HStack spacing={2}>
											<Box
												border="1.5px solid"
												borderColor={`${
													CATEGORY_COLOR[
														d.attributes
															.category
													] ?? "gray"
												}.300`}
												borderRadius="md"
												p="3px"
												display="flex"
												alignItems="center"
												justifyContent="center"
											>
												<Icon
													as={
														CATEGORY_ICON[
															d
																.attributes
																.category
														]
													}
													boxSize="16px"
													color={`${
														CATEGORY_COLOR[
															d
																.attributes
																.category
														] ?? "gray"
													}.300`}
												/>
											</Box>
											<Text
												fontSize="sm"
												fontWeight="bold"
												color="white"
												noOfLines={1}
											>
												{d.attributes.titulo}
											</Text>
										</HStack>
										<HStack spacing={2}>
											{isNew && (
												<Badge
													colorScheme="orange"
													fontSize="2xs"
													variant="solid"
												>
													NOVO
												</Badge>
											)}
											{isAdmin && owner && (
												<Text
													fontSize="xs"
													color="gray.400"
												>
													{owner}
												</Text>
											)}
										</HStack>
									</Flex>
									{latest && (
										<Text
											fontSize="xs"
											color="gray.400"
											noOfLines={2}
											mb={2}
										>
											{latest.text}
										</Text>
									)}
									<HStack
										spacing={3}
										justify="space-between"
									>
										<Badge
											colorScheme={
												STATUS_COLOR[
													d.attributes
														.status
												] ?? "gray"
											}
											fontSize="2xs"
										>
											{d.attributes.status}
										</Badge>
										<HStack
											spacing={1}
											color="gray.500"
										>
											<Icon
												as={FiCalendar}
												boxSize={3}
											/>
											<Text fontSize="xs">
												{formatDate(
													d.attributes
														.createdAt
												)}
											</Text>
										</HStack>
										<HStack
											spacing={1}
											color="gray.500"
										>
											<Icon
												as={FiMessageSquare}
												boxSize={3}
											/>
											<Text fontSize="xs">
												{d.attributes.content
													?.length ?? 0}
											</Text>
										</HStack>
									</HStack>
								</CardBody>
							</Card>
						)
					})}
				</Flex>
			)}

			{/* New Demanda Modal */}
			<Modal
				isOpen={isNewOpen}
				onClose={onNewClose}
				isCentered
			>
				<ModalOverlay
					bg="blackAlpha.300"
					backdropFilter="blur(10px)"
				/>
				<ModalContent bg="gray.700" position="relative">
					<IconButton
						aria-label="Fechar"
						icon={<FaTimes size={20} />}
						position="absolute"
						top="8px"
						right="8px"
						zIndex={1}
						size="sm"
						variant="solid"
						bg="red.500"
						color="white"
						rounded="md"
						_hover={{ bg: "red.600" }}
						onClick={onNewClose}
					/>
					<ModalHeader pt="55px" textAlign="center">
						NOVA DEMANDA
					</ModalHeader>
					<ModalBody pb={6}>
						<VStack spacing={4}>
							<Input
								placeholder="Titulo (max. 50 caracteres)"
								bg="gray.600"
								border="none"
								color="white"
								maxLength={50}
								value={newTitle}
								onChange={(e) =>
									setNewTitle(
										e.target.value.toUpperCase()
									)
								}
								_placeholder={{ color: "gray.400" }}
							/>
							<HStack
								spacing={3}
								justify="space-around"
								w="full"
							>
								{CATEGORY_OPTIONS.map((c) => {
									const active =
										newCategory === c
									return (
										<IconButton
											key={c}
											aria-label={c}
											icon={
												<Icon
													as={
														CATEGORY_ICON[
															c
														]
													}
													boxSize="20px"
												/>
											}
											size="md"
											variant={
												active
													? "solid"
													: "outline"
											}
											colorScheme={
												active
													? CATEGORY_COLOR[
															c
														]
													: "gray"
											}
											borderRadius="md"
											onClick={() =>
												setNewCategory(c)
											}
										/>
									)
								})}
							</HStack>
							<Textarea
								placeholder="Descreva sua demanda..."
								bg="gray.600"
								border="none"
								color="white"
								rows={5}
								value={newText}
								onChange={(e) =>
									setNewText(e.target.value)
								}
								_placeholder={{ color: "gray.400" }}
							/>
							{isAdmin && usersList.length > 0 && (
								<Box w="full">
									<Text
										fontSize="sm"
										color="gray.300"
										mb={2}
									>
										Vendedores que podem
										visualizar:
									</Text>
									<Wrap spacing={2}>
										{usersList.map((u) => (
											<WrapItem key={u.id}>
												<Badge
													as="button"
													cursor="pointer"
													px={3}
													py={1}
													borderRadius="md"
													bg={
														selectedViewers.has(
															u.username
														)
															? "#38A169"
															: undefined
													}
													color={
														selectedViewers.has(
															u.username
														)
															? "white"
															: undefined
													}
													colorScheme={
														selectedViewers.has(
															u.username
														)
															? undefined
															: "gray"
													}
													onClick={() =>
														toggleViewer(
															u.username
														)
													}
												>
													{u.username}
												</Badge>
											</WrapItem>
										))}
									</Wrap>
								</Box>
							)}
							<Button
								w="full"
								colorScheme="blue"
								isLoading={creating}
								isDisabled={creating}
								onClick={handleCreate}
							>
								Criar Demanda
							</Button>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>

			{/* Detail Modal */}
			<Modal
				isOpen={isDetailOpen}
				onClose={onDetailClose}
			>
				<ModalOverlay
					bg={{
						base: "transparent",
						lg: "blackAlpha.300",
					}}
					backdropFilter={{
						base: "none",
						lg: "blur(10px)",
					}}
				/>
				<ModalContent
					bg="gray.700"
					display="flex"
					flexDirection="column"
					position={{ base: "fixed", lg: "relative" }}
					top={{ base: 0, lg: "auto" }}
					left={{ base: 0, lg: "auto" }}
					m={{ base: 0, lg: "auto" }}
					pt={{ base: "60px", lg: 0 }}
					w={{ base: "100vw", lg: "350px" }}
					maxW={{ base: "100vw", lg: "350px" }}
					h={{ base: "100vh", lg: "90vh" }}
					maxH={{ base: "100vh", lg: "90vh" }}
					borderRadius={{
						base: "none",
						lg: "xl",
					}}
					overflow="hidden"
					boxShadow={{
						base: "none",
						lg: "dark-lg",
					}}
				>
					{selectedDemanda && (
						<Flex
							flexDirection="column"
							h="full"
							minH={0}
						>
							<Flex
								px={4}
								pt={3}
								pb={2}
								bg={{
									base: "gray.900",
									lg: "gray.700",
								}}
								borderBottom="1px solid"
								borderColor="gray.600"
								flexDirection="column"
								flexShrink={0}
							>
								<Flex
									justify="space-between"
									align="start"
									mb={2}
								>
									<IconButton
										aria-label="Excluir"
										icon={
											<FaTrash size={14} />
										}
										size="sm"
										variant="solid"
										bg="red.500"
										color="white"
										rounded="md"
										_hover={{
											bg: "red.600",
										}}
										onClick={() =>
											handleDelete(
												selectedDemanda
											)
										}
									/>
									<HStack
										flex={1}
										justify="center"
										px={2}
										spacing={2}
									>
										<Box
											border="1.5px solid"
											borderColor={`${
												CATEGORY_COLOR[
													selectedDemanda
														.attributes
														.category
												] ?? "gray"
											}.300`}
											borderRadius="md"
											p="4px"
											display="flex"
											alignItems="center"
											justifyContent="center"
											flexShrink={0}
										>
											<Icon
												as={
													CATEGORY_ICON[
														selectedDemanda
															.attributes
															.category
													]
												}
												boxSize="18px"
												color={`${
													CATEGORY_COLOR[
														selectedDemanda
															.attributes
															.category
													] ?? "gray"
												}.300`}
											/>
										</Box>
										<Text
											fontSize="md"
											fontWeight="bold"
											color="white"
											noOfLines={1}
										>
											{
												selectedDemanda
													.attributes
													.titulo
											}
										</Text>
									</HStack>
									<IconButton
										aria-label="Fechar"
										icon={
											<FaTimes size={20} />
										}
										size="sm"
										variant="solid"
										bg="red.500"
										color="white"
										rounded="md"
										_hover={{
											bg: "red.600",
										}}
										onClick={onDetailClose}
									/>
								</Flex>
								{getDemandaOwner(
									selectedDemanda
								) && (
									<Text
										fontSize="xs"
										color="gray.400"
										textAlign="center"
										mt={-1}
									>
										Criado por{" "}
										{getDemandaOwner(
											selectedDemanda
										)}
									</Text>
								)}
								<Flex
									direction="column"
									align="center"
									gap={2}
									mt={2}
								>
									{isAdmin &&
										usersList.length > 0 && (
										<Wrap
											spacing={1}
											justify="center"
										>
											<WrapItem>
												<Text
													fontSize="2xs"
													color="gray.500"
													lineHeight="20px"
												>
													Visivel para:
												</Text>
											</WrapItem>
											{usersList.map(
												(u) => {
													const active =
														selectedDemanda.attributes.viewers?.includes(
															u.username
														) ??
														false
													const isOwner =
														getDemandaOwner(
															selectedDemanda
														) ===
														u.username
													return (
														<WrapItem
															key={
																u.id
															}
														>
															<Badge
																as={
																	isOwner
																		? "span"
																		: "button"
																}
																cursor={
																	isOwner
																		? "default"
																		: "pointer"
																}
																fontSize="2xs"
																bg={
																	active ||
																	isOwner
																		? "#38A169"
																		: undefined
																}
																color={
																	active ||
																	isOwner
																		? "white"
																		: undefined
																}
																colorScheme={
																	active ||
																	isOwner
																		? undefined
																		: "gray"
																}
																opacity={
																	isOwner
																		? 0.7
																		: 1
																}
																onClick={
																	isOwner
																		? undefined
																		: () =>
																				handleToggleViewer(
																					selectedDemanda,
																					u.username
																				)
																}
															>
																{
																	u.username
																}
															</Badge>
														</WrapItem>
													)
												}
											)}
										</Wrap>
									)}
									<HStack spacing={1}>
										{STATUS_OPTIONS.map(
											(s) => {
												const active =
													selectedDemanda
														.attributes
														.status ===
													s
												return (
													<Badge
														key={s}
														as={
															isAdmin
																? "button"
																: "span"
														}
														cursor={
															isAdmin
																? "pointer"
																: "default"
														}
														fontSize="2xs"
														colorScheme={
															active
																? (STATUS_COLOR[
																		s
																	] ??
																	"gray")
																: "gray"
														}
														variant={
															active
																? "solid"
																: "outline"
														}
														opacity={
															active
																? 1
																: 0.6
														}
														onClick={
															isAdmin
																? () =>
																		handleStatusChange(
																			selectedDemanda,
																			s
																		)
																: undefined
														}
													>
														{s}
													</Badge>
												)
											}
										)}
									</HStack>
								</Flex>
							</Flex>

							<Box
								ref={chatScrollRef}
								flex={1}
								bgGradient="linear(to-br, #0f1b2e, #161a30, #1e1d3a, #2a2248, #352a54)"
								overflowY="auto"
								p={4}
								display="flex"
								flexDirection="column"
							>
								{(
									selectedDemanda.attributes
										.content ?? []
								).map(
									(
										entry: ContentEntry,
										idx: number
									) => {
										const isOwn =
											entry.author ===
											username
										return (
											<Box
												key={idx}
												maxW="65%"
												alignSelf={
													isOwn
														? "flex-end"
														: "flex-start"
												}
												bg={
													isOwn
														? "#dcf8c6"
														: "#EDF2F7"
												}
												color="#2D3748"
												p={2}
												borderRadius="lg"
												borderBottomRightRadius={
													isOwn
														? "0px"
														: "lg"
												}
												borderBottomLeftRadius={
													isOwn
														? "lg"
														: "0px"
												}
												mb={2}
											>
												<Box
													fontSize="13px"
													fontWeight="bold"
													mb={1}
												>
													{entry.author ??
														""}
												</Box>
												<Box
													px={3}
													whiteSpace="pre-wrap"
													fontSize="12px"
												>
													{entry.text}
												</Box>
												<Box
													fontSize="10px"
													mt={2}
													textAlign="end"
													textDecoration="underline"
												>
													{formatDate(
														entry.date
													)}
												</Box>
											</Box>
										)
									}
								)}
							</Box>

							{selectedDemanda.attributes
								.status !== "Concluido" && (
								<Box
									bg="gray.700"
									borderTop="1px solid"
									borderColor="gray.600"
									p={3}
									flexShrink={0}
								>
									<Flex
										gap={3}
										alignItems="flex-end"
										w="full"
									>
										<Textarea
											flex={1}
											resize="none"
											fontSize="15px"
											lineHeight="1.4"
											bg="#ffffff12"
											color="white"
											p="10px"
											rounded="5px"
											borderColor="gray.300"
											minH="44px"
											rows={1}
											overflowY="auto"
											value={newMessage}
											onChange={(e) => {
												setNewMessage(
													e.target.value
												)
												const el =
													e.target
												el.style.height =
													"auto"
												const max = 167
												el.style.height = `${Math.min(
													el.scrollHeight,
													max
												)}px`
											}}
											placeholder="Digite sua mensagem"
											onKeyDown={(e) => {
												if (
													e.key ===
														"Enter" &&
													!e.shiftKey
												) {
													e.preventDefault()
													handleAddMessage()
												}
											}}
										/>
										<IconButton
											aria-label="Enviar"
											bg="#38A169"
											color="gray.700"
											icon={
												<FaLocationArrow />
											}
											onClick={
												handleAddMessage
											}
											isLoading={
												sendingMessage
											}
											minH="44px"
											minW="44px"
											flexShrink={0}
										/>
									</Flex>
								</Box>
							)}
						</Flex>
					)}
				</ModalContent>
			</Modal>
		</Box>
	)
}
