import {
	Box,
	Button,
	Flex,
	Heading,
	Progress,
	Stack,
	Table,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
	useToast,
} from "@chakra-ui/react"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import type { MigrationBatchResult } from "@/pages/api/db/empresas/migrate-emitente/lib/emitenteMigration"

interface MigrationBatch {
	index: number
	label: string
	range: string
	empresaIds: number[]
}

interface MigrationOverview {
	totalPending: number
	batchSize: number
	batches: MigrationBatch[]
}

type BatchState = "idle" | "running" | "done" | "error"

export const getServerSideProps: GetServerSideProps = async ( context ) => {
	const session = await getServerSession(
		context.req,
		context.res,
		authOptions as any
	)
	const intendedUrl = "/tools/migrate-empresa-emitente"

	if ( !session?.user ) {
		return {
			redirect: {
				destination: `/auth/signin?callbackUrl=${ encodeURIComponent( intendedUrl ) }`,
				permanent: false,
			},
		}
	}

	if ( ( session.user as { pemission?: string } ).pemission !== "Adm" ) {
		return { redirect: { destination: "/", permanent: false } }
	}

	return { props: {} }
}

const statusLabel: Record<string, string> = {
	updated_from_business: "Atualizado (último negócio)",
	updated_from_main_account: "Atualizado (conta principal)",
	skipped_already_set: "Ignorado (já possui emitente)",
	error: "Erro",
}

