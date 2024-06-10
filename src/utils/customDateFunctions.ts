export const customDateIso = ( daysToAdd = 0 ): string => {
	const customDate = new Date()
	customDate.setDate( customDate.getDate() + daysToAdd )
	const year = customDate.getFullYear()
	const month = String( customDate.getMonth() + 1 ).padStart( 2, '0' )
	const day = String( customDate.getDate() ).padStart( 2, '0' )

	return `${ year }-${ month }-${ day }`
}

export const customDateTimeIso = (): string => {
	const customTime = new Date()
	const date = customTime.toISOString()
	return date
}

export const customTimeIso = (): string => {
	const customTime = new Date()
	const customDate =
		customTime.getHours() +
		':' +
		customTime.getMinutes() +
		':' +
		customTime.getSeconds()
	return customDate
}
