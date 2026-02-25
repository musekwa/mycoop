import { useState, useEffect, useMemo, useCallback } from 'react'
import {
	getAdminPostById,
	getDistrictById,
	getProvinceById,
	getVillageById,
	getAdminPostsByDistrictId,
} from '@/library/sqlite/selects'
import {
	AddressDetailRecord,
	ContactDetailRecord,
	OrganizationTransactionRecord,
	TABLES,
	UserDetailsRecord,
} from '@/library/powersync/app-schemas'
import { powersync } from '@/library/powersync/system'
import { getCurrentStock } from '@/helpers/trades'
import { TransactionFlowType } from '@/types'
import { supabase } from '@/library/supabase/supabase'
import { AuthError, Session } from '@supabase/supabase-js'
import { AUTH_EVENTS } from '@/data/auth-codes'

export const useUserFromPowerSync = () => {
	const [userDetails, setUserDetails] = useState<UserDetailsRecord | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isError, setIsError] = useState(false)
	const { session, error } = useUserSession()

	useEffect(() => {
		let abortController: AbortController | null = null

		const getUserDetails = async () => {
			try {
				if (error || !session?.user.id) {
					console.log('Error getting session:', error)
					setIsLoading(false)
					return
				}

				if (session) {
					const user_email = session.user.email
					abortController = new AbortController()

					// Watch for changes to user details
					powersync.watchWithCallback(
						`SELECT
							u.id,
							u.email,
							u.phone,
							u.full_name,
							u.user_role,
							u.district_id,
							u.province_id,
							u.status
						FROM ${TABLES.USER_DETAILS} u
						WHERE u.email = ?`,
						[user_email],
						{
							onResult: (data) => {
								try {
									if (data && data.rows && data.rows._array) {
										const result = data.rows._array as UserDetailsRecord[]

										if (result.length > 0) {
											setUserDetails(result[0])
										}
									}
									setIsError(false)
									setIsLoading(false)
								} catch (error) {
									console.error(error)
									setIsLoading(false)
								}
							},
							onError: (error) => {
								setIsLoading(false)
							},
						},
						{
							signal: abortController.signal,
						},
					)
				}
			} catch (error) {
				console.log('Error in getUserDetails:', error)
				setIsError(true)
				setIsLoading(false)
			}
		}

		getUserDetails()

		// Cleanup on unmount
		return () => {
			if (abortController) {
				abortController.abort()
			}
		}
	}, [error, session])

	return { userDetails, isLoading, isError }
}

export const useUserSession = () => {
	const [session, setSession] = useState<Session | null>(null)
	const [error, setError] = useState<AuthError | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isError, setIsError] = useState(false)

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession()

			if (error || !session?.user.id) {
				setError(error)
				setIsError(true)
				setIsLoading(false)
				setSession(null)
				return
			}
			setSession(session)
			setIsLoading(false)
			setIsError(false)
		}

		getSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === AUTH_EVENTS.SIGNED_OUT || (event === AUTH_EVENTS.TOKEN_REFRESHED && !session)) {
				setSession(null)
				setIsLoading(false)
				setIsError(false)
			} else if (event === AUTH_EVENTS.SIGNED_IN && session) {
				setSession(session)
				setIsLoading(false)
				setIsError(false)
			} else if (event === AUTH_EVENTS.TOKEN_REFRESHED && session) {
				setSession(session)
				setIsLoading(false)
				setIsError(false)
			}
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	return { session, isLoading, isError, error }
}

export const useUserDetails = () => {
	const { session, isLoading, isError } = useUserSession()
	const [userDetails, setUserDetails] = useState<UserDetailsRecord | null>(null)

	useEffect(() => {
		if (session && session.user) {
			const user_id = session.user.id
			const { email, phone, full_name, user_role, district_id, province_id, status } = session.user.user_metadata
			const userDetails = {
				id: user_id,
				email,
				phone,
				full_name,
				user_role,
				district_id,
				province_id,
				status,
			} as UserDetailsRecord
			setUserDetails(userDetails)
		} else {
			setUserDetails(null)
		}
	}, [session])

	return { userDetails, isLoading, isError, session }
}

