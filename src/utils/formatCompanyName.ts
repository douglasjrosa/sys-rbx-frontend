const MAX_COMPANY_NAME_LENGTH = 15

export const formatCompanyDisplayName = (
	name: string | undefined | null
): string => {
	if (!name) return ''
	const upper = name.toUpperCase()
	return upper.length > MAX_COMPANY_NAME_LENGTH
		? `${upper.slice(0, MAX_COMPANY_NAME_LENGTH)}...`
		: upper
}
