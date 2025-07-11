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
				console.log( { products } )
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
					{ productList.map( ( currentProduct: any, key ) => (
						<option
							key={ `prodList${ key }` }
							style={ { backgroundColor: "#1A202C" } }
							value={ currentProduct.prodId }
						>
							{ currentProduct.nomeProd }
						</option>
					) ) }
				</Select>
				||
				<Skeleton height='30px' startColor='gray.600' endColor='gray.700' rounded={ "md" } w="100%" />
			}
		</Box>
	)
}
export default ProductsSelect