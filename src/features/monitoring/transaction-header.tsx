import React from 'react'
import { View, Text } from 'react-native'

interface TransactionHeaderProps {
	index: number
	quantity: number
	label: string // e.g., "Transferência" or "Recebimento"
}

export default function TransactionHeader({ index, quantity, label }: TransactionHeaderProps) {
	return (
		<View className="flex-row justify-between items-center w-full">
			<View>
				<Text className="text-xs text-gray-500 dark:text-gray-400">
					{label} #{index + 1}:
				</Text>
			</View>
			<View className="flex-row items-center bg-green-200 p-1 rounded-full">
				<Text className="text-xs font-medium text-green-800 dark:text-green-400">
					{Intl.NumberFormat('pt-BR').format(quantity)} Kg.
				</Text>
			</View>
		</View>
	)
}

