import { MarginTable, marginTables } from '@/components/data/marginTables'

/**
 * Finds the closest margin table based on profit margin value.
 * If an exact match exists, returns that table.
 * Otherwise, returns the table with the closest lower profit margin.
 * 
 * @param profitMargin - The profit margin value to match
 * @returns The closest MarginTable or the lowest available table if no match is found
 */
export const findClosestMarginTable = (profitMargin: number | string | undefined): MarginTable | null => {
	if (profitMargin === undefined || profitMargin === null || profitMargin === '') {
		return null
	}

	const numericMargin = typeof profitMargin === 'string' ? parseFloat(profitMargin) : profitMargin

	if (isNaN(numericMargin)) {
		return null
	}

	// Sort tables by profitMargin in descending order
	const sortedTables = [...marginTables].sort((a, b) => b.profitMargin - a.profitMargin)

	// First, try to find an exact match
	const exactMatch = sortedTables.find(table => Math.abs(table.profitMargin - numericMargin) < 0.001)
	if (exactMatch) {
		return exactMatch
	}

	// If no exact match, find the closest lower value
	// Since tables are sorted descending, the first one <= numericMargin is the closest lower
	const closestLower = sortedTables.find(table => table.profitMargin <= numericMargin)
	
	// If no lower value exists, return the lowest available table (the last one in sortedTables)
	return closestLower || sortedTables[sortedTables.length - 1] || null
}
