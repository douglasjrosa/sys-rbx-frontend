export interface DiscountRates {
	wholesale: number
	anticipation: number
	recurrence: number
	fobFreight: number
	paymentOnOrder: number
	fullVucLoad: number
	fullThreeQuarterLoad: number
	straightTruckFullLoad: number
}

export interface MarginTable {
	id: number
	name: string
	profitMargin: number
	discounts: DiscountRates
}

export const marginTables: MarginTable[] = [
	{
		id: 1,
		name: 'Counter',
		profitMargin: 0.35,
		discounts: {
			wholesale: 0.03,
			anticipation: 0.03,
			recurrence: 0.03,
			fobFreight: 0.03,
			paymentOnOrder: 0.05,
			fullVucLoad: 0.07,
			fullThreeQuarterLoad: 0.10,
			straightTruckFullLoad: 0.13,
		},
	},
	{
		id: 2,
		name: 'Vip',
		profitMargin: 0.30,
		discounts: {
			wholesale: 0.03,
			anticipation: 0.03,
			recurrence: 0.03,
			fobFreight: 0.03,
			paymentOnOrder: 0.05,
			fullVucLoad: 0.05,
			fullThreeQuarterLoad: 0.06,
			straightTruckFullLoad: 0.07,
		},
	},
	{
		id: 3,
		name: 'Bronze',
		profitMargin: 0.26,
		discounts: {
			wholesale: 0.02,
			anticipation: 0.02,
			recurrence: 0.02,
			fobFreight: 0.02,
			paymentOnOrder: 0.04,
			fullVucLoad: 0.04,
			fullThreeQuarterLoad: 0.05,
			straightTruckFullLoad: 0.06,
		},
	},
	{
		id: 4,
		name: 'Silver',
		profitMargin: 0.22,
		discounts: {
			wholesale: 0.02,
			anticipation: 0.02,
			recurrence: 0.02,
			fobFreight: 0,
			paymentOnOrder: 0.02,
			fullVucLoad: 0.03,
			fullThreeQuarterLoad: 0.04,
			straightTruckFullLoad: 0.05,
		},
	},
	{
		id: 5,
		name: 'Gold',
		profitMargin: 0.18,
		discounts: {
			wholesale: 0.02,
			anticipation: 0,
			recurrence: 0,
			fobFreight: 0,
			paymentOnOrder: 0.02,
			fullVucLoad: 0.02,
			fullThreeQuarterLoad: 0.03,
			straightTruckFullLoad: 0.04,
		},
	},
	{
		id: 6,
		name: 'Platinum',
		profitMargin: 0.15,
		discounts: {
			wholesale: 0,
			anticipation: 0,
			recurrence: 0,
			fobFreight: 0,
			paymentOnOrder: 0.02,
			fullVucLoad: 0,
			fullThreeQuarterLoad: 0,
			straightTruckFullLoad: 0.02,
		},
	},
	{
		id: 7,
		name: 'Strategic',
		profitMargin: 0.12,
		discounts: {
			wholesale: 0,
			anticipation: 0,
			recurrence: 0,
			fobFreight: 0,
			paymentOnOrder: 0,
			fullVucLoad: 0,
			fullThreeQuarterLoad: 0,
			straightTruckFullLoad: 0,
		},
	},
]

export const discounts = [
	{
		id: 0,
		key: 'wholesale',
		name: 'Quantity',
		description: 'Discount for quantity above 10 units per item.',
		criteria: 'The order item must have a quantity above 10',
		rule: 'Discount to be applied cumulatively only on order items with quantity above 10',
	},
	{
		id: 1,
		key: 'anticipation',
		name: 'Anticipation',
		description: 'Discount for order anticipation with at least 10 days notice.',
		criteria: 'The order delivery date must be at least 10 days after the current date',
		rule: 'Discount to be applied cumulatively to the order total.',
	},
	{
		id: 2,
		key: 'recurrence',
		name: 'Recurrence',
		description: 'Discount for order recurrence.',
		criteria: 'The order must be repeated at least 3 times',
		rule: 'Discount to be applied cumulatively to the order total.',
	},
	{
		id: 3,
		key: 'fobFreight',
		name: 'FOB Freight',
		description: 'Discount for FOB freight.',
		criteria: 'The order must be transported via FOB',
		rule: 'Discount to be applied cumulatively to the order total.',
	},
	{
		id: 4,
		key: 'paymentOnOrder',
		name: 'Payment on Order',
		description: 'Discount for payment on order.',
		criteria: 'The order must be paid on the same day',
		rule: 'Discount to be applied cumulatively to the order total.',
	},
	{
		id: 5,
		key: 'fullVucLoad',
		name: 'Wholesale VUC',
		description: 'Discount for full Vuc Load.',
		criteria: 'The order must be for wholesale VUC',
		rule: 'Discount to be applied cumulatively to the order total.',
	},
	{
		id: 6,
		key: 'fullThreeQuarterLoad',
		name: 'Wholesale 3/4',
		description: 'Discount for full Three Quarter Load.',
		criteria: 'The order must be for wholesale 3/4',
		rule: 'Discount to be applied cumulatively to the order total.',
	},
	{
		id: 7,
		key: 'straightTruckFullLoad',
		name: 'Wholesale Truck',
		description: 'Discount for straight Truck Full Load.',
		criteria: 'The order must be for wholesale Truck',
		rule: 'Discount to be applied cumulatively to the order total.',
	},
]
