/** Dark dropdown list — native option styling (Chakra gray.800). */
export const PRODUTO_SELECT_OPTION_BG = '#1A202C'
export const PRODUTO_SELECT_OPTION_COLOR = '#E2E8F0'

export const produtoInputStyles = {
	bg: 'gray.800',
	border: 'none',
	size: 'sm' as const,
	rounded: 'md',
}

export const produtoSelectStyles = {
	...produtoInputStyles,
	color: 'gray.100',
	sx: {
		option: {
			backgroundColor: PRODUTO_SELECT_OPTION_BG,
			color: PRODUTO_SELECT_OPTION_COLOR,
		},
	},
}

export const produtoSelectOptionProps = {
	style: {
		background: PRODUTO_SELECT_OPTION_BG,
		color: PRODUTO_SELECT_OPTION_COLOR,
	},
} as const
