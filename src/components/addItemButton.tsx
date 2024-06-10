import { CircularProgress, IconButton, InputProps, useToast } from "@chakra-ui/react"
import { Dispatch, SetStateAction, useCallback } from "react"
import { MdOutlineAddCircleOutline } from "react-icons/md"

interface AddItemButtonProps extends Omit<InputProps, 'onClick'> {
	currentProductSelected: string
	user: any
	itemsList: any[]
	setItemsListOnClick: Dispatch<SetStateAction<any[]>>
	loading: boolean
	setLoading: Dispatch<SetStateAction<boolean>>
}

const AddItemButton: React.FC<AddItemButtonProps> = ( {
	currentProductSelected,
	user,
	itemsList,
	setItemsListOnClick,
	loading,
	setLoading
} ) => {

	const toast = useToast()

	const handleAddItem = useCallback( async () => {
		if ( !currentProductSelected ) return toast( {
			title: "Oooopss...",
			description: 'Selecione um produto.',
			status: "warning",
			duration: 2000,
			isClosable: true,
		} )

		setLoading( true )

		const response = await fetch( `/api/rbx/${ user.email }/produtos?prodId=${ currentProductSelected }` )
		const product = await response.json()

		const item = {
			id: itemsList.length + 1,
			nomeProd: `${ product.nomeProd } | ref: rbx-${ product.prodId }`,
			Qtd: "1",
			ncm: product.ncm,
			codg: product.prodId,
			comprimento: product.comprimento,
			largura: product.largura,
			altura: product.altura,
			expo: false,
			mont: false,
			ativo: "1",
			preco: product.preco,
			total: product.vFinal,
			codigo: product.codigo,
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

		const newList = [ ...itemsList, item ]

		setItemsListOnClick( newList )
		
		setLoading( false )

	}, [ currentProductSelected, itemsList ] )

	return (
		<IconButton
			aria-label="Add Item"
			rounded={ 'lg' }
			colorScheme="whatsapp"
			mt={ '1rem' }
			me={ '3rem' }
			onClick={ handleAddItem }
			isDisabled={ loading }
		>
			<>
				{ loading && <CircularProgress
					color="green.500"
					isIndeterminate
					thickness={ "8px" }
					size={ "30px" }
				/> }
				{ !loading && <MdOutlineAddCircleOutline color="#ffff" size={ '2rem' } /> }
			</>
		</IconButton>
	)
}
export default AddItemButton