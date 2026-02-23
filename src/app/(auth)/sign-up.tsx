import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import SignUpForm from '@/features/auth/sign-up-form'
import HeroCard from '@/components/hero-card'
import CustomSafeAreaView from '@/components/layouts/safe-area-view'
import { Text } from 'react-native'

export default function SignUp() {
	return (
		<CustomSafeAreaView edges={['top']}>
			<KeyboardAwareScrollView
				automaticallyAdjustContentInsets={true}
				restoreScrollOnKeyboardHide={true}
				keyboardDismissMode="interactive"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				contentContainerStyle={{
					flexGrow: 1,
					padding: 16,
					paddingBottom: 40,
				}}
				className="bg-white dark:bg-black"
			>
				<HeroCard title="MyCoop" description="Crie sua conta. Preencha os dados abaixo para criar sua conta" />
				<View className="flex-1 justify-center space-y-3">
					<SignUpForm />
				</View>
			</KeyboardAwareScrollView>
		</CustomSafeAreaView>
	)
}
