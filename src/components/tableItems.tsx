import { Button, Checkbox, Icon, Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"
import { Dispatch, SetStateAction } from "react"
import { BsTrash } from "react-icons/bs"

interface TableItemsProps {
	itemsList: any[]
	setItemsListOnChange: Dispatch<SetStateAction<any[]>>
}

const TableItems: React.FC<TableItemsProps> = ( { itemsList, setItemsListOnChange } ) => {

	const handleItemChange = ( args: { index: number, qtde?: number, mont?: boolean, expo?: boolean, deleteItem?: boolean } ) => {
		const { index, qtde, mont, expo, deleteItem } = args

		// Primeiro, mapeamos os itens para atualizar ou marcar para deletar
		const updatedList = itemsList.map( ( item, i ) => {
			if ( i === index ) {
				if ( deleteItem ) return null

				const validQtde = qtde !== undefined ? qtde : item.Qtd
				const validMont = mont !== undefined ? mont : item.mont
				const validExp = expo !== undefined ? expo : item.expo
				let price = Number( item.vFinal.replace( /\D/g, '' ) / 100 )
				const aditionalService = Math.round( price * 10 ) / 100

				price += validMont ? aditionalService : 0
				price += validExp ? aditionalService : 0

				const total = ( price * validQtde ).toLocaleString( 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 } )

				return {
					...item,
					Qtd: validQtde,
					mont: validMont,
					expo: validExp,
					total
				}
			}
			return item
		} )

		const newList = updatedList.filter( item => item !== null )

		setItemsListOnChange( newList )
	}


	return (
		<TableContainer>
			<Table variant='simple'>
				<Thead>
					<Tr bg={ '#ffffff12' }>
						<Th px='0' w={ "1.3rem" }></Th>
						<Th px='0' w={ "8rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>Itens</Th>
						<Th px='0' w={ "5rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Código
						</Th>
						<Th px='0' w={ "3rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Qtd
						</Th>
						<Th px='0' w={ "5rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Medidas Internas
						</Th>
						<Th px='0' w={ "3rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Mont.
						</Th>
						<Th px='0' w={ "3rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Expo.
						</Th>
						<Th px='0' w={ "6rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Preço un
						</Th>
						<Th px='0' w={ "6rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Preço total
						</Th>
						<Th px='0' textAlign={ "center" } w={ "5rem" }>
							<Icon as={ BsTrash } boxSize={ 4 } color='white' />
						</Th>
					</Tr>
				</Thead>
				<Tbody>
					{ itemsList && !!itemsList.length && itemsList.map( ( item, key ) => {

						return (
							<Tr key={ `item-${ key }` } >
								<Td textAlign="center" fontSize="xs" >{ key + 1 }</Td>
								<Td
									textAlign="center"
									fontSize="xs"
									whiteSpace="normal"
									wordBreak="break-word"
									w={ "14rem" } 
								>{ item.nomeProd }</Td>
								<Td textAlign="center" fontSize="xs" >{ item.codigo }</Td>
								<Td>
									<Input
										type="number"
										value={ Number( item.Qtd ) }
										onChange={ e => {
											handleItemChange( {
												index: key,
												qtde: Number( e.target.value )
											} )
										} }
										textAlign="center"
										fontSize="xs"
										size="xs"
										w={ 14 }
										rounded="md"
									/>
								</Td>
								<Td textAlign="center" fontSize="xs" >
									{ !item.comprimento ? '' : `${ item.comprimento } x ${ item.largura } x ${ item.altura }cm(alt.)` }
								</Td>
								<Td>
									<Checkbox
										borderColor="whatsapp.600"
										rounded="md"
										px="3"
										onChange={ e => {
											handleItemChange( {
												index: key,
												mont: e.target.checked
											} )
										} }
										isChecked={ item.mont } />
								</Td>
								<Td>
									<Checkbox
										borderColor="whatsapp.600"
										rounded="md"
										px="3"
										onChange={ e => {
											handleItemChange( {
												index: key,
												expo: e.target.checked
											} )
										} }
										isChecked={ item.expo } />
								</Td>
								<Td textAlign="center" fontSize="xs" >{ item.vFinal }</Td>
								<Td textAlign="center" fontSize="xs" >{ item.total }</Td>
								<Td textAlign="center" fontSize="xs" >
									<Button
										bg="transparent"
										color="red.500"
										rounded="full"
										width="50px"
										height="50px"
										_hover={ {
											bg: "red.500",
											color: "white",
										} }
										_active={ {
											bg: "red.600",
											color: "white",
										} }
										_focus={ { boxShadow: "none" } }
										onClick={ () => handleItemChange( {
											index: key,
											deleteItem: true
										} ) }
									>
										<Icon as={ BsTrash } boxSize={ 4 } />
									</Button>
								</Td>
							</Tr>
						)
					} ) }
				</Tbody>
			</Table>
		</TableContainer>
	)
}
export default TableItems