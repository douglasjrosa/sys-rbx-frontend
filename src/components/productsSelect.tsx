import { Box, FormLabel, InputProps, Select, Skeleton } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"


interface ProductsSelectProps extends Omit<InputProps, 'onChange' | 'value'> {
	onChange?: ( event: React.ChangeEvent<HTMLSelectElement> ) => void
	value?: string
	cnpj: string
	email: string
}

const ProductsSelect: React.FC<ProductsSelectProps> = ( { onChange, value, cnpj, email } ) => {

	const handleChange = useCallback(
		( e: React.ChangeEvent<HTMLSelectElement> ) => onChange && onChange( e ), []
	)

	const [ enableFetches, setEnableFetches ] = useState<string>( "not yet allowed" )
	const [ productList, setProductList ] = useState<any[]>()

	const fetchProductsFromRbxApi = useCallback( async () => {
		const response = await fetch( `/api/rbx/${ email }/produtos?CNPJ=${ cnpj }` )
		const products = await response.json()

		setProductList( products )

	}, [] )



	useEffect( () => {
		if ( enableFetches === "not yet allowed" ) setEnableFetches( "allow" )
		if ( enableFetches === "allow" ) {
			fetchProductsFromRbxApi()
			setEnableFetches( "disallow" )
		}
	}, [ enableFetches ] )

	return (
		<Box>
			<FormLabel
				fontSize="xs"
				fontWeight="md"
			>
				Emitente
			</FormLabel>
			{
				!!productList &&
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