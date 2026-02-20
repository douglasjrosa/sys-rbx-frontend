import {
	Box, Button, Input, Select, Table, Thead, Th, Tr, Tbody, Td, useToast, Badge, Flex, Heading, Text, InputGroup, InputLeftElement, InputRightElement, IconButton, Spinner, HStack, VStack, Skeleton, useDisclosure, Divider,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaSearch, FaSync, FaFileInvoiceDollar, FaTrash, FaInfoCircle, FaTimes, FaAngleDoubleLeft, FaAngleDoubleRight, FaMoneyBillWave, FaSave, FaShoppingCart } from 'react-icons/fa'
import { marginTables } from '@/components/data/marginTables'
import { getTableBadgeColor, getTableNameInPortuguese } from '@/utils/tableUtils'
import { parseCurrency } from '@/utils/customNumberFormats'

/** Extracts a safe string from axios/API errors. Prevents React #31 (object as child). */
function getToastErrorMessage ( err: unknown, fallback: string ): string {
	const ax = err as { response?: { status?: number; data?: unknown }; message?: string }
	if ( ax?.response?.status === 504 ) return 'Tempo limite excedido. Tente novamente em alguns instantes.'
	const d = ax?.response?.data
	if ( typeof d === 'string' ) return d
	if ( typeof ( d as { error?: unknown } )?.error === 'string' ) return ( d as { error: string } ).error
	const errObj = ( d as { error?: { message?: string }; message?: string } )?.error
	if ( errObj && typeof errObj === 'object' && typeof errObj.message === 'string' ) return errObj.message
	if ( typeof ( d as { message?: string } )?.message === 'string' ) return ( d as { message: string } ).message
	return ax?.message || fallback
}

interface Pedido {
	id: number
	attributes: {
		itens: string | any[]
	}
}

interface Business {
	id: number
	attributes: {
		createdAt: string
		budget: number
		Budget?: number // Some endpoints return with capital B
		etapa: number
		andamento: number
		pedidos?: {
			data: Pedido[]
		}
		vendedor?: {
			data?: { id: number }
		}
	}
}

interface Company {
	id: number
	attributes: {
		nome: string
		CNPJ: string
		tablecalc: string
		email: string
		emailNfe: string
		businesses?: {
			data: Business[]
		}
		user?: {
			data?: {
				id: number
				attributes: {
					username: string
				}
			}
		}
	}
}

interface Product {
	nomeProd: string
	prodId: number
	custo: number
	custoMp?: number
	vFinal: number
	preco: number
	titulo: string
	modelo: string
	empresa: string
	comprimento: number
	largura: number
	altura: number
	tabela: string
	tablecalc?: number
	ncm?: string
	codigo: string
	pesoCx: number
	created_from: string
	ativo: boolean
	expired: boolean
	expiresIn?: string
	deleteIndex: boolean
	lastChange: string
	lastUser?: string
	audit?: any
}

