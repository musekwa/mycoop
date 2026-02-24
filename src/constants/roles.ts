import { GroupManagerPosition, GroupManagerPositionOption } from "@/types"

export const userRoles = [ 'COOP_ADMIN', 'SUPERVISOR']

// Group manager positions with proper typing
export const groupManagerPositions: readonly GroupManagerPositionOption[] = [
	{ label: 'Presidente', value: GroupManagerPosition.PRESIDENT },
	{ label: 'Vice-Presidente', value: GroupManagerPosition.VICE_PRESIDENT },
	{ label: 'Secretário', value: GroupManagerPosition.SECRETARY },
	{ label: 'Promotor', value: GroupManagerPosition.PROMOTER },
] as const
