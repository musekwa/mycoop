import {
	PowerSyncBackendConnector,
	AbstractPowerSyncDatabase,
	UpdateType,
	PowerSyncCredentials,
	CrudEntry,
} from '@powersync/react-native'
import { supabase } from '@/library/supabase/supabase'
import { AppConfig } from './app-config'

const FATAL_RESPONSE_CODES = [
	// Class 22 — Data Exception
	// Examples include data type mismatch.
	new RegExp('^22...$'),
	// Class 23 — Integrity Constraint Violation.
	// Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
	new RegExp('^23...$'),
]

export class Connector implements PowerSyncBackendConnector {
	async fetchCredentials() {
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession()
			if (error || !session) {
				console.log('Could not fetch supabase credentials', error)
				return null
			}
			return {
				endpoint: AppConfig.powerSyncUrl ?? '',
				token: session?.access_token ?? '',
			}
		} catch (error) {
			console.log('Could not fetch supabase credentials', error)
			return null
		}
	}

	async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
		const transaction = await database.getNextCrudTransaction()
		if (!transaction) {
			return
		}
		let lastOp: CrudEntry | null = null
		try {
			for (const op of transaction.crud) {
				lastOp = op
				const table = supabase.from(op.table) as any
				let result: any
				switch (op.op) {
					case UpdateType.PUT: {
						const record = { ...op.opData, id: op.id }
						result = await table.upsert(record)
						break
					}
					case UpdateType.PATCH: {
						if (!op.opData) {
							console.warn('PATCH operation has no opData, skipping', { table: op.table, id: op.id })
							break
						}
						result = await table.update(op.opData).eq('id', op.id)
						break
					}
					case UpdateType.DELETE: {
						result = await table.delete().eq('id', op.id)
						break
					}
				}
				if (result.error) {
					console.log(result.error)
					result.error.message = `Could not update supabase. Received error: ${result.error.message}`
					throw result.error
				}
			}
			await transaction.complete()
		} catch (ex: any) {
			console.debug('Error uploading data', ex)
			if (typeof ex.code === 'string' && FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))) {
				console.log('Data upload error - discarding:', {
					table: lastOp?.table,
					operation: lastOp?.op,
					id: lastOp?.id,
					data: lastOp?.opData,
					error: ex.message,
					code: ex.code,
					details: ex.details,
				})
				await transaction.complete()
			} else {
				throw ex
			}
		}
	}
}

