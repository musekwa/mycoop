import React from 'react'
import { useColorScheme } from 'react-native'
import { ConfirmDialog } from 'react-native-simple-dialogs'
import { colors } from '@/constants/colors'

interface ConfirmDialogProps {
	visible: boolean
	setVisible: (visible: boolean) => void
	yesCallback: () => void
	noCallback: () => void
	yesText: string
	noText: string
	message: string
	title: string
}

export default function CustomConfirmDialg({
	visible,
	setVisible,
	yesCallback,
	noCallback,
	yesText,
	message,
	noText,
	title,
}: ConfirmDialogProps) {
	const isDarkMode = useColorScheme() === 'dark'
	return (
		<ConfirmDialog
			contentInsetAdjustmentBehavior={"always"}
			title={title}
			message={message}
			visible={visible}
			titleStyle={{ fontSize: 15, fontWeight: 'bold', color: isDarkMode ? colors.white : colors.black }}
			dialogStyle={{ borderRadius: 10, backgroundColor: isDarkMode ? colors.gray800 : 'white',  alignSelf: 'center' }}
			buttonsStyle={{ backgroundColor: isDarkMode ? colors.gray800 : 'white', padding: 0, margin: 0, height: 50, borderRadius: 10, alignSelf: 'center' }}
			messageStyle={{ color: isDarkMode ? colors.white : colors.black, fontSize: 15, fontWeight: 'normal' }}
			
			onRequestClose={() => setVisible(false)}
			onTouchOutside={() => setVisible(false)}
			positiveButton={{
				title: yesText,
				onPress: () => yesCallback && yesCallback(),
				titleStyle: { color: isDarkMode ? colors.white : colors.black },
			}}
			negativeButton={{
				title: noText,
				onPress: () => noCallback && noCallback(),
				titleStyle: { color: isDarkMode ? colors.white : colors.black },
			}}
		/>
	)
}