export const useQueryOne = <T>(query: string, params: string[]) => {
	const [data, setData] = useState<T | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	useEffect(() => {
		powersync
			.get(query, params)
			.then((data) => {
				setData(data as T)
				setIsError(false)
				setIsLoading(false)
			})
			.catch((error) => {
				console.log('PowerSync query error (useQueryOne):', error)
				setError(`PowerSync query error: ${error}`)
				setIsError(true)
				setIsLoading(false)
			})
	}, [query, params])
	return { data, isLoading, error, isError }
}

export const useQueryMany = <T>(query: string) => {
	const [data, setData] = useState<T[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	useEffect(() => {
		if (!query || query.trim() === '') {
			setData([])
			setIsLoading(false)
			return
		}
		powersync
			.getAll(query)
			.then((data) => {
				// Ensure data is always an array
				setData(Array.isArray(data) ? (data as T[]) : [])
				setIsError(false)
				setIsLoading(false)
			})
			.catch((error) => {
				console.log('PowerSync query error (useQueryMany):', error)
				setError(`PowerSync query error: ${error}`)
				setIsError(true)
				setIsLoading(false)
				setData([]) // Set to empty array on error
			})
	}, [query])
	return { data, isLoading, error, isError }
}

export const useQueryOneAndWatchChanges = <T>(query: string, params: string[]) => {
	const [data, setData] = useState<T | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	useEffect(() => {
		const abortController = new AbortController()
		powersync.watchWithCallback(
			query,
			params,
			{
				onResult: (data) => {
					if (data.rows?._array) {
						const result = data.rows?._array as T[]
						// Handle empty result set gracefully
						if (result.length > 0) {
							const element = result[0] as T
							setData(element)
						} else {
							setData(null) // Set to null for empty result sets
						}
						setIsError(false)
						setIsLoading(false)
					}
				},
				onError: (error) => {
					console.log('PowerSync query error (useQueryOneAndWatchChanges):', error)
					console.log('Query that failed:', query)
					console.log('Query params:', params)
					setError(`PowerSync query error: ${error}`)
					setIsError(true)
					setIsLoading(false)
				},
			},
			{
				signal: abortController.signal,
			},
		)

		return () => {
			abortController.abort()
		}
	}, [query, params])
	return { data, isLoading, error, isError }
}

export const useQueryManyAndWatchChanges = <T>(query: string) => {
	const [data, setData] = useState<T[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	useEffect(() => {
		const abortController = new AbortController()
		powersync.watchWithCallback(
			query,
			[],
			{
				onResult: (data) => {
					if (data.rows?._array) {
						const result = data.rows?._array as T[]
						setData(result)
						setIsError(false)
						setIsLoading(false)
					} else {
						// Handle case where rows._array is undefined
						setData([])
						setIsError(false)
						setIsLoading(false)
					}
				},
				onError: (error) => {
					console.log('PowerSync query error (useQueryManyAndWatchChanges):', error)
					setError(`PowerSync query error: ${error}`)
					setIsError(true)
					setIsLoading(false)
				},
			},
			{
				signal: abortController.signal,
			},
		)
	}, [query])
	return { data, isLoading, error, isError }
}

export const useAddressById = (id: string) => {
	const [data, setData] = useState<AddressDetailRecord | null>(null)
	const [provinceName, setProvinceName] = useState<string | null>(null)
	const [districtName, setDistrictName] = useState<string | null>(null)
	const [adminPostName, setAdminPostName] = useState<string | null>(null)
	const [villageName, setVillageName] = useState<string | null>(null)
	const [lat, setLat] = useState<string | '0'>('0')
	const [long, setLong] = useState<string | '0'>('0')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)

	useEffect(() => {
		const abortController = new AbortController()
		powersync.watchWithCallback(
			`SELECT * FROM ${TABLES.ADDRESS_DETAILS} WHERE id = ?`,
			[id],
			{
				onResult: (data) => {
					if (data.rows?._array) {
						const result = data.rows?._array as AddressDetailRecord[]
						if (result.length > 0) {
							setData(result[0])
						} else {
							setData(null)
						}
						setIsError(false)
						setIsLoading(false)
					}
				},
				onError: (error) => {
					console.log('PowerSync query error (useAddressById):', error)
					setError(`PowerSync query error: ${error}`)
					setIsError(true)
					setIsLoading(false)
				},
			},
			{
				signal: abortController.signal,
			},
		)

		return () => {
			abortController.abort()
		}
	}, [id])

	useEffect(() => {
		if (data) {
			if (data?.province_id) {
				getProvinceById(data?.province_id).then((province) => {
					setProvinceName(province)
				})
			}
			if (data?.district_id) {
				getDistrictById(data?.district_id).then((district) => {
					setDistrictName(district)
				})
			}
			if (data?.admin_post_id) {
				getAdminPostById(data?.admin_post_id, (adminPost) => {
					if (adminPost) {
						setAdminPostName(adminPost.name)
					}
				})
			}
			if (data?.village_id) {
				getVillageById(data?.village_id).then((village) => {
					setVillageName(village)
				})
			}
			if (data?.gps_lat) {
				setLat(data.gps_lat as string)
			}
			if (data?.gps_long) {
				setLong(data.gps_long as string)
			}
		}
	}, [data])

	return { provinceName, districtName, adminPostName, villageName, lat, long, isLoading, error, isError }
}

export const useContactById = (id: string) => {
	const [primaryPhone, setPrimaryPhone] = useState<string | null>(null)
	const [secondaryPhone, setSecondaryPhone] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	useEffect(() => {
		// Reset state when id changes
		setPrimaryPhone(null)
		setSecondaryPhone(null)
		setIsLoading(true)
		setError(null)
		setIsError(false)

		// Skip query if id is empty or null
		if (!id || id.trim() === '') {
			setIsLoading(false)
			return
		}

		powersync
			.get(`SELECT * FROM ${TABLES.CONTACT_DETAILS} WHERE id = ?`, [id])
			.then((data) => {
				if (data) {
					const contact = data as ContactDetailRecord
					if (contact.primary_phone && contact.primary_phone !== 'N/A') {
						setPrimaryPhone(contact.primary_phone)
					}
					if (contact.secondary_phone && contact.secondary_phone !== 'N/A') {
						setSecondaryPhone(contact.secondary_phone)
					}
				}
				setIsError(false)
				setIsLoading(false)
			})
			.catch((error) => {
				setIsError(true)
				setError(`PowerSync query error: ${error}`)
				setIsLoading(false)
			})
	}, [id])

	return { primaryPhone, secondaryPhone, isLoading, error, isError }
}

export const useTraderById = (id: string) => {
	const [trader, setTrader] = useState<{
		id: string
		surname: string
		otherNames: string
		photo: string
		contactId: string
		addressId: string
	} | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)

	useEffect(() => {
		powersync
			.get(
				`SELECT 
					ad.actor_id as id,
					ad.surname,
					ad.other_names,
					ad.photo,
					cd.id as contact_id,
					addr.id as address_id
				FROM ${TABLES.ACTOR_DETAILS} ad
				LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
				LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
				WHERE ad.actor_id = ?`,
				[id],
			)
			.then((data) => {
				if (data) {
					const trader = data as {
						id: string
						surname: string
						other_names: string
						photo: string
						contact_id: string
						address_id: string
					}
					if (trader.id && trader.surname && trader.other_names && trader.contact_id && trader.address_id) {
						setTrader({
							id: trader.id,
							surname: trader.surname,
							otherNames: trader.other_names,
							photo: trader.photo || '',
							contactId: trader.contact_id,
							addressId: trader.address_id,
						})
					}
				}
				setIsLoading(false)
			})
			.catch((error) => {
				console.log('PowerSync query error (useTraderById):', error)
				setError(`PowerSync query error: ${error}`)
				setIsError(true)
				setIsLoading(false)
			})
	}, [id])

	return {
		surname: trader?.surname,
		otherNames: trader?.otherNames,
		photo: trader?.photo,
		contactId: trader?.contactId,
		addressId: trader?.addressId,
		isLoading,
		error,
		isError,
	}
}

