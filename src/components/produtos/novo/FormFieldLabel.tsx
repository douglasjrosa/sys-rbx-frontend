import { FormLabel, Text, type FormLabelProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type FormFieldLabelProps = FormLabelProps & {
	children: ReactNode
	optional?: boolean
}

export function FormFieldLabel( {
	children,
	optional,
	...labelProps
}: FormFieldLabelProps ) {
	return (
		<FormLabel fontSize="sm" mb={ 1 } { ...labelProps }>
			{ children }
			{ optional && (
				<Text as="span" color="gray.400" fontWeight="normal">
					{ ' ' }(opcional)
				</Text>
			) }
		</FormLabel>
	)
}
