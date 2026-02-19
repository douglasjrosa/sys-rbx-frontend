const CURRENT_MONTH_ID = 13

export const generateCurrentAndPast12Months = () => {
	const currentDate = new Date()
	const currentMonth = currentDate.getMonth()
	const currentYear = currentDate.getFullYear()
	const months = []

	const startOfMonth = new Date( currentYear, currentMonth, 1 )
	const endOfMonth = new Date( currentYear, currentMonth + 1, 0 )
	const currentMonthName = startOfMonth.toLocaleString( 'pt-BR', { month: 'long' } )
	months.push( {
		id: CURRENT_MONTH_ID,
		name: `${ currentMonthName } de ${ currentYear }`,
		month: currentMonth + 1,
		year: currentYear,
		start: startOfMonth.toISOString(),
		end: endOfMonth.toISOString(),
	} )

	for ( let i = 1; i <= 12; i++ ) {
		const monthDate = new Date( currentYear, currentMonth - i, 1 )
		const start = new Date( monthDate.getFullYear(), monthDate.getMonth(), 1 )
		const end = new Date( monthDate.getFullYear(), monthDate.getMonth() + 1, 0 )
		const monthName = start.toLocaleString( 'pt-BR', { month: 'long' } )
		months.push( {
			id: CURRENT_MONTH_ID - i,
			name: `${ monthName } de ${ monthDate.getFullYear() }`,
			month: monthDate.getMonth() + 1,
			year: monthDate.getFullYear(),
			start: start.toISOString(),
			end: end.toISOString(),
		} )
	}

	return months
}

export const generatePastAndFutureMonths = () => {
	const currentDate = new Date()
	const currentMonth = currentDate.getMonth()
	const currentYear = currentDate.getFullYear()
	const months = []

	const startOfMonth = new Date( currentYear, currentMonth, 1 )
	const endOfMonth = new Date( currentYear, currentMonth + 1, 0 )
	const currentMonthName = startOfMonth.toLocaleString( 'pt-BR', { month: 'long' } )
	months.push( { id: 13, name: `${ currentMonthName } de ${ currentYear }`, month: currentMonth + 1, year: currentYear, start: startOfMonth.toISOString(), end: endOfMonth.toISOString() } )

	for ( let i = 1; i <= 12; i++ ) {
		const monthDate = new Date( currentYear, currentMonth - i, 1 )
		const startOfMonth = new Date( monthDate.getFullYear(), monthDate.getMonth(), 1 )
		const endOfMonth = new Date( monthDate.getFullYear(), monthDate.getMonth() + 1, 0 )
		const monthName = startOfMonth.toLocaleString( 'pt-BR', { month: 'long' } )
		months.unshift( { id: 13 - i, name: `${ monthName } de ${ monthDate.getFullYear() }`, month: monthDate.getMonth() + 1, year: monthDate.getFullYear(), start: startOfMonth.toISOString(), end: endOfMonth.toISOString() } )
	}

	for ( let i = 1; i <= 12; i++ ) {
		const monthDate = new Date( currentYear, currentMonth + i, 1 )
		const startOfMonth = new Date( monthDate.getFullYear(), monthDate.getMonth(), 1 )
		const endOfMonth = new Date( monthDate.getFullYear(), monthDate.getMonth() + 1, 0 )
		const monthName = startOfMonth.toLocaleString( 'pt-BR', { month: 'long' } )
		months.push( { id: 13 + i, name: `${ monthName } de ${ monthDate.getFullYear() }`, month: monthDate.getMonth() + 1, year: monthDate.getFullYear(), start: startOfMonth.toISOString(), end: endOfMonth.toISOString() } )
	}

	return months
}
