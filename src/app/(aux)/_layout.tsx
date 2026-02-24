import React from 'react'
import { Stack } from 'expo-router'

export default function WorkerLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="custom-redirect" options={{
				headerShown: false,
			}} />
			<Stack.Screen
				name="add-employee"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="add-group-manager"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	)
}
