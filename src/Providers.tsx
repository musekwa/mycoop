import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { RootSiblingParent } from 'react-native-root-siblings'
import { MenuProvider } from 'react-native-popup-menu'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { PaperProvider } from 'react-native-paper'
import PowersyncProvider from './library/powersync/powersync-provider'
import { ToastProvider } from '@/components/toast-message/toast-provider'
import { DarkTheme, ThemeProvider, DefaultTheme } from '@react-navigation/native'

type Props = {
	children: React.ReactNode
}

export default function Providers({ children }: Props) {
	const colorScheme = useColorScheme()
	const theme = {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			primary: '#008000',
			black: '#000000',
			text: colorScheme === 'dark' ? '#ffffff' : '#000000',
			accent: '#f1c40f',
			placeholder: '#000000',
			disabled: '#000000',
			backdrop: '#000000',
			surface: '#ffffff',
			error: '#ff0000',
			notification: '#f44336',
		},
	}

	return (
		<SafeAreaProvider>
				<PowersyncProvider>
					<GestureHandlerRootView>
						<MenuProvider>
						<RootSiblingParent>
							<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

								<PaperProvider theme={theme}>
									<ToastProvider>
										<BottomSheetModalProvider>{children}</BottomSheetModalProvider>
										<StatusBar style="auto" />
									</ToastProvider>
								</PaperProvider>
							</ThemeProvider>
							</RootSiblingParent>
						</MenuProvider>
					</GestureHandlerRootView>
				</PowersyncProvider>
		</SafeAreaProvider>
	)
}