const formatCNPJ = (cnpj: string | undefined | null) => {
	if (!cnpj) return ''
	const cleaned = cnpj.replace(/\D/g, '')
	return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

const formatDate = (dateString?: string) => {
	if (!dateString || dateString === '-') return '-'
	try {
		// Tentar detectar se a data está no formato DD/MM/YYYY
		if (typeof dateString === 'string' && dateString.includes('/')) {
			const parts = dateString.split('/')
			if (parts.length === 3) {
				// Assumindo DD/MM/YYYY, JavaScript espera MM/DD/YYYY ou YYYY-MM-DD
				const day = parts[0]
				const month = parts[1]
				const year = parts[2]
				return `${day}/${month}/${year}`
			}
		}

		const date = new Date(dateString)
		if (isNaN(date.getTime())) return dateString // Retornar original se não conseguir parsear
		return new Intl.DateTimeFormat('pt-BR').format(date)
	} catch {
		return dateString || '-'
	}
}

function Produtos() {
	const router = useRouter()
	const { empresaId, pagina, proposta } = router.query
	// Fallback when router.query not ready (Next.js hydration)
	const queryFromPath = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
	const effectiveEmpresaId = (Array.isArray(empresaId) ? empresaId[0] : empresaId) ?? queryFromPath?.get('empresaId') ?? ''
	const effectiveProposta = (Array.isArray(proposta) ? proposta[0] : proposta) ?? queryFromPath?.get('proposta') ?? ''
	const [companies, setCompanies] = useState<Company[]>([])
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
	const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null)
	const [selectedTable, setSelectedTable] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const { data: session } = useSession()
	const toast = useToast()
	const [products, setProducts] = useState<Product[]>([])
	const [selectedItems, setSelectedItems] = useState<number[]>([])
	const [isLoadingProposalItems, setIsLoadingProposalItems] = useState(false)
	const [isLoadingProducts, setIsLoadingProducts] = useState(() => {
		if (typeof window === 'undefined') return false
		const params = new URLSearchParams(window.location.search)
		return !!(params.get('empresaId') || params.get('proposta'))
	})

	// Efeito para carregar itens da proposta selecionada
	useEffect(() => {
		if (!effectiveProposta) {
			// Only clear when router is ready (avoids clearing during hydration/navigation)
			if (router.isReady) {
				setSelectedItems([])
			}
			return
		}
		// Load from localStorage first - localStorage prevails over DB (including empty array)
		if (typeof localStorage !== 'undefined') {
			const storedItems = localStorage.getItem(`proposal_items_${effectiveProposta}`)
			if (storedItems !== null) {
				try {
					const items = JSON.parse(storedItems)
					if (Array.isArray(items)) {
						const ids = items.map((item: any) => {
							const id = item.prodId ?? item.codg
							return parseInt(String(id), 10)
						}).filter(id => !isNaN(id))
						setSelectedItems(ids)
						return
					}
				} catch {
					/* ignore parse errors */
				}
			}
		}
		// Fallback: load from DB when selectedCompany is available (only when no localStorage)
		if (selectedCompany) {
			const business = selectedCompany.attributes.businesses?.data?.find(
				(b: any) => String(b.id) === String(effectiveProposta)
			)
			if (business) {
				const pedido = business.attributes.pedidos?.data?.[0]
				if (pedido?.attributes?.itens) {
					try {
						const itens = typeof pedido.attributes.itens === 'string'
							? JSON.parse(pedido.attributes.itens)
							: pedido.attributes.itens
						if (Array.isArray(itens)) {
							const ids = itens.map((item: any) => {
								const id = item.prodId ?? item.codg
								return parseInt(String(id), 10)
							}).filter(id => !isNaN(id))
							setSelectedItems(ids)
							localStorage.setItem(`proposal_items_${effectiveProposta}`, JSON.stringify(itens))
						}
					} catch {
						setSelectedItems([])
					}
				} else {
					setSelectedItems([])
				}
			}
		}
	}, [effectiveProposta, selectedCompany, router.isReady])

	const [isUpdatingAll, setIsUpdatingAll] = useState(false)
	const [isSyncing, setIsSyncing] = useState(false)
	const [isSyncingCompany, setIsSyncingCompany] = useState(false)

	// Refs
	const companyInputRef = useRef<HTMLInputElement>(null)
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const searchAbortRef = useRef<AbortController | null>(null)
	const searchTermRef = useRef<string>('')

	// Company search: loading state for skeleton and race-condition handling
	const [isSearchingCompanies, setIsSearchingCompanies] = useState(false)

	const SEARCH_DEBOUNCE_MS = 350

	// Pagination State
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize] = useState(10)
	const [inputPage, setInputPage] = useState('1')

	// Efeito para carregar a empresa e página caso existam na query
	useEffect(() => {
		if (effectiveEmpresaId && (!selectedCompany || String(selectedCompany.id) !== String(effectiveEmpresaId))) {
			const fetchSelectedCompany = async () => {
				try {
					const url = `/api/db/empresas/getId/${effectiveEmpresaId}`
					const response = await axios.get(url)
					if (response.data) {
						const company = response.data.data
						setSelectedCompany(company)
						setSelectedCompanyName(company.attributes.nome)
					}
				} catch (error) {
					console.error('Erro ao carregar empresa da querystring:', error)
					setIsLoadingProducts(false)
				}
			}
			fetchSelectedCompany()
		}

		if (pagina) {
			const p = parseInt(Array.isArray(pagina) ? pagina[0] : pagina, 10)
			if (!isNaN(p) && p > 0) {
				setCurrentPage(p)
			}
		}
	}, [effectiveEmpresaId, pagina])

	// Efeito para atualizar a querystring quando uma empresa ou página é selecionada
	// Do not remove empresaId when loading from URL (selectedCompany not yet set)
	useEffect(() => {
		const currentEmpresaId = router.query.empresaId
		const currentPagina = router.query.pagina
		const newQuery: any = { ...router.query }
		let changed = false

		if (selectedCompany) {
			if (String(currentEmpresaId) !== String(selectedCompany.id)) {
				newQuery.empresaId = selectedCompany.id
				changed = true
			}
		}

		if (currentPage > 1) {
			if (String(currentPagina) !== String(currentPage)) {
				newQuery.pagina = currentPage
				changed = true
			}
		} else if (currentPagina) {
			delete newQuery.pagina
			changed = true
		}

		if (changed) {
			router.push({
				pathname: router.pathname,
				query: newQuery,
			}, undefined, { shallow: true })
		}
	}, [selectedCompany, currentPage, router])

	// Modal States
	const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onDeleteClose } = useDisclosure()
	const { isOpen: isDetailsOpen, onOpen: onOpenDetails, onClose: onDetailsClose } = useDisclosure()
	const [productToDelete, setProductToDelete] = useState<Product | null>(null)
	const [productToShow, setProductToDetails] = useState<Product | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const cancelRef = useRef<HTMLButtonElement>(null)

	const fetchProducts = useCallback(async () => {
		if (!selectedCompany?.id || !session?.user?.email) {
			// Only clear loading when we are not expecting to load (no empresaId in URL)
			if (!effectiveEmpresaId) setIsLoadingProducts(false)
			return
		}

		setIsLoadingProducts(true)
		try {
			const empresaId = selectedCompany.id
			const response = await axios.get(`/api/db/produtos/list?empresaId=${empresaId}`)
			setProducts(response.data || [])
		} catch (error) {
			console.error('Erro ao buscar produtos:', error)
		} finally {
			setIsLoadingProducts(false)
		}
	}, [session?.user?.email, selectedCompany?.id, effectiveEmpresaId])

	const handleDeleteProduct = useCallback(async () => {
		if (!productToDelete || !session?.user?.email) return

		setIsDeleting(true)
		try {
			// 1. Desativar na API externa (WordPress) - Define como ativo=0
			await axios.post(`/api/rbx/${session?.user?.email}/produtos`, {
				delete: true,
				prodId: productToDelete.prodId
			})

			// 2. Excluir do Strapi
			// O productToDelete já deve conter o 'id' do Strapi se veio da nossa API de listagem
			try {
				if ((productToDelete as any).id) {
					await axios.delete(`/api/db/produtos/delete?id=${(productToDelete as any).id}`)
				} else {
					// Fallback caso o ID não esteja no objeto (busca por prodId)
					const strapiRes = await axios.get(`/api/db/produtos/list?empresaId=${selectedCompany?.id}`)
					const strapiProduct = strapiRes.data.find((p: any) => p.prodId === productToDelete.prodId)
					if (strapiProduct) {
						await axios.delete(`/api/db/produtos/delete?id=${strapiProduct.id}`)
					}
				}
			} catch (strapiError: any) {
				// Se retornar 404, significa que o produto já foi removido (talvez pela sincronização do passo 1)
				// Nesse caso, ignoramos o erro e seguimos o fluxo
				if (strapiError.response?.status !== 404) {
					throw strapiError // Re-lança se for outro tipo de erro
				}
			}

			toast({
				title: 'Produto removido com sucesso',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})

			onDeleteClose()
			fetchProducts()
		} catch (error) {
			console.error('Erro ao excluir produto:', error)
			toast({
				title: 'Erro ao excluir',
				description: 'Ocorreu uma falha ao tentar remover o produto.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		} finally {
			setIsDeleting(false)
		}
	}, [productToDelete, session, selectedCompany, toast, onDeleteClose, fetchProducts])

	useEffect(() => {
		if (selectedCompany) {
			const tablecalc = parseFloat(selectedCompany.attributes.tablecalc) || 0
			// Find exact match or just set the value
			setSelectedTable(tablecalc.toFixed(2))
		}
	}, [selectedCompany])

	useEffect(() => () => {
		if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
		if (searchAbortRef.current) searchAbortRef.current.abort()
	}, [])

	const handleSearch = useCallback((value: string) => {
		searchTermRef.current = value
		setSelectedCompanyName(value)
		if (value.length < 3) {
			setCompanies([])
			setIsSearchingCompanies(false)
			if (searchDebounceRef.current) {
				clearTimeout(searchDebounceRef.current)
				searchDebounceRef.current = null
			}
			if (searchAbortRef.current) {
				searchAbortRef.current.abort()
				searchAbortRef.current = null
			}
			return
		}

		setIsSearchingCompanies(true)
		if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

		searchDebounceRef.current = setTimeout(async () => {
			searchDebounceRef.current = null
			const searchFor = searchTermRef.current?.trim() ?? ''
			if (searchFor.length < 3) {
				setIsSearchingCompanies(false)
				return
			}

			if (searchAbortRef.current) {
				searchAbortRef.current.abort()
			}
			const controller = new AbortController()
			searchAbortRef.current = controller

			try {
				const url = `/api/refactory/companies?searchString=${encodeURIComponent(searchFor)}&populate=businesses`
				const response = await axios(url, { signal: controller.signal })
				if (controller.signal.aborted) return
				const data = response.data?.data ?? []
				if (searchTermRef.current?.trim() !== searchFor) return
				setCompanies(data)
			} catch (err: unknown) {
				const errObj = err as { code?: string; name?: string }
				if (errObj?.code === 'ERR_CANCELED' || errObj?.name === 'CanceledError' || errObj?.name === 'AbortError') return
				console.error('Erro na busca:', err)
			} finally {
				if (searchAbortRef.current === controller) searchAbortRef.current = null
				if (searchTermRef.current?.trim() === searchFor) setIsSearchingCompanies(false)
			}
		}, SEARCH_DEBOUNCE_MS)
	}, [])

	const handleClearCompany = useCallback(() => {
		searchTermRef.current = ''
		setIsSearchingCompanies(false)
		if (searchDebounceRef.current) {
			clearTimeout(searchDebounceRef.current)
			searchDebounceRef.current = null
		}
		if (searchAbortRef.current) {
			searchAbortRef.current.abort()
			searchAbortRef.current = null
		}
		setSelectedCompany(null)
		setSelectedCompanyName('')
		setSelectedTable(null)
		setCompanies([])
		setProducts([])
		setSelectedItems([])

		// Remove everything from URL
		router.push({
			pathname: router.pathname,
			query: {},
		}, undefined, { shallow: true })

		// Focus back on the input
		setTimeout(() => {
			companyInputRef.current?.focus()
		}, 100)
	}, [router])

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			e.preventDefault()
			handleClearCompany()
			return
		}

		if (companies.length === 0) return

		const currentIndex = companies.findIndex(
			(company: Company) => company.attributes.nome === selectedCompanyName
		)

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			const nextIndex = (currentIndex + 1) % companies.length
			const nextCompany: Company = companies[nextIndex]
			setSelectedCompanyName(nextCompany.attributes.nome)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			const prevIndex = currentIndex <= 0 ? companies.length - 1 : currentIndex - 1
			const prevCompany: Company = companies[prevIndex]
			setSelectedCompanyName(prevCompany.attributes.nome)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			const companyToSelect = currentIndex === -1 ? companies[0] : companies[currentIndex]
			if (companyToSelect) {
				const companyUser = companyToSelect.attributes.user?.data
				const isOtherVendedor = companyUser && String(companyUser.id) !== String(session?.user?.id)
				const isAdmin = session?.user?.pemission === 'Adm'
				const isBlocked = isOtherVendedor && !isAdmin

				if (isBlocked) return

				setIsSearchingCompanies(false)
				setSelectedCompany(companyToSelect)
				setSelectedCompanyName(companyToSelect.attributes.nome)
				setCompanies([])
			}
		}
	}

	const handleSaveTable = useCallback(() => {
		if (selectedCompany && selectedTable) {
			axios.put(`/api/refactory/companies`, {
				id: selectedCompany.id,
				tablecalc: selectedTable,
			})
				.then(() => {
					toast({
						title: 'Tabela salva com sucesso',
						status: 'success',
						duration: 3000,
						isClosable: true,
					})
					fetchProducts() // Refresh prices
				})
				.catch((error) => {
					console.error('Error saving table:', error)
				})
		}
	}, [selectedCompany, selectedTable, toast, fetchProducts])

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	const handleSyncCompanyProducts = useCallback(async () => {
		if (!selectedCompany?.id || !selectedCompany?.attributes?.CNPJ || !session?.user?.email) return

		setIsSyncing(true)
		toast({
			id: 'sync-company-prod',
			title: 'Sincronizando produtos',
			description: 'Buscando dados no sistema legado...',
			status: 'info',
			duration: null,
		})

		try {
			// 1. Buscar todos os produtos da empresa na API externa (paginado para evitar 504 em produção)
			const cnpj = selectedCompany.attributes.CNPJ
			const FETCH_PAGE_SIZE = 200
			const allProducts: any[] = []
			let offset = 0
			let hasMore = true
			const MAX_RETRIES = 2
			const RETRY_DELAY_MS = 1500
			while ( hasMore ) {
				const url = `/api/rbx/${session?.user?.email}/produtos?CNPJ=${cnpj}&limit=${FETCH_PAGE_SIZE}&offset=${offset}`
				let lastErr: unknown = null
				for ( let attempt = 0; attempt <= MAX_RETRIES; attempt++ ) {
					try {
						if ( attempt > 0 ) {
							await new Promise( ( r ) => setTimeout( r, RETRY_DELAY_MS ) )
						}
						const prodRes = await axios.get( url )
						const page = Array.isArray( prodRes.data ) ? prodRes.data : []
						allProducts.push( ...page )
						hasMore = page.length >= FETCH_PAGE_SIZE
						offset += FETCH_PAGE_SIZE
						if ( hasMore ) {
							toast.update( 'sync-company-prod', {
								description: `Buscando produtos... ${allProducts.length} carregados.`,
							} )
						}
						lastErr = null
						break
					} catch ( pageErr: unknown ) {
						lastErr = pageErr
						const ax = pageErr as { response?: { status?: number }; message?: string }
						const is504 = ax?.response?.status === 504
						if ( !is504 || attempt >= MAX_RETRIES ) throw pageErr
					}
				}
				if ( lastErr ) throw lastErr
			}

			// 2. Filtrar apenas ativos
			const activeProducts = allProducts.filter((p: any) => p.ativo === "1")

			if (activeProducts.length > 0) {
				const BATCH_SIZE = 5
				let totalCreated = 0
				let totalUpdated = 0
				const syncedProdIds: number[] = []

				for (let i = 0; i < activeProducts.length; i += BATCH_SIZE) {
					const batch = activeProducts.slice(i, i + BATCH_SIZE)
					const lastInBatch = batch[batch.length - 1]
					const productName = lastInBatch?.nomeProd || lastInBatch?.codigo || `rbx-${lastInBatch?.prodId}` || ''
					const current = Math.min(i + BATCH_SIZE, activeProducts.length)

					toast.update('sync-company-prod', {
						description: `Processando ${current}/${activeProducts.length}: ${productName}`,
					})

					const syncRes = await axios.post(`/api/db/produtos/sync`, {
						empresaId: selectedCompany.id,
						produtos: batch,
					})
					totalCreated += syncRes.data.created || 0
					totalUpdated += syncRes.data.updated || 0
					batch.forEach((p: any) => syncedProdIds.push(Number(p.prodId)))
				}

				if (activeProducts.length > 0) {
					toast.update('sync-company-prod', {
						description: 'Removendo produtos não encontrados no legado...',
					})
					await axios.post(`/api/db/produtos/sync`, {
						empresaId: selectedCompany.id,
						produtos: [],
						deleteMissing: true,
						keepProdIds: syncedProdIds,
					})
				}

				toast.close('sync-company-prod')
				toast({
					title: 'Sincronização concluída',
					description: `${totalCreated} novos e ${totalUpdated} atualizados.`,
					status: 'success',
					duration: 5000,
					isClosable: true,
				})
				fetchProducts()
			} else {
				toast.close('sync-company-prod')
				toast({
					title: 'Nenhum produto ativo',
					description: 'Não foram encontrados produtos ativos para sincronizar.',
					status: 'warning',
					duration: 5000,
				})
			}
		} catch (error: unknown) {
			console.error('Erro na sincronização individual:', error)
			toast.close('sync-company-prod')
			toast({
				title: 'Erro na sincronização',
				description: getToastErrorMessage( error, 'Falha ao sincronizar produtos.' ),
				status: 'error',
				duration: 7000,
				isClosable: true,
			})
		} finally {
			setIsSyncing(false)
		}
	}, [selectedCompany, session, toast, fetchProducts])

	const handleRefreshProduct = useCallback(async (product: Product) => {
		try {
			toast({
				title: 'Atualizando produto',
				description: 'Buscando dados atualizados no sistema legado...',
				status: 'info',
				duration: 2000,
			})

			// 1. Buscar dados atualizados na API externa (WordPress)
			const prodRes = await axios.get(`/api/rbx/${session?.user?.email}/produtos?prodId=${product.prodId}`)
			const updatedProduct = prodRes.data

			if (updatedProduct && !updatedProduct.error) {
				// 2. Sincronizar com o sistema comercial
				await axios.post(`/api/db/produtos/sync`, {
					empresaId: selectedCompany?.id,
					produtos: [updatedProduct]
				})

				fetchProducts()

				toast({
					title: 'Sucesso',
					description: 'Produto atualizado com sucesso.',
					status: 'success',
					duration: 3000,
				})
			} else {
				throw new Error(updatedProduct?.error || 'Produto não encontrado no sistema legado.')
			}
		} catch (error: unknown) {
			console.error('Erro ao atualizar produto:', error)
			toast({
				title: 'Erro ao atualizar',
				description: getToastErrorMessage( error, 'Não foi possível atualizar os dados do produto.' ),
				status: 'error',
				duration: 5000,
			})
		}
	}, [session?.user?.email, selectedCompany?.id, fetchProducts, toast])

	const handleUpdateAllExpired = async () => {
		const expiredOnes = products.filter(p => p.expired)
		if (expiredOnes.length === 0) return

		setIsUpdatingAll(true)
		toast({
			id: 'update-all-toast',
			title: 'Sincronizando produtos',
			description: `Processando ${expiredOnes.length} produtos expirados...`,
			status: 'info',
			duration: null,
		})

		try {
			// Para atualizar expirados de forma consistente, fazemos um sync completo dos produtos ativos (paginado)
			const cnpj = selectedCompany?.attributes.CNPJ
			const FETCH_PAGE_SIZE = 200
			const allProducts: any[] = []
			let offset = 0
			let hasMore = true
			while ( hasMore ) {
				const prodRes = await axios.get(
					`/api/rbx/${session?.user?.email}/produtos?CNPJ=${cnpj}&limit=${FETCH_PAGE_SIZE}&offset=${offset}`
				)
				const page = Array.isArray( prodRes.data ) ? prodRes.data : []
				allProducts.push( ...page )
				hasMore = page.length >= FETCH_PAGE_SIZE
				offset += FETCH_PAGE_SIZE
			}
			const activeProducts = allProducts.filter((p: any) => p.ativo === "1")

			if (activeProducts.length > 0) {
				await axios.post(`/api/db/produtos/sync`, {
					empresaId: selectedCompany?.id,
					produtos: activeProducts
				})
			}

			await fetchProducts()

			toast.close('update-all-toast')
			toast({
				title: 'Sucesso',
				description: 'Os produtos foram atualizados com sucesso.',
				status: 'success',
				duration: 5000,
			})
		} catch (error: unknown) {
			console.error('Erro na atualização em massa:', error)
			toast.close('update-all-toast')
			toast({
				title: 'Erro na atualização',
				description: getToastErrorMessage( error, 'Ocorreu um erro ao tentar atualizar os produtos.' ),
				status: 'error',
				duration: 5000,
				isClosable: true
			})
		} finally {
			setIsUpdatingAll(false)
		}
	}

	const filteredProducts = useMemo(() => {
		if (!searchTerm) return products
		const term = searchTerm.toLowerCase().trim()
		const normalizedTerm = term.replace(/\s+/g, '').replace(/x/g, 'x') // ensure we use 'x'

		return products.filter(p => {
			// Nome, Modelo, Código e prodId
			if (
				p.nomeProd?.toLowerCase().includes(term) ||
				p.modelo?.toLowerCase().includes(term) ||
				p.codigo?.toLowerCase().includes(term) ||
				p.prodId.toString().includes(term)
			) return true

			// Medidas: {comprimento}x{largura}x{altura}
			const dimString = `${p.comprimento}x${p.largura}x${p.altura}`
			if (dimString.startsWith(normalizedTerm)) return true

			return false
		})
	}, [products, searchTerm])

	const totalPages = useMemo(() => Math.ceil(filteredProducts.length / pageSize), [filteredProducts, pageSize])

	// Normalized Set for O(1) lookup; handles prodId as number or string from API
	const selectedIdsSet = useMemo(() => {
		const set = new Set<number>()
		selectedItems.forEach(id => set.add(Number(id)))
		return set
	}, [selectedItems])

	const isProductSelected = useCallback((prodId: number | string) =>
		selectedIdsSet.has(Number(prodId)), [selectedIdsSet])

	// Sync selectedItems to localStorage when toggling (so proposal page and cart stay in sync)
	useEffect(() => {
		if (!effectiveProposta || typeof localStorage === 'undefined') return

		let existingItems: any[] = []
		try {
			const stored = localStorage.getItem(`proposal_items_${effectiveProposta}`)
			if (stored) {
				const parsed = JSON.parse(stored)
				if (Array.isArray(parsed)) existingItems = parsed
			}
		} catch {
			/* ignore */
		}

		// Do not overwrite localStorage before load effect has populated selectedItems.
		// When selectedIdsSet is empty but localStorage has items, we are in initial load.
		if (selectedIdsSet.size === 0 && existingItems.length > 0) return

		const selectedIdsArr = Array.from(selectedIdsSet)
		const existingFiltered = existingItems.filter((item: any) => {
			const pid = Number(item.prodId ?? item.codg)
			return !isNaN(pid) && selectedIdsSet.has(pid)
		})
		const existingIds = new Set(existingFiltered.map((item: any) => Number(item.prodId ?? item.codg)))
		const newSelectedIds = selectedIdsArr.filter(id => !existingIds.has(id))
		const newProducts = products.filter(p => newSelectedIds.includes(Number(p.prodId)))

		const existingByProdId = new Map<number, { Qtd: number | string; mont: boolean; expo: boolean }>()
		existingFiltered.forEach((item: any) => {
			const pid = Number(item.prodId ?? item.codg)
			if (!isNaN(pid)) {
				existingByProdId.set(pid, {
					Qtd: item.Qtd ?? 1,
					mont: Boolean(item.mont),
					expo: Boolean(item.expo),
				})
			}
		})

		const newItems = newProducts.map((product, index) => {
			const codigo = product.codigo || `rbx-${product.prodId}`
			const nomeProd = codigo.substr(0, 3) === 'rbx'
				? product.nomeProd
				: `${product.nomeProd} | ref: rbx-${product.prodId}`

			const existing = existingByProdId.get(Number(product.prodId))
			const Qtd = existing?.Qtd ?? '1'
			const mont = existing?.mont ?? false
			const expo = existing?.expo ?? false

			const unitPrice = parseCurrency(product.vFinal)
			const aditionalService = Math.round(unitPrice * 10) / 100
			const priceWithServices = unitPrice + (mont ? aditionalService : 0) + (expo ? aditionalService : 0)
			const qty = typeof Qtd === 'number' ? Qtd : parseFloat(String(Qtd).replace(',', '.')) || 1
			const total = (priceWithServices * qty).toLocaleString('pt-BR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})

			return {
				id: existingFiltered.length + index + 1,
				nomeProd,
				codigo,
				Qtd,
				ncm: product.ncm,
				codg: product.prodId,
				comprimento: product.comprimento,
				largura: product.largura,
				altura: product.altura,
				expo,
				mont,
				ativo: '1',
				preco: product.preco,
				total,
				modelo: product.modelo,
				pesoCx: product.pesoCx,
				prodId: product.prodId,
				tabela: product.tabela,
				titulo: product.titulo,
				vFinal: product.vFinal,
				empresa: product.empresa,
				lastChange: product.lastChange,
				created_from: product.created_from || null,
			}
		})

		const itemsToSave = [...existingFiltered, ...newItems]
		localStorage.setItem(`proposal_items_${effectiveProposta}`, JSON.stringify(itemsToSave))
	}, [effectiveProposta, selectedIdsSet, products])

	const paginatedProducts = useMemo(() => {
		const start = (currentPage - 1) * pageSize
		return filteredProducts.slice(start, start + pageSize)
	}, [filteredProducts, currentPage, pageSize])

	// Reset page when search term changes
	useEffect(() => {
		setCurrentPage(1)
		setInputPage('1')
	}, [searchTerm])

	// Update input page when current page changes
	useEffect(() => {
		setInputPage(currentPage.toString())
	}, [currentPage])

	const expiredCount = useMemo(() => products.filter(p => p.expired).length, [products])

	const currentTableName = useMemo(() => {
		if (!selectedCompany?.attributes.tablecalc) return null
		const margin = parseFloat(selectedCompany.attributes.tablecalc)
		const table = marginTables.find(t => t.profitMargin.toFixed(2) === margin.toFixed(2))
		return table ? table.name : `${(margin * 100).toFixed(0)}%`
	}, [selectedCompany])

	const ongoingBusinesses = useMemo(() => {
		if (!selectedCompany?.attributes.businesses?.data) return []
		const currentUserId = session?.user?.id != null ? String(session.user.id) : null
		return selectedCompany.attributes.businesses.data
			.filter((b: Business) => {
				const andamento = parseInt(String(b.attributes.andamento ?? ''), 10)
				const etapa = parseInt(String(b.attributes.etapa ?? ''), 10)
				if (andamento !== 3 || etapa === 6) return false
				if (currentUserId) {
					const vendedorId = b.attributes.vendedor?.data?.id
					return vendedorId != null && String(vendedorId) === currentUserId
				}
				return true
			})
			.map((b: Business) => {
				const rawBudget = (b.attributes as any).Budget ?? b.attributes.budget
				return {
					...b,
					attributes: {
						...b.attributes,
						budget: typeof rawBudget === 'string' ? parseFloat(rawBudget) : (rawBudget || 0)
					}
				}
			})
			.sort((a, b) => new Date(b.attributes.createdAt).getTime() - new Date(a.attributes.createdAt).getTime())
	}, [selectedCompany, session?.user?.id])

	const handleSelectProposta = useCallback((id: number) => {
		router.push({
			pathname: router.pathname,
			query: { ...router.query, proposta: id },
		}, undefined, { shallow: true })
	}, [router])

	const toggleItem = useCallback((product: Product) => {
		const prodIdNum = Number(product.prodId)
		const isRemoving = selectedIdsSet.has(prodIdNum)

		setSelectedItems(prev =>
			isRemoving
				? prev.filter(id => Number(id) !== prodIdNum)
				: [...prev, prodIdNum]
		)

		toast({
			title: isRemoving ? 'Removido da proposta' : 'Adicionado à proposta',
			description: product.nomeProd,
			status: isRemoving ? 'info' : 'success',
			duration: 2000,
			isClosable: true,
			position: 'bottom-left'
		})
	}, [selectedIdsSet, toast])

	const handleSaveProposalItems = useCallback(() => {
		if (!effectiveProposta) {
			toast({
				title: 'Nenhuma proposta selecionada',
				status: 'warning',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		// Load existing items to preserve Mont., Expo., QTD when merging
		const existingByProdId = new Map<number, { Qtd: number | string; mont: boolean; expo: boolean }>()
		if (typeof localStorage !== 'undefined') {
			try {
				const stored = localStorage.getItem(`proposal_items_${effectiveProposta}`)
				if (stored) {
					const existing = JSON.parse(stored)
					if (Array.isArray(existing)) {
						existing.forEach((item: any) => {
							const pid = Number(item.prodId ?? item.codg)
							if (!isNaN(pid)) {
								existingByProdId.set(pid, {
									Qtd: item.Qtd ?? 1,
									mont: Boolean(item.mont),
									expo: Boolean(item.expo),
								})
							}
						})
					}
				}
			} catch {
				/* ignore */
			}
		}

		// Filtrar os produtos completos que foram selecionados
		const selectedProducts = products.filter(p => selectedIdsSet.has(Number(p.prodId)))

		// Mapear para o formato esperado pela página de proposta (preserve Mont., Expo., QTD)
		const itemsToSave = selectedProducts.map((product, index) => {
			const codigo = product.codigo || `rbx-${product.prodId}`
			const nomeProd = codigo.substr(0, 3) === "rbx"
				? product.nomeProd
				: `${product.nomeProd} | ref: rbx-${product.prodId}`

			const existing = existingByProdId.get(Number(product.prodId))
			const Qtd = existing?.Qtd ?? "1"
			const mont = existing?.mont ?? false
			const expo = existing?.expo ?? false

			const unitPrice = parseCurrency(product.vFinal)
			const aditionalService = Math.round(unitPrice * 10) / 100
			const priceWithServices = unitPrice + (mont ? aditionalService : 0) + (expo ? aditionalService : 0)
			const qty = typeof Qtd === 'number' ? Qtd : parseFloat(String(Qtd).replace(',', '.')) || 1
			const total = (priceWithServices * qty).toLocaleString('pt-BR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})

			return {
				id: index + 1,
				nomeProd,
				codigo,
				Qtd,
				ncm: product.ncm,
				codg: product.prodId,
				comprimento: product.comprimento,
				largura: product.largura,
				altura: product.altura,
				expo,
				mont,
				ativo: "1",
				preco: product.preco,
				total,
				modelo: product.modelo,
				pesoCx: product.pesoCx,
				prodId: product.prodId,
				tabela: product.tabela,
				titulo: product.titulo,
				vFinal: product.vFinal,
				empresa: product.empresa,
				lastChange: product.lastChange,
				created_from: product.created_from || null
			}
		})

		// Armazenar no localStorage para que a página da proposta possa ler
		localStorage.setItem(`proposal_items_${effectiveProposta}`, JSON.stringify(itemsToSave))

		toast({
			title: 'Seleção salva!',
			description: `${itemsToSave.length} itens adicionados à proposta.`,
			status: 'success',
			duration: 2000,
			isClosable: true,
		})

		// Redirecionar para a página da proposta
		router.push(`/negocios/proposta/${effectiveProposta}`)
	}, [effectiveProposta, selectedIdsSet, products, router, toast])

	return (
		<Box pb={20} >
			<Box
				display="flex"
				flexDirection="column"
				gap={6}
				p={10}
				bg="gray.800"
				minH="100vh"
				color="white"
				overflowX={{ base: 'hidden', md: 'visible' }}
			>
				<Flex
					flexDirection={{ base: 'column', md: 'column', lg: 'row' }}
					justifyContent="space-between"
					alignItems={{ base: 'stretch', lg: 'center' }}
					gap={4}
				>
					<Heading size="lg" flexShrink={0}>Produtos</Heading>
					{selectedCompany && (
						<Flex
							flexDirection={{ base: 'column', md: 'row' }}
							justifyContent="space-between"
							gap={4}
							w={{ base: 'full', lg: 'auto' }}
							alignItems={{ base: 'stretch', md: 'center' }}
						>
							<Select
								size="sm"
								width={{ base: 'full', md: '200px' }}
								borderRadius="md"
								value={selectedTable || ''}
								onChange={(e) => setSelectedTable(e.target.value)}
								bg="gray.700"
								border="none"
							>
								<option value="" style={{ background: '#1A202C' }}>Tabela</option>
								{marginTables.map(table => (
									<option key={table.id} value={table.profitMargin.toFixed(2)} style={{ background: '#1A202C' }}>
										{table.name} ({(table.profitMargin * 100).toFixed(0)}%)
									</option>
								))}
							</Select>
							<Button
								size="sm"
								colorScheme="blue"
								variant="solid"
								onClick={handleSaveTable}
								isDisabled={!selectedTable}
								w={{ base: 'full', md: 'auto' }}
							>
								Aplicar Margem
							</Button>
							<Box w={{ base: 'full', md: 'auto' }}>
								<Link
									href={{
										pathname: '/produtos/novo',
										query: { cnpj: selectedCompany.attributes.CNPJ },
									}}
									passHref
								>
									<Button
										leftIcon={<FaFileInvoiceDollar />}
										colorScheme="green"
										size="sm"
										w={{ base: 'full', md: 'auto' }}
									>
										Novo Produto
									</Button>
								</Link>
							</Box>
						</Flex>
					)}
				</Flex>

				<Box
					bg="gray.700"
					p={6}
					borderRadius={{ base: 0, md: 'xl' }}
					shadow="xl"
					w={{ base: '100vw', md: 'full' }}
					position={{ base: 'relative', md: 'static' }}
					left={{ base: '50%', md: 'auto' }}
					transform={{ base: 'translateX(-50%)', md: 'none' }}
				>
					<Flex direction={{ base: 'column', lg: 'row' }} gap={6} align={{ base: 'center', lg: 'center' }} justify="space-between">
						<Box w={{ base: 'full', lg: '320px' }} minW="250px">
							<Text fontSize="sm" fontWeight="bold" mb={2} color="gray.300" textAlign="left">Empresa</Text>
							<Box position="relative">
								<InputGroup size="sm">
									<InputLeftElement pointerEvents="none">
										<FaSearch color="gray.400" />
									</InputLeftElement>
									<Input
										ref={companyInputRef}
										placeholder="Pesquisar empresa por nome ou CNPJ..."
										onChange={(e) => handleSearch(e.target.value)}
										value={selectedCompanyName || ''}
										borderRadius="md"
										onKeyDown={handleKeyDown}
										bg="gray.800"
										border="none"
										_focus={{ ring: 2, ringColor: 'blue.500' }}
										pr={selectedCompanyName ? "2.5rem" : "0.75rem"}
									/>
									{selectedCompanyName && (
										<InputRightElement width="2.5rem">
											<IconButton
												aria-label="Limpar busca"
												icon={<FaTimes />}
												size="xs"
												colorScheme="red"
												variant="ghost"
												onClick={handleClearCompany}
												_hover={{ bg: "red.500", color: "white" }}
											/>
										</InputRightElement>
									)}
								</InputGroup>
								{((selectedCompanyName?.length ?? 0) >= 3 && (companies.length > 0 || isSearchingCompanies)) && (
									<Box
										position="absolute"
										top="100%"
										left={0}
										right={0}
										bg="gray.800"
										boxShadow="2xl"
										zIndex={10}
										maxH="200px"
										overflowY="auto"
										borderRadius="md"
										mt={1}
										border="1px"
										borderColor="gray.600"
									>
										{isSearchingCompanies && companies.length === 0 ? (
											<Box p={3}>
												<Flex justifyContent="space-between" alignItems="center" gap={2}>
													<Box flex={1}>
														<Skeleton height="16px" width="80%" mb={2} borderRadius="md" />
														<Skeleton height="12px" width="50%" borderRadius="md" />
													</Box>
												</Flex>
											</Box>
										) : companies.map((company: Company, index: number) => {
											const companyUser = company.attributes.user?.data
											const isOtherVendedor = companyUser && String(companyUser.id) !== String(session?.user?.id)
											const isAdmin = session?.user?.pemission === 'Adm'
											const isBlocked = isOtherVendedor && !isAdmin

											return (
												<Box
													key={`${company.id}-${index}`}
													p={3}
													cursor={isBlocked ? "not-allowed" : "pointer"}
													bg={selectedCompanyName === company.attributes.nome ? 'blue.900' : 'transparent'}
													_hover={!isBlocked ? { bg: 'blue.700' } : {}}
													opacity={isBlocked ? 0.7 : 1}
													onClick={() => {
														if (isBlocked) return
														setIsSearchingCompanies(false)
														setSelectedCompany(company)
														setSelectedCompanyName(company.attributes.nome)
														setCompanies([])
													}}
												>
													<Flex justifyContent="space-between" alignItems="center">
														<Box pointerEvents="none">
															<Text fontWeight="bold" color="white">{company.attributes.nome}</Text>
															<Text fontSize="xs" color="gray.400">{formatCNPJ(company.attributes.CNPJ)}</Text>
														</Box>
														{isOtherVendedor && (
															<Badge colorScheme="orange" ml={2}>
																{companyUser.attributes.username}
															</Badge>
														)}
													</Flex>
												</Box>
											)
										})}
									</Box>
								)}
							</Box>
						</Box>

						{selectedCompany && ongoingBusinesses.length > 0 && (
							<Box w={{ base: 'full', lg: 'auto' }} minW="250px" bg="gray.800" p={3} borderRadius="md" border="1px" borderColor="gray.600">
								<Text fontSize="xs" fontWeight="bold" mb={2} color="white" textTransform="uppercase">
									Negócios em andamento
								</Text>
								<VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
									{ongoingBusinesses.map((b: Business) => {
										const isSelected = String(effectiveProposta) === String(b.id)
										return (
											<Flex
												key={b.id}
												align="center"
												gap={2}
												justify="space-between"
												cursor="pointer"
												_hover={{ color: 'yellow.200' }}
												onClick={() => handleSelectProposta(b.id)}
												color={isSelected ? 'yellow.300' : 'yellow.400'}
												transition="0.2s"
											>
												<Flex align="center" gap={2} flex={1}>
													<FaMoneyBillWave size="14px" color="green" />
													<Text fontSize="13px" fontWeight={isSelected ? 'bold' : 'medium'}>
														{new Date(b.attributes.createdAt).toLocaleDateString('pt-BR')} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(b.attributes.budget || 0)}
													</Text>
												</Flex>
												{isSelected && (
													<IconButton
														aria-label="Salvar Proposta"
														icon={<FaSave />}
														size="xs"
														colorScheme="blue"
														variant="solid"
														isDisabled={isLoadingProducts}
														onClick={(e) => {
															e.stopPropagation()
															handleSaveProposalItems()
														}}
													/>
												)}
											</Flex>
										)
									})}
								</VStack>
							</Box>
						)}
					</Flex>
				</Box>

				{selectedCompany && (
					<Box
						bg="gray.700"
						p={6}
						borderRadius={{ base: 0, md: 'xl' }}
						shadow="xl"
						w={{ base: '100vw', md: 'full' }}
						position={{ base: 'relative', md: 'static' }}
						left={{ base: '50%', md: 'auto' }}
						transform={{ base: 'translateX(-50%)', md: 'none' }}
					>
						<Flex
							direction={{ base: 'column', lg: 'row' }}
							gap={4}
							alignItems="center"
							mb={6}
							w="full"
						>
							{ /* Título: Sempre à esquerda */}
							<Box w={{ base: 'full', lg: 'auto' }} textAlign="left">
								<HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
									<Heading
										size={{ base: 'sm', md: 'md' }}
										whiteSpace="normal"
									>
										Produtos Vinculados
									</Heading>
									<Badge
										colorScheme="blue"
										borderRadius="full"
										px={2}
										fontSize={{ base: 'xs', md: 'sm' }}
									>
										{products.length}
									</Badge>
									<IconButton
										aria-label="Sincronizar Produtos"
										icon={<FaSync size="10px" />}
										size={{ base: 'xs', md: 'sm' }}
										colorScheme="blue"
										onClick={handleSyncCompanyProducts}
										isLoading={isSyncing}
										variant="solid"
									/>
								</HStack>
							</Box>

							{ /* Filtro: Sempre centralizado */}
							<Box flex={1} display="flex" justifyContent="center" w="full">
								<InputGroup size="sm" w={{ base: 'full', md: '300px' }}>
									<InputLeftElement pointerEvents="none">
										<FaSearch color="gray.400" />
									</InputLeftElement>
									<Input
										placeholder="Filtrar nesta lista..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										bg="gray.800"
										border="none"
										borderRadius="md"
									/>
								</InputGroup>
							</Box>

							{ /* Paginação e Ações: Direita em LG, Centralizada em bases menores */}
							<Flex
								direction={{ base: 'column', md: 'row' }}
								gap={4}
								alignItems="center"
								justifyContent={{ base: 'center', lg: 'flex-end' }}
								w={{ base: 'full', lg: 'auto' }}
							>
								{totalPages > 1 && (
									<HStack spacing={2}>
										<Button
											size="xs"
											bg="#2b6cb0"
											color="white"
											_hover={{ bg: '#2c5282' }}
											_active={{ bg: '#2a4365' }}
											_disabled={{ bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' }}
											onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
											isDisabled={currentPage === 1}
										>
											<FaAngleDoubleLeft />
										</Button>
										<Text fontSize="xs" whiteSpace="nowrap">Página:</Text>
										<Input
											type="number"
											min={1}
											max={totalPages}
											size="xs"
											width="45px"
											textAlign="center"
											borderRadius="md"
											bg="gray.800"
											border="none"
											value={inputPage}
											onChange={(e) => setInputPage(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													const num = parseInt(inputPage, 10)
													if (!isNaN(num) && num >= 1 && num <= totalPages) {
														setCurrentPage(num)
													} else {
														setInputPage(currentPage.toString())
													}
												}
											}}
											onBlur={() => {
												const num = parseInt(inputPage, 10)
												if (isNaN(num) || num < 1 || num > totalPages) {
													setInputPage(currentPage.toString())
												} else {
													setCurrentPage(num)
												}
											}}
										/>
										<Text fontSize="xs" whiteSpace="nowrap">de {totalPages}</Text>
										<Button
											size="xs"
											bg="#2b6cb0"
											color="white"
											_hover={{ bg: '#2c5282' }}
											_active={{ bg: '#2a4365' }}
											_disabled={{ bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' }}
											onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
											isDisabled={currentPage === totalPages}
										>
											<FaAngleDoubleRight />
										</Button>
									</HStack>
								)}

								{expiredCount > 0 && (
									<Button
										size="sm"
										leftIcon={<FaSync />}
										colorScheme="orange"
										onClick={handleUpdateAllExpired}
										isLoading={isUpdatingAll}
										loadingText="Atualizando..."
										w={{ base: 'full', md: 'auto' }}
									>
										Atualizar {expiredCount} Expirados
									</Button>
								)}
							</Flex>
						</Flex>

						{isLoadingProducts ? (
							<Box overflowX="auto">
								<Table variant="simple" size="sm">
									<Thead>
										<Tr>
											<Th color="gray.400" textAlign="center">Código</Th>
											<Th color="gray.400">Produto</Th>
											<Th color="gray.400" textAlign="center">Preço Final</Th>
											<Th color="gray.400" textAlign="center">Histórico</Th>
											<Th color="gray.400" textAlign="center">AÇÕES</Th>
										</Tr>
									</Thead>
									<Tbody>
										{[1, 2, 3, 4, 5].map((i) => (
											<Tr key={i}>
												<Td textAlign="center"><VStack align="center" spacing={1}><Skeleton h="20px" w="60px" /><Skeleton h="12px" w="40px" /></VStack></Td>
												<Td><Skeleton h="20px" w="200px" /><Skeleton h="12px" w="150px" mt={1} /></Td>
												<Td><VStack align="center"><Skeleton h="20px" w="80px" /><Skeleton h="15px" w="50px" /></VStack></Td>
												<Td><VStack align="center"><Skeleton h="20px" w="80px" /><Skeleton h="12px" w="60px" /></VStack></Td>
												<Td textAlign="right"><Skeleton h="25px" w="80px" ml="auto" /></Td>
											</Tr>
										))}
									</Tbody>
								</Table>
							</Box>
						) : products.length === 0 ? (
							<Text textAlign="center" py={10} color="gray.400">Nenhum produto encontrado para esta empresa.</Text>
						) : (
							<Box overflowX="auto">
								<Table variant="simple" size="sm">
									<Thead>
										<Tr>
											<Th color="gray.400" textAlign="center">Código</Th>
											<Th color="gray.400">Produto</Th>
											<Th color="gray.400" textAlign="center">Preço Final</Th>
											<Th color="gray.400" textAlign="center">Histórico</Th>
											<Th color="gray.400" textAlign="center">AÇÕES</Th>
										</Tr>
									</Thead>
									<Tbody>
										{paginatedProducts.map((product: Product, index: number) => (
											<Tr key={index} _hover={{ bg: 'gray.600' }} transition="0.2s">
												<Td fontWeight="bold" color="blue.300" py={4} textAlign="center">
													<VStack align="center" spacing={1}>
														<Text>{product.codigo}</Text>
														<Badge colorScheme="gray" variant="subtle" fontSize="9px">
															rbx-{product.prodId}
														</Badge>
													</VStack>
												</Td>
												<Td py={4}>
													<Box>
														<Text fontWeight="bold">{product.nomeProd}</Text>
														<Flex gap={2} mb={1} alignItems="center">
															<Text fontSize="xs" color="gray.400">{product.titulo}</Text>
														</Flex>
														<HStack spacing={2}>
															{product.pesoCx > 0 && (
																<Badge variant="subtle" colorScheme="orange" fontSize="10px">
																	{product.pesoCx}kg
																</Badge>
															)}
															<Badge variant="outline" colorScheme="gray" textTransform="lowercase" fontSize="10px">
																{`${product.comprimento} x ${product.largura} x ${product.altura} cm (alt.)`}
															</Badge>
														</HStack>
													</Box>
												</Td>
												<Td fontWeight="bold" color="green.300" py={4}>
													<VStack align="center" spacing={1}>
														<Text fontSize="sm">
															{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.vFinal)}
														</Text>
														{(selectedCompany?.attributes.tablecalc || product.tablecalc) !== undefined && (
															<Badge
																fontSize="10px"
																colorScheme={getTableBadgeColor(getTableNameInPortuguese(selectedCompany?.attributes.tablecalc || product.tablecalc))}
																color={getTableBadgeColor(getTableNameInPortuguese(selectedCompany?.attributes.tablecalc || product.tablecalc)) === 'yellow' ? 'black' : undefined}
																variant="solid"
															>
																{getTableNameInPortuguese(selectedCompany?.attributes.tablecalc || product.tablecalc)}
															</Badge>
														)}
														{session?.user?.pemission === 'Adm' && product.custoMp && (
															<Badge fontSize="10px" colorScheme="orange" variant="subtle">
																Custo MP: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.custoMp)}
															</Badge>
														)}
													</VStack>
												</Td>
												<Td textAlign="center" py={4}>
													<VStack spacing={1}>
														{product.expiresIn && product.expiresIn !== '-' && (
															<Badge colorScheme={product.expired ? "red" : "green"} variant={product.expired ? "solid" : "subtle"}>
																{formatDate(product.expiresIn)}
															</Badge>
														)}
														<Box fontSize="10px" color="gray.400" textAlign="center">
															<Text>Alterado em {formatDate(product.lastChange)}</Text>
															{product.lastUser && <Text>Por {product.lastUser}</Text>}
														</Box>
													</VStack>
												</Td>
												<Td textAlign="center" py={4}>
													<HStack spacing={2} justify="center">
														{effectiveProposta && (
															<IconButton
																aria-label="Adicionar à proposta"
																icon={<FaShoppingCart color={isProductSelected(product.prodId) ? "white" : undefined} />}
																size="sm"
																variant={isProductSelected(product.prodId) ? "solid" : "ghost"}
																bg={isProductSelected(product.prodId) ? "green.500" : "transparent"}
																colorScheme={isProductSelected(product.prodId) ? "green" : "gray"}
																color={isProductSelected(product.prodId) ? "white" : "gray.400"}
																_hover={{
																	bg: isProductSelected(product.prodId) ? "green.600" : "whiteAlpha.100",
																	color: "white"
																}}
																onClick={() => toggleItem(product)}
															/>
														)}
														<IconButton
															aria-label="Detalhes"
															icon={<FaInfoCircle />}
															size="sm"
															colorScheme="blue"
															variant="ghost"
															color="blue.300"
															_hover={{ bg: "blue.900" }}
															onClick={() => {
																setProductToDetails(product)
																onOpenDetails()
															}}
														/>
														{session?.user?.pemission === 'Adm' && (
															<>
																<IconButton
																	aria-label="Atualizar"
																	icon={<FaSync />}
																	size="sm"
																	colorScheme="cyan"
																	variant="ghost"
																	color="cyan.300"
																	_hover={{ bg: "cyan.900" }}
																	onClick={() => handleRefreshProduct(product)}
																/>
																<IconButton
																	aria-label="Excluir"
																	icon={<FaTrash />}
																	size="sm"
																	colorScheme="red"
																	variant="ghost"
																	color="red.300"
																	_hover={{ bg: "red.900" }}
																	onClick={() => {
																		setProductToDelete(product)
																		onOpenDelete()
																	}}
																/>
															</>
														)}
													</HStack>
												</Td>
											</Tr>
										))}
									</Tbody>
								</Table>
							</Box>
						)}
					</Box>
				)}

				{/* Modal de Detalhes */}
				<Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
					<ModalOverlay backdropFilter="blur(4px)" />
					<ModalContent bg="gray.800" color="white" borderRadius="xl">
						<ModalHeader borderBottom="1px" borderColor="gray.700">
							Detalhes do Produto: {productToShow?.nomeProd}
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody py={6}>
							{productToShow && (
								<VStack align="stretch" spacing={6}>
									<Box>
										<Text color="gray.400" fontSize="xs" fontWeight="bold" mb={2}>Medidas externas da caixa DESMONTADA:</Text>
										<Text fontWeight="bold" fontSize="lg">
											{parseFloat(String(productToShow.comprimento)) + 5} x {parseFloat(String(productToShow.largura)) + 5} x 20cm (alt.)
										</Text>
									</Box>

									<Divider borderColor="gray.700" />

									<Box>
										<Text color="gray.400" fontSize="xs" fontWeight="bold" mb={2}>Medidas externas da caixa MONTADA:</Text>
										<Text fontWeight="bold" fontSize="lg">
											{parseFloat(String(productToShow.comprimento)) + 5} x {parseFloat(String(productToShow.largura)) + 5} x {parseFloat(String(productToShow.altura)) + 15}cm (alt.)
										</Text>
									</Box>

									<Divider borderColor="gray.700" />

									<Box>
										<Text color="gray.400" fontSize="xs" fontWeight="bold" mb={2}>Peso da embalagem:</Text>
										<Text fontWeight="bold" fontSize="lg">
											{productToShow.pesoCx}kg
										</Text>
									</Box>
								</VStack>
							)}
						</ModalBody>
						<ModalFooter borderTop="1px" borderColor="gray.700">
							<Button colorScheme="blue" onClick={onDetailsClose}>Fechar</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>

				{/* Confirmação de Exclusão */}
				<AlertDialog
					isOpen={isDeleteOpen}
					leastDestructiveRef={cancelRef}
					onClose={onDeleteClose}
				>
					<AlertDialogOverlay>
						<AlertDialogContent bg="gray.800" color="white">
							<AlertDialogHeader fontSize="lg" fontWeight="bold">
								Excluir Produto
							</AlertDialogHeader>

							<AlertDialogBody>
								Tem certeza que deseja excluir o produto <strong>{productToDelete?.nomeProd}</strong>?
							</AlertDialogBody>

							<AlertDialogFooter>
								<Button ref={cancelRef} onClick={onDeleteClose} variant="ghost" colorScheme="whiteAlpha">
									Cancelar
								</Button>
								<Button colorScheme="red" onClick={handleDeleteProduct} ml={3} isLoading={isDeleting}>
									Excluir
								</Button>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialogOverlay>
				</AlertDialog>

				{effectiveProposta && (
					<Box
						position="fixed"
						bottom="20px"
						right={{ base: "auto", md: "20px" }}
						left={{ base: "50%", md: "auto" }}
						transform={{ base: "translateX(-50%)", md: "none" }}
						zIndex={100}
					>
						<Button
							colorScheme="blue"
							size="lg"
							leftIcon={<FaSave />}
							boxShadow="2xl"
							onClick={handleSaveProposalItems}
							borderRadius="full"
							px={8}
							isDisabled={isLoadingProducts}
							_hover={{ transform: 'scale(1.05)', bg: 'blue.600' }}
							_active={{ transform: 'scale(0.95)' }}
							transition="0.2s"
						>
							Finalizar Seleção ({selectedItems.length})
						</Button>
					</Box>
				)}
			</Box>
		</Box>
	)
}

export default Produtos