export default function MigrateEmpresaEmitentePage () {
	const toast = useToast()
	const [ overview, setOverview ] = useState<MigrationOverview | null>( null )
	const [ loading, setLoading ] = useState( true )
	const [ batchStates, setBatchStates ] = useState<Record<number, BatchState>>( {} )
	const [ lastResult, setLastResult ] = useState<MigrationBatchResult | null>( null )
	const [ batchProgress, setBatchProgress ] = useState( "" )

	const fetchOverview = useCallback( async () => {
		setLoading( true )
		try {
			const res = await fetch( "/api/db/empresas/migrate-emitente" )
			const data = await res.json()
			if ( !res.ok ) {
				throw new Error( data?.message || "Failed to load migration overview" )
			}
			setOverview( data )
			setBatchStates( {} )
		} catch ( error: unknown ) {
			const message = error instanceof Error
				? error.message
				: "Erro desconhecido"
			toast( {
				title: "Erro ao carregar dados",
				description: message,
				status: "error",
				duration: 7000,
				isClosable: true,
			} )
		} finally {
			setLoading( false )
		}
	}, [ toast ] )

	useEffect( () => {
		fetchOverview()
	}, [ fetchOverview ] )

	const runBatch = async ( batch: MigrationBatch ) => {
		setBatchStates( ( prev ) => ( { ...prev, [ batch.index ]: "running" } ) )
		setLastResult( null )
		setBatchProgress( "" )

		const aggregated: MigrationBatchResult = {
			processed: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			results: [],
		}

		try {
			for ( let i = 0; i < batch.empresaIds.length; i += 1 ) {
				const empresaId = batch.empresaIds[ i ]
				setBatchProgress(
					`Processando ${ i + 1 } de ${ batch.empresaIds.length }...`
				)

				const res = await fetch( "/api/db/empresas/migrate-emitente", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify( { empresaIds: [ empresaId ] } ),
				} )
				const data = await res.json()

				if ( !res.ok ) {
					throw new Error( data?.message || "Migration failed" )
				}

				aggregated.processed += data.processed ?? 0
				aggregated.updated += data.updated ?? 0
				aggregated.skipped += data.skipped ?? 0
				aggregated.errors += data.errors ?? 0
				aggregated.results.push( ...( data.results ?? [] ) )
			}

			setLastResult( aggregated )
			setBatchStates( ( prev ) => ( { ...prev, [ batch.index ]: "done" } ) )
			setBatchProgress( "" )
			toast( {
				title: `Lote concluído: ${ aggregated.updated } atualizados`,
				status: aggregated.errors ? "warning" : "success",
				duration: 5000,
				isClosable: true,
			} )
			await fetchOverview()
		} catch ( error: unknown ) {
			setBatchStates( ( prev ) => ( { ...prev, [ batch.index ]: "error" } ) )
			setBatchProgress( "" )
			if ( aggregated.results.length ) {
				setLastResult( aggregated )
			}
			const message = error instanceof Error ? error.message : "Erro desconhecido"
			toast( {
				title: "Erro ao processar lote",
				description: message,
				status: "error",
				duration: 7000,
				isClosable: true,
			} )
		}
	}

	return (
		<Box m={ { base: 4, md: 10 } } p={ { base: 5, md: 10 } } bg="gray.700" rounded="xl">
			<Flex justify="space-between" align="center" mb={ 6 } wrap="wrap" gap={ 4 }>
				<Heading size="lg">Migração empresaEmitente (temporário)</Heading>
				<Link href="/bling" passHref legacyBehavior>
					<Button as="a" size="sm" variant="outline">
						Voltar para /bling
					</Button>
				</Link>
			</Flex>

			<Text mb={ 6 } color="gray.300" maxW="900px">
				Define empresaEmitente em clientes sem vínculo, usando o emitente do
				último negócio (updatedAt). Se o emitente não existir mais, usa a
				empresa com mainAccount na tabela Token. Cada lote processa as
				empresas uma a uma para evitar timeout do servidor.
			</Text>

			{ loading && <Text color="gray.400">Carregando...</Text> }

			{ !loading && overview && (
				<Stack spacing={ 6 }>
					<Box p={ 4 } bg="gray.800" rounded="lg">
						<Text fontWeight="bold">
							Clientes pendentes: { overview.totalPending }
						</Text>
						<Text fontSize="sm" color="gray.400">
							Lotes de { overview.batchSize } empresas
						</Text>
					</Box>

					{ overview.totalPending === 0 && (
						<Text color="green.300">
							Nenhum cliente pendente. Migração concluída.
						</Text>
					) }

					{ batchProgress && (
						<Box>
							<Text fontSize="sm" color="gray.300" mb={ 2 }>
								{ batchProgress }
							</Text>
							<Progress size="xs" isIndeterminate colorScheme="blue" />
						</Box>
					) }

					{ overview.batches.length > 0 && (
						<Flex wrap="wrap" gap={ 3 }>
							{ overview.batches.map( ( batch ) => {
								const state = batchStates[ batch.index ] ?? "idle"
								const isRunning = state === "running"
								const isDone = state === "done"
								const isAnyRunning = Object.values( batchStates ).includes(
									"running"
								)

								return (
									<Button
										key={ batch.index }
										colorScheme={ isDone ? "green" : "blue" }
										variant={ isDone ? "solid" : "outline" }
										isLoading={ isRunning }
										isDisabled={ isAnyRunning && !isRunning }
										onClick={ () => runBatch( batch ) }
									>
										{ batch.label } ({ batch.range })
									</Button>
								)
							} ) }
						</Flex>
					) }

					{ lastResult && (
						<Box p={ 4 } bg="gray.800" rounded="lg" overflowX="auto">
							<Text fontWeight="bold" mb={ 3 }>
								Último lote: { lastResult.updated } atualizados, { " " }
								{ lastResult.skipped } ignorados, { lastResult.errors } erros
							</Text>
							<Table size="sm" variant="simple">
								<Thead>
									<Tr>
										<Th color="gray.300">Empresa</Th>
										<Th color="gray.300">Status</Th>
										<Th color="gray.300">Emitente</Th>
										<Th color="gray.300">Negócio</Th>
									</Tr>
								</Thead>
								<Tbody>
									{ lastResult.results.map( ( item ) => (
										<Tr key={ item.empresaId }>
											<Td>{ item.nome }</Td>
											<Td>
												{ statusLabel[ item.status ] ?? item.status }
												{ item.message ? ` — ${ item.message }` : "" }
											</Td>
											<Td>{ item.emitenteLabel ?? item.emitenteId ?? "—" }</Td>
											<Td>{ item.businessId ?? "—" }</Td>
										</Tr>
									) ) }
								</Tbody>
							</Table>
						</Box>
					) }
				</Stack>
			) }
		</Box>
	)
}
