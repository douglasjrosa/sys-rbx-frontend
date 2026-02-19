import axios from "axios"

export const getAllDaysOfMonth = async ( month?: number, year?: number ) => {
	const currentYear = year || new Date().getFullYear()
	const currentMonth = month ? month - 1 : new Date().getMonth()
	const firstDay = new Date( currentYear, currentMonth, 1 )
	const lastDay = new Date( currentYear, currentMonth + 1, 0 )
	const days: { id: number, date: string }[] = []
	let currentDate = new Date( firstDay )

	while ( currentDate <= lastDay ) {
		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const day = String(currentDate.getDate()).padStart(2, '0');
		const formattedDate = `${year}-${month}-${day}`;
		
		const dayObj = { id: currentDate.getDate(), date: formattedDate }
		days.push( dayObj )
		currentDate.setDate( currentDate.getDate() + 1 )
	}


	const obterFeriados = async () => {
		try {
			// Add timestamp to avoid caching issues
			const response = await axios.get( `/api/db/business/get/calendar/feriado?t=${new Date().getTime()}` )
			const valor = response.data
			if (!Array.isArray(valor)) return []
			
			const resultado = valor
				.map((i: any) => {
					// Handle Strapi v4 nested structure and different possible date formats
					const dateStr = i?.attributes?.date || i?.date;
					if (!dateStr) return null;
					// Ensure we only have the YYYY-MM-DD part
					return dateStr.slice(0, 10);
				})
				.filter(Boolean);
				
			return resultado
		} catch ( error ) {
			console.error('Error in obterFeriados:', error )
			return []
		}
	}


	const feriados = await obterFeriados()


	const diasDaSemana = days.filter( ( day ) => {
		// Defensive comparison: trim and ensure both are strings
		const isFeriado = feriados.some(f => f && f.trim() === day.date.trim())
		
		const diaDaSemana = new Date( day.date + 'T00:00:00Z' ).getUTCDay()
		return !isFeriado && diaDaSemana !== 0 && diaDaSemana !== 6
	} )

	const retorno = {
		DataInicio: firstDay.toISOString(),
		DataFim: lastDay.toISOString(),
		Dias: diasDaSemana
	}

	return retorno
}
