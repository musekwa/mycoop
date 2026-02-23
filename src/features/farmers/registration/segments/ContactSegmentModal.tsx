import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFarmerRegistrationStore } from '@/store/farmer-registration'
import CustomTextInput from '@/components/form-items/custom-text-input'
import FormItemDescription from '@/components/form-items/form-item-description'

import SegmentModalLayout from './SegmentModalLayout'

const ContactSchema = z.object({
	primaryPhone: z
		.union([
			z.literal(''),
			z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, 'Número inválido'),
		])
		.optional()
		.transform((v) => (v === '' ? undefined : v)),
	secondaryPhone: z
		.union([
			z.literal(''),
			z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, 'Número inválido'),
		])
		.optional()
		.transform((v) => (v === '' ? undefined : v)),
}).refine(
	(data) => !(data.primaryPhone && data.secondaryPhone && data.primaryPhone === data.secondaryPhone),
	{ message: 'Os telefones devem ser diferentes', path: ['secondaryPhone'] }
)

type ContactFormData = z.input<typeof ContactSchema>

type Props = {
	visible: boolean
	onClose: () => void
}

export default function ContactSegmentModal({ visible, onClose }: Props) {
	const { contact, setContact } = useFarmerRegistrationStore()

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ContactFormData>({
		defaultValues: {
			primaryPhone: '',
			secondaryPhone: '',
		},
		resolver: zodResolver(ContactSchema),
	})

	useEffect(() => {
		if (visible) {
			reset({
				primaryPhone: contact?.primaryPhone ?? '',
				secondaryPhone: contact?.secondaryPhone ?? '',
			})
		}
	}, [visible, contact, reset])

	const onSave = handleSubmit((data) => {
		setContact({
			primaryPhone: data.primaryPhone,
			secondaryPhone: data.secondaryPhone,
		})
		onClose()
	})

	return (
		<SegmentModalLayout visible={visible} title="Contacto" onClose={onClose} onSave={onSave}>
			<FormItemDescription description="Números de telefone do produtor (opcional)" />

			<View className="mt-4 space-y-4">
				<Controller
					control={control}
					name="primaryPhone"
					render={({ field: { onChange, value } }) => (
						<View>
							<CustomTextInput
								label="Telemóvel Principal"
								value={value ?? ''}
								onChangeText={onChange}
								keyboardType="phone-pad"
								placeholder="84/86/87 XXX XXXX"
							/>
							{errors.primaryPhone && (
								<Text className="text-xs text-red-500">{errors.primaryPhone.message}</Text>
							)}
						</View>
					)}
				/>

				<Controller
					control={control}
					name="secondaryPhone"
					render={({ field: { onChange, value } }) => (
						<View>
							<CustomTextInput
								label="Telemóvel Alternativo"
								value={value ?? ''}
								onChangeText={onChange}
								keyboardType="phone-pad"
								placeholder="84/86/87 XXX XXXX"
							/>
							{errors.secondaryPhone && (
								<Text className="text-xs text-red-500">{errors.secondaryPhone.message}</Text>
							)}
						</View>
					)}
				/>
			</View>
		</SegmentModalLayout>
	)
}
