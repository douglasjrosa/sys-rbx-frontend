import { MarginTable, marginTables } from '@/components/data/marginTables'
import { getTableNameInPortuguese } from './tableUtils'

/**
 * Finds the closest margin table based on profit margin value, name or id.
 * Uses the same logic as the table display for consistency.
 * 
 * @param value - The profit margin value, name or id to match
 * @returns The matched MarginTable or null
 */
export const findClosestMarginTable = (value: number | string | undefined): MarginTable | null => {
	const tableName = getTableNameInPortuguese(value)
	if (tableName === '-') return null

	return marginTables.find(table => table.name === tableName) || null
}
