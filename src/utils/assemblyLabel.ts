import { ASSEMBLY_OPTIONS } from '@/lib/calculadora-de-embalagem/utils/formOptions'
import type { AssemblyType } from '@/lib/calculadora-de-embalagem/utils/packagingCalculator'

const DISASSEMBLED_LABEL = 'Desmontada'

const labelByValue = new Map(
	ASSEMBLY_OPTIONS.map( ( o ) => [ o.value, o.label ] ),
)

export function getAssemblyLabelFromKey (
	assembly: string | null | undefined,
): string {
	if ( !assembly || assembly === 'disassembled' ) {
		return DISASSEMBLED_LABEL
	}
	return labelByValue.get( assembly as AssemblyType ) ?? DISASSEMBLED_LABEL
}

export function isOrderItemMont (
	mont: boolean | string | number | undefined,
): boolean {
	return mont === true || mont === 'true' || mont === 1 || mont === '1'
}

export function getTrelloAssemblyLabel (
	mont: boolean | string | number | undefined,
	assembly?: string | null,
): string {
	if ( !isOrderItemMont( mont ) ) {
		return DISASSEMBLED_LABEL
	}
	if ( !assembly ) {
		return 'Montada'
	}
	return getAssemblyLabelFromKey( assembly )
}