//  Custom hooks
export const useWarehouseDetails = (warehouseId: string) => {
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [warehouse, setWarehouse] = useState<{
		id: string
		description: string
		warehouse_type: string
		is_active: string
		owner_id: string
		address_id: string
	} | null>(null)

	useEffect(() => {
		powersync
			.get(
				`
			SELECT 
				wd.id, 
				wd.description,
				wd.type as warehouse_type,
				wd.is_active,
				wd.owner_id,
				ad.id as address_id
			FROM ${TABLES.WAREHOUSE_DETAILS} wd 
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
			WHERE wd.id = ?`,
				[warehouseId],
			)
			.then((warehouse) => {
				setWarehouse(
					warehouse as {
						id: string
						description: string
						warehouse_type: string
						is_active: string
						owner_id: string
						address_id: string
					},
				)
				setIsLoading(false)
			})
			.catch((error) => {
				console.log('Error fetching warehouse:', error)
				setError('Failed to load warehouse details')
				setIsLoading(false)
			})
	}, [warehouseId])

	return { warehouse, isLoading, error }
}



// ===== REUSABLE HOOKS FOR TRADES SCREENS =====

export interface SearchKey {
	label: string
	value: string
}

export interface OrganizationTypeConfig {
	title: string
	searchPlaceholder: string
	emptyMessage: string
}

