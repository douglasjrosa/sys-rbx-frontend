export const tabelas = [
  {
    id: 1,
    name: 'Balcão',
    profitMargin: 0.35,
	},
	{
		id: 2,
		name: 'Vip',
		profitMargin: 0.30,
	},
	{
		id: 3,
		name: 'Bronze',
		profitMargin: 0.26,
		discounts: [
			{
				id: 1,
				name: 'Antecedência',
				description: 'Desconto por antecipação de pedido com 10 dias de antecedência.',
				rule: 'Desconto a ser aplicado cumulativamente no total do pedido.',
				discount: 0.03,
			},
		],
	},
	{
		id: 4,
		name: 'Prata',
		profitMargin: 0.22,
	},
	{
		id: 5,
		name: 'Ouro',
		profitMargin: 0.18,
	},
	{
		id: 6,
		name: 'Plátinum',
		profitMargin: 0.15,
	},
	{
		id: 7,
		name: 'Estratégica',
		profitMargin: 0.12,
	},
]