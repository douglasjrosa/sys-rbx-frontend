import { Box, Button, Flex, InputProps, Select, Skeleton, useToast } from "@chakra-ui/react"
import { useCallback, useEffect, useState, useRef } from "react"


interface ProductsSelectProps extends Omit<InputProps, 'onChange' | 'value'> {
	onChange?: ( event: React.ChangeEvent<HTMLSelectElement> ) => void
	value?: string
	cnpj: string
	email: string
}

const ProductsSelect: React.FC<ProductsSelectProps> = ( { onChange, cnpj, email } ) => {
	const toast = useToast()
	const initialFetchDone = useRef( false )

	const handleChange = useCallback(
		( e: React.ChangeEvent<HTMLSelectElement> ) => onChange && onChange( e ), [ onChange ]
	)

	const [ productList, setProductList ] = useState<any[]>()
	const [ offset, setOffset ] = useState<number>( 0 )
	const [ nextOffsetExists, setNextOffsetExists ] = useState<boolean>( false )
	const [ isLoading, setIsLoading ] = useState<boolean>( false )
	const LIMIT = 10

	const fetchProductsFromRbxApi = useCallback( async () => {
		if ( !cnpj || !email ) return

		setIsLoading( true )
		try {
			const response = await fetch( `/api/rbx/${ email }/produtos?CNPJ=${ cnpj }&limit=${ LIMIT + 1 }&offset=${ offset }` )
			if ( response.ok ) {
				const products = await response.json()
				setNextOffsetExists( products.length > LIMIT )
				const productList = products.slice( 0, LIMIT )
				setProductList( productList )
			}
			else {
				console.error( "Error fetching products from RBX API", { response } )
				const responeData = await response.json()
				console.error( { responeData } )
				toast( {
					title: "Erro ao buscar produtos",
					description: "Por favor, tente novamente.",
					status: "error",
					duration: 3000,
					isClosable: true,
				} )
			}
		}
		catch ( error ) {
			console.error( "Error fetching products:", error )
			toast( {
				title: "Erro ao buscar produtos",
				description: "Por favor, tente novamente.",
				status: "error",
				duration: 3000,
				isClosable: true,
			} )
		}
		finally {
			setIsLoading( false )
		}
	}, [ offset, cnpj, email, toast ] )

	// Único useEffect para controlar a busca de produtos
	useEffect( () => {
		if ( !initialFetchDone.current ) {
			fetchProductsFromRbxApi()
			initialFetchDone.current = true
		}
		else if ( offset !== 0 ) {
			// Só busca novamente quando o offset mudar (paginação)
			fetchProductsFromRbxApi()
		}
	}, [ fetchProductsFromRbxApi, offset ] )

	return (
		<Box>
			<Flex
				fontSize="xs"
				fontWeight="md"
				justifyContent="space-between"
			>
				<Flex
					justifyContent="space-between"
					w="full"
					mb={ 2 }
				>
					<span>Lista de produtos</span>
					<Flex>
						<Button
							roundedLeft="md"
							roundedRight="0"
							h="20px"
							size="xs"
							onClick={ () => setOffset( offset - LIMIT ) }
							isDisabled={ offset === 0 || isLoading }
						>
							-
						</Button>
						<Flex
							fontSize="xs"
							fontWeight="md"
							bg="gray.700"
							textAlign="center"
							alignItems="center"
							justifyContent="center"
							w="40px"
							h="20px"
							color={ offset === 0 && !nextOffsetExists && !isLoading ? "gray.400" : "white" }
						>
							{ Math.floor( offset / LIMIT ) + 1 }
						</Flex>
						<Button
							roundedLeft="0"
							roundedRight="md"
							h="20px"
							size="xs"
							onClick={ () => setOffset( offset + LIMIT ) }
							isDisabled={ !nextOffsetExists || isLoading }
						>
							+
						</Button>
					</Flex>
				</Flex>
			</Flex>
			{
				!!productList && !isLoading &&
				<Select
					shadow="sm"
					size="sm"
					w="100%"
					fontSize="sm"
					rounded="md"
					onChange={ handleChange }
				>
					<option
						key={ `prodList0` }
						style={ { backgroundColor: "#1A202C" } }
						value=""
					>Selecione um produto</option>
					{ productList.map( ( currentProduct: any, key ) => {
						const formatCurrencyValue = ( value: number | string | undefined ) => {
							if ( !value ) return ''
							let num: number
							if ( typeof value === 'string' ) {
								// Try to parse as formatted currency (e.g., "R$ 1.234,56" or "1234.56")
								const cleaned = value.replace( /[^\d,.-]/g, '' ).replace( '.', '' ).replace( ',', '.' )
								num = parseFloat( cleaned ) || 0
							} else {
								num = value
							}
							if ( isNaN( num ) || num === 0 ) return ''
							return new Intl.NumberFormat( 'pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 } ).format( num )
						}
						
						const formatDimensions = ( comp: number | undefined, larg: number | undefined, alt: number | undefined ) => {
							if ( !comp || !larg || !alt ) return ''
							return `${ comp }x${ larg }x${ alt }cm`
						}
						
						const productInfo = []
						if ( currentProduct.nomeProd ) productInfo.push( currentProduct.nomeProd )
						const codigo = currentProduct.codigo || ( currentProduct.prodId ? `rbx-${ currentProduct.prodId }` : '' )
						if ( codigo ) productInfo.push( codigo )
						if ( currentProduct.titulo ) productInfo.push( currentProduct.titulo )
						const dims = formatDimensions( currentProduct.comprimento, currentProduct.largura, currentProduct.altura )
						if ( dims ) productInfo.push( dims )
						const price = formatCurrencyValue( currentProduct.vFinal || currentProduct.preco )
						if ( price ) productInfo.push( price )
						
						return (
							<option
								key={ `prodList${ key }` }
								style={ { backgroundColor: "#1A202C" } }
								value={ currentProduct.prodId }
							>
								{ productInfo.join( ' | ' ) }
							</option>
						)
					} ) }
				</Select>
				||
				<Skeleton height='30px' startColor='gray.600' endColor='gray.700' rounded={ "md" } w="100%" />
			}
		</Box>
	)
}
export default ProductsSelect