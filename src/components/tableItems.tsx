import { Badge, Box, Button, Checkbox, Icon, Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr, VStack, HStack } from "@chakra-ui/react"
import React, { Dispatch, SetStateAction } from "react"
import { BsX } from "react-icons/bs"
import { formatCurrency, parseCurrency } from "@/utils/customNumberFormats"
import { getTableBadgeColor, getTableNameInPortuguese } from "@/utils/tableUtils"

interface TableItemsProps {
	itemsList: any[]
	setItemsListOnChange: Dispatch<SetStateAction<any[]>>
	companyTablecalc?: string | number
}

const TableItems: React.FC<TableItemsProps> = ( { itemsList, setItemsListOnChange, companyTablecalc } ) => {

	const MIN_QTD = 1

	const handleItemChange = ( args: { index: number, qtde?: number, mont?: boolean, expo?: boolean, deleteItem?: boolean } ) => {
		const { index, qtde, mont, expo, deleteItem } = args

		// Primeiro, mapeamos os itens para atualizar ou marcar para deletar
		const updatedList = itemsList.map( ( item, i ) => {
			if ( i === index ) {
				if ( deleteItem ) return null

				const rawQtde = qtde !== undefined ? qtde : item.Qtd
				const validQtde = Math.max( MIN_QTD, Number( rawQtde ) || MIN_QTD )
				const validMont = mont !== undefined ? mont : item.mont
				const validExp = expo !== undefined ? expo : item.expo
				let price = parseCurrency( item.vFinal )
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

	const getInternalMeasurements = ( item: any ): string | null => {
		if ( !item.comprimento ) return null
		return `${ item.comprimento } x ${ item.largura } x ${ item.altura }cm(alt.)`
	}

	return (
		<TableContainer>
			<Table variant='simple'>
				<Thead>
					<Tr bg={ '#ffffff12' }>
						<Th px='0' w={ "1.3rem" }></Th>
						<Th px='0' minW={ "20rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>Item</Th>
						<Th px='0' w={ "6rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Preço un
						</Th>
						<Th px='0' w={ "6rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							SERVIÇOS
						</Th>
						<Th px='0' w={ "3rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Qtd
						</Th>
						<Th px='0' w={ "6rem" } color='white' textAlign={ 'center' } fontSize={ '0.7rem' }>
							Preço total
						</Th>
					</Tr>
				</Thead>
				<Tbody>
					{ itemsList && !!itemsList.length && itemsList.map( ( item, key ) => {
						const internalMeasurements = getInternalMeasurements( item )

						return (
							<Tr key={ `item-${ key }` } >
								<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={5}>
									<Button
										bg="transparent"
										color="red.500"
										border="1px solid"
										borderColor="red.500"
										rounded="md"
										width="24px"
										height="24px"
										minW="24px"
										p={ 0 }
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
										<Icon as={ BsX } boxSize={ 4 } />
									</Button>
								</Td>
								<Td
									px={ 3 }
									py={ 5 }
									fontSize="xs"
									whiteSpace="normal"
									wordBreak="break-word"
									minW={ "20rem" }
								>
									<VStack align="start" spacing={ 2 }>
										<Box fontWeight="bold" fontSize="sm">{ item.nomeProd }</Box>
										{ ( internalMeasurements || item.codigo ) && (
											<Box display="flex" flexWrap="wrap" gap={ 2 }>
												{ internalMeasurements && (
													<Badge bg="yellow.400" color="black" fontSize="2xs" px={ 1.5 } py={ 0.5 }>
														{ internalMeasurements }
													</Badge>
												) }
												{ item.codigo && (
													<HStack spacing={2}>
														<Badge colorScheme="gray" fontSize="2xs" px={ 1.5 } py={ 0.5 }>
															{ item.codigo }
														</Badge>
														{ ( companyTablecalc || item.tabela ) !== undefined && (
															<Badge
																fontSize="2xs"
																px={ 1.5 }
																py={ 0.5 }
																colorScheme={ getTableBadgeColor( getTableNameInPortuguese( companyTablecalc || item.tabela ) ) }
																color={ getTableBadgeColor( getTableNameInPortuguese( companyTablecalc || item.tabela ) ) === 'yellow' ? 'black' : undefined }
																variant="solid"
															>
																{ getTableNameInPortuguese( companyTablecalc || item.tabela ) }
															</Badge>
														) }
													</HStack>
												) }
											</Box>
										) }
									</VStack>
								</Td>
								<Td textAlign="center" fontSize="xs" verticalAlign="middle" position="relative" pb={10} py={5}>
									{ formatCurrency( item.vFinal ) }
									<HStack
										position="absolute"
										bottom={1}
										left={0}
										right={0}
										justifyContent="center"
										spacing={2}
									>
										<Checkbox
											borderColor="whatsapp.600"
											rounded="md"
											size="sm"
											onChange={ e => {
												handleItemChange( {
													index: key,
													mont: e.target.checked
												} )
											} }
											isChecked={ item.mont }
										>
											<Box
												as="span"
												fontSize="2xs"
												onClick={ ( e: React.MouseEvent ) => {
													e.preventDefault()
													e.stopPropagation()
													handleItemChange( {
														index: key,
														mont: !item.mont
													} )
												} }
												cursor="pointer"
												userSelect="none"
											>
												Mont.
											</Box>
										</Checkbox>
										<Checkbox
											borderColor="whatsapp.600"
											rounded="md"
											size="sm"
											onChange={ e => {
												handleItemChange( {
													index: key,
													expo: e.target.checked
												} )
											} }
											isChecked={ item.expo }
										>
											<Box
												as="span"
												fontSize="2xs"
												onClick={ ( e: React.MouseEvent ) => {
													e.preventDefault()
													e.stopPropagation()
													handleItemChange( {
														index: key,
														expo: !item.expo
													} )
												} }
												cursor="pointer"
												userSelect="none"
											>
												Expo.
											</Box>
										</Checkbox>
									</HStack>
								</Td>
								<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={5}>
									{ ( () => {
										const unitPrice = parseCurrency( item.vFinal )
										let servicesValue = 0
										if ( item.mont ) servicesValue += unitPrice * 0.1
										if ( item.expo ) servicesValue += unitPrice * 0.1
										return formatCurrency( servicesValue )
									} )() }
								</Td>
								<Td textAlign="center" verticalAlign="middle" py={5}>
									<Input
										type="number"
										min={ MIN_QTD }
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
								<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={5}>{ formatCurrency( item.total ) }</Td>
							</Tr>
						)
					} ) }
				</Tbody>
			</Table>
		</TableContainer>
	)
}
export default TableItems
