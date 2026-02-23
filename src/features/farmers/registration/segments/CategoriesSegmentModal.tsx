import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFarmerRegistrationStore } from '@/store/farmer-registration'
import FormItemDescription from '@/components/form-items/form-item-description'
import { Fontisto } from '@expo/vector-icons'
import { colors } from '@/constants/colors'

import SegmentModalLayout from './SegmentModalLayout'

const CategoriesSchema = z.object({
	isServiceProvider: z.enum(['YES', 'NO'], { message: 'Indica se é provedor de serviços' }),
	isSmallScale: z.enum(['YES', 'NO'], { message: 'Indica a categoria' }),
})

type CategoriesFormData = z.infer<typeof CategoriesSchema>

type Props = {
	visible: boolean
	onClose: () => void
}

export default function CategoriesSegmentModal({ visible, onClose }: Props) {
	const { categories, setCategories } = useFarmerRegistrationStore()

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CategoriesFormData>({
		defaultValues: {
			isServiceProvider: undefined,
			isSmallScale: undefined,
		},
		resolver: zodResolver(CategoriesSchema),
	})

	useEffect(() => {
		if (visible) {
			reset({
				isServiceProvider: categories?.isServiceProvider ?? undefined,
				isSmallScale: categories?.isSmallScale ?? undefined,
			})
		}
	}, [visible, categories, reset])

	const onSave = handleSubmit((data) => {
		setCategories({
			isServiceProvider: data.isServiceProvider,
			isSmallScale: data.isSmallScale,
		})
		onClose()
	})

	return (
		<SegmentModalLayout visible={visible} title="Categorias" onClose={onClose} onSave={onSave}>
			<FormItemDescription description="Categoria e tipo de produtor" />

			<View className="space-y-4 mt-4">
				<FormItemDescription description="Provedor de serviços de pulverização?" />
				<Controller
					control={control}
					name="isServiceProvider"
					render={({ field: { onChange, value } }) => (
						<View className="flex-row justify-around">
							<TouchableOpacity
								onPress={() => onChange('NO')}
								className="flex-1 flex-row items-center justify-center space-x-2 py-2"
							>
								{value === 'NO' ? (
									<Fontisto name="radio-btn-active" color={colors.primary} size={22} />
								) : (
									<Fontisto name="radio-btn-passive" color={colors.gray600} size={22} />
								)}
								<Text className="text-gray-700 dark:text-gray-300">Não</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => onChange('YES')}
								className="flex-1 flex-row items-center justify-center space-x-2 py-2"
							>
								{value === 'YES' ? (
									<Fontisto name="radio-btn-active" color={colors.primary} size={22} />
								) : (
									<Fontisto name="radio-btn-passive" color={colors.gray600} size={22} />
								)}
								<Text className="text-gray-700 dark:text-gray-300">Sim</Text>
							</TouchableOpacity>
						</View>
					)}
				/>
				{errors.isServiceProvider && (
					<Text className="text-xs text-red-500">{errors.isServiceProvider.message}</Text>
				)}
			</View>

			<View className="space-y-4 mt-4">
				<FormItemDescription description="Categoria: Familiar ou Comercial?" />
				<Controller
					control={control}
					name="isSmallScale"
					render={({ field: { onChange, value } }) => (
						<View className="flex-row justify-around">
							<TouchableOpacity
								onPress={() => onChange('YES')}
								className="flex-1 flex-row items-center justify-center space-x-2 py-2"
							>
								{value === 'YES' ? (
									<Fontisto name="radio-btn-active" color={colors.primary} size={22} />
								) : (
									<Fontisto name="radio-btn-passive" color={colors.gray600} size={22} />
								)}
								<Text className="text-gray-700 dark:text-gray-300">Familiar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => onChange('NO')}
								className="flex-1 flex-row items-center justify-center space-x-2 py-2"
							>
								{value === 'NO' ? (
									<Fontisto name="radio-btn-active" color={colors.primary} size={22} />
								) : (
									<Fontisto name="radio-btn-passive" color={colors.gray600} size={22} />
								)}
								<Text className="text-gray-700 dark:text-gray-300">Comercial</Text>
							</TouchableOpacity>
						</View>
					)}
				/>
				{errors.isSmallScale && (
					<Text className="text-xs text-red-500">{errors.isSmallScale.message}</Text>
				)}
			</View>
		</SegmentModalLayout>
	)
}
