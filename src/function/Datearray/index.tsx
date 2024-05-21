import axios from "axios"

export const getAllDaysOfMonth = async ( month?: number, year?: number ) => {
	const currentYear = year || new Date().getFullYear()
	const currentMonth = month ? month - 1 : new Date().getMonth()
	const firstDay = new Date( currentYear, currentMonth, 1 )
	const lastDay = new Date( currentYear, currentMonth + 1, 0 )
	const days: { id: number, date: string }[] = []
	let currentDate = new Date( firstDay )

	while ( currentDate <= lastDay ) {
		const formattedDate = currentDate.toISOString().slice( 0, 10 )
		const dayObj = { id: currentDate.getDate(), date: formattedDate }
		days.push( dayObj )
		currentDate.setDate( currentDate.getDate() + 1 )
	}


	const obterFeriados = async () => {
		try {
			const response = await axios.get( '/api/db/business/get/calendar/feriado' )
			const valor = response.data
			const resultado = valor.map( ( i: any ) => i.attributes.date )
			return resultado
		} catch ( error ) {
			console.error( error )
			return []
		}
	}


	const feriados = await obterFeriados()


	const diasDaSemana = days.filter( ( day ) => {
		const isFeriado = feriados.includes( day.date )
		const diaDaSemana = new Date( day.date ).getUTCDay()
		return !isFeriado && diaDaSemana !== 0 && diaDaSemana !== 6
	} )

	const retorno = {
		DataInicio: firstDay.toISOString(),
		DataFim: lastDay.toISOString(),
		Dias: diasDaSemana
	}

	return retorno
}
