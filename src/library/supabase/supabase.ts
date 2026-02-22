import { Database } from '@/library/powersync/app-schemas'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

const authStorage = {
	setItem: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
	getItem: async (key: string) => await AsyncStorage.getItem(key),
	removeItem: async (key: string) => await AsyncStorage.removeItem(key),
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: authStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
		// Extended session configuration
		// flowType: 'pkce',
	},
	global: {
		headers: {
			'X-Client-Info': 'mycoop-mobile',
		},
	},
})

AppState.addEventListener('change', async (state: any) => {
	if (state === 'active') {
		await supabase.auth.startAutoRefresh()
	} else {
		await supabase.auth.stopAutoRefresh()
	}
})
