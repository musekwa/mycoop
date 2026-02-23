import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFarmerRegistrationStore } from '@/store/farmer-registration'
import CustomTextInput from '@/components/form-items/custom-text-input'
import FormItemDescription from '@/components/form-items/form-item-description'
import DatePicker from 'react-native-date-picker'


import SegmentModalLayout from './SegmentModalLayout'
import { birthDateLimits } from '@/helpers/dates'

const BirthDateSchema = z.object({
	birthDate: z
		.date({ message: 'Indica a data de nascimento' })
		.min(birthDateLimits.minimumDate)
		.max(birthDateLimits.maximumDate)
		.optional()
		.refine((val): val is Date => val != null, { message: 'Indica a data de nascimento' }),
})

type BirthDateFormData = z.input<typeof BirthDateSchema>

type Props = {
	visible: boolean
	onClose: () => void
}

export default function BirthDateSegmentModal({ visible, onClose }: Props) {
	const { birthDate: savedBirthDate, setBirthDate } = useFarmerRegistrationStore()
	const isDarkMode = useColorScheme() === 'dark'
	const [openDate, setOpenDate] = useState(false)

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<BirthDateFormData>({
		defaultValues: {
			birthDate: undefined,
		},
		resolver: zodResolver(BirthDateSchema),
	})

	useEffect(() => {
		if (visible) {
			reset({
				birthDate: savedBirthDate?.birthDate ? new Date(savedBirthDate.birthDate) : undefined,
			})
		}
	}, [visible, savedBirthDate, reset])

	const onSave = handleSubmit((data) => {
		if (!data.birthDate) return
		setBirthDate({ birthDate: data.birthDate })
		onClose()
	})

	return (
		<SegmentModalLayout visible={visible} title="Data de Nascimento" onClose={onClose} onSave={onSave}>
			<FormItemDescription description="Indica a data de nascimento do produtor" />

			<Controller
				control={control}
				name="birthDate"
				render={({ field: { onChange, value } }) => (
					<View className="mt-4">
						<TouchableOpacity onPress={() => setOpenDate(true)} activeOpacity={0.7}>
							<CustomTextInput
								label="Data de Nascimento"
								editable={false}
								value={value ? new Date(value).toLocaleDateString('pt-BR') : ''}
								placeholder="Seleccione a data"
								onChangeText={() => {}}
							/>
						</TouchableOpacity>
						<DatePicker
							modal
							theme={isDarkMode ? 'dark' : 'light'}
							minimumDate={birthDateLimits.minimumDate}
							maximumDate={birthDateLimits.maximumDate}
							title="Data de Nascimento"
							confirmText="Confirmar"
							cancelText="Cancelar"
							locale="pt"
							mode="date"
							open={openDate}
							date={value || new Date()}
							onConfirm={(d) => {
								setOpenDate(false)
								onChange(d)
							}}
							onCancel={() => setOpenDate(false)}
						/>
						{errors.birthDate && (
							<Text className="text-xs text-red-500">{errors.birthDate.message}</Text>
						)}
					</View>
				)}
			/>
		</SegmentModalLayout>
	)
}