// Hook for fetching location names (district or admin post)
export const useLocationName = (searchKey: string, userDistrictId?: string) => {
	const [locationName, setLocationName] = useState<string>('')

	useEffect(() => {
		const fetchLocationName = async () => {
			try {
				if (searchKey) {
					const adminPost = await getAdminPostById(searchKey, () => {
						setLocationName(adminPost ?? '')
					})
				} else if (userDistrictId) {
					const district = await getDistrictById(userDistrictId)
					setLocationName(district ?? '')
				} else {
					setLocationName('')
				}
			} catch (error) {
				console.warn('Error fetching location name:', error)
				setLocationName('')
			}
		}

		fetchLocationName()
	}, [searchKey, userDistrictId])

	return locationName
}

// Hook for managing search options (admin posts)
export const useSearchOptions = (userDistrictId?: string) => {
	const [searchKeys, setSearchKeys] = useState<SearchKey[]>([])

	const loadSearchKeys = useCallback(async () => {
		try {
			const adminPosts = await getAdminPostsByDistrictId(userDistrictId ?? '')
			const searchOptions = adminPosts ? adminPosts.map((post) => ({ label: post.name, value: post.id })) : []

			searchOptions.push({ label: 'Todos', value: 'All' })
			setSearchKeys(searchOptions)
		} catch (error) {
			console.warn('Error loading search keys:', error)
			setSearchKeys([{ label: 'Todos', value: 'All' }])
		}
	}, [userDistrictId])

	useEffect(() => {
		loadSearchKeys()
	}, [loadSearchKeys])

	return { searchKeys, loadSearchKeys }
}

// Hook for grouping organizations by type
export const useGroupedOrganizations = <T extends { organization_type: string }>(organizations: T[]) => {
	return useMemo(() => {
		const groupTypes = ['ASSOCIATION', 'COOPERATIVE', 'COOP_UNION']
		return groupTypes
			.map((type) => ({
				title: type,
				data: organizations.filter((org) => org.organization_type === type),
			}))
			.filter((section) => section.data.length > 0)
	}, [organizations])
}

// Configuration for organization types
export const getOrganizationTypeConfig = (): OrganizationTypeConfig => {
	return {
		title: 'Grupos',
		searchPlaceholder: 'Procurar grupo',
		emptyMessage: 'Ainda não há grupos neste distrito',
	}
}

export const useOrganizationTransactions = (organizationId: string) => {
	const [currentStock, setCurrentStock] = useState<number>(0)
	const {
		data: transactions,
		isLoading: isTransactionsLoading,
		error: transactionsError,
		isError: isTransactionsError,
	} = useQueryManyAndWatchChanges<OrganizationTransactionRecord>(`
		SELECT 
			*
		FROM ${TABLES.ORGANIZATION_TRANSACTIONS}
		WHERE store_id = '${organizationId}'`)

	useEffect(() => {
		if (transactions) {
			const validTransactions = transactions
				.filter((t) => t.quantity != null && t.transaction_type != null)
				.map((t) => ({
					quantity: Number(t.quantity),
					transaction_type: t.transaction_type as TransactionFlowType,
				}))
			const currentStock = getCurrentStock(validTransactions)
			setCurrentStock(currentStock)
		}
	}, [transactions])

	return { transactions, currentStock, isTransactionsLoading, transactionsError, isTransactionsError }
}
