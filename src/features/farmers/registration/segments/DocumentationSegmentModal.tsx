import CustomSelectItem from '@/components/custom-select-item'
import CustomSelectItemTrigger from '@/components/custom-select-item-trigger'
import Label from '@/components/form-items/custom-label'
import CustomTextInput from '@/components/form-items/custom-text-input'
import FormItemDescription from '@/components/form-items/form-item-description'
import idDocTypes from '@/constants/id-document-types'
import { useFarmerRegistrationStore } from '@/store/farmer-registration'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Text, View } from 'react-native'
import { z } from 'zod'

import SegmentModalLayout from './SegmentModalLayout'

const DocumentationSchema = z
	.object({
		docType: z.string().min(2, 'Seleccione o tipo de documento'),
		docNumber: z.string(),
		nuit: z.union([z.literal(''), z.string().regex(/^\d{9}$/, 'NUIT deve ter 9 dígitos')]),
	})
	.superRefine((data, ctx) => {
		if (data.docType && data.docType !== 'Não tem' && (!data.docNumber || data.docNumber.trim() === '')) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Indica o número do documento', path: ['docNumber'] })
		}
	})

type DocumentationFormData = z.infer<typeof DocumentationSchema>

type Props = {
	visible: boolean
	onClose: () => void
}

export default function DocumentationSegmentModal({ visible, onClose }: Props) {
	const { documentation, setDocumentation } = useFarmerRegistrationStore()
	const [showDocuments, setShowDocuments] = useState(false)

	const {
		control,
		handleSubmit,
		reset,
		resetField,
		formState: { errors },
	} = useForm<DocumentationFormData>({
		defaultValues: {
			docType: '',
			docNumber: '',
			nuit: '',
		},
		resolver: zodResolver(DocumentationSchema),
	})

	useEffect(() => {
		if (visible) {
			reset({
				docType: documentation?.docType ?? '',
				docNumber: documentation?.docNumber ?? '',
				nuit: documentation?.nuit ?? '',
			})
		}
	}, [visible, documentation, reset])

	const onSave = handleSubmit((data) => {
		setDocumentation({
			docType: data.docType,
			docNumber: data.docNumber,
			nuit: data.nuit === '' ? undefined : data.nuit,
		})
		onClose()
	})

	return (
		<SegmentModalLayout visible={visible} title="Documentação" onClose={onClose} onSave={onSave}>
			<FormItemDescription description="Documento de identificação e NUIT do produtor" />

			<View className="mt-4 space-y-4">
				<View>
					<Label label="Tipo de Documento" />
					<Controller
						control={control}
						name="docType"
						render={({ field: { onChange, value } }) => (
							<View>
								<CustomSelectItemTrigger
									resetItem={() => {
										resetField('docType')
										resetField('docNumber')
									}}
									hasSelectedItem={!!value}
									setShowItems={setShowDocuments}
									selectedItem={value || 'Seleccione um tipo de documento'}
								/>
								<CustomSelectItem
									label="Tipo de Documento"
									searchPlaceholder="Pesquise por tipo"
									showModal={showDocuments}
									emptyMessage="Nenhum tipo encontrado"
									setShowModal={setShowDocuments}
									itemsList={idDocTypes.map((type) => ({ label: type, value: type }))}
									setValue={(val) => onChange(val)}
								/>
								{errors.docType && (
									<Text className="text-xs text-red-500 mt-1">{errors.docType.message}</Text>
								)}
							</View>
						)}
					/>
				</View>

				<Controller
					control={control}
					name="docNumber"
					render={({ field: { onChange, value } }) => (
						<View>
							<CustomTextInput
								label="Número de Documento"
								value={value}
								onChangeText={onChange}
								placeholder="Número do BI, Cédula, etc."
								autoCapitalize="characters"
							/>
							{errors.docNumber && (
								<Text className="text-xs text-red-500 mt-1">{errors.docNumber.message}</Text>
							)}
						</View>
					)}
				/>

				<Controller
					control={control}
					name="nuit"
					render={({ field: { onChange, value } }) => (
						<View>
							<CustomTextInput
								label="NUIT (opcional)"
								value={value}
								onChangeText={onChange}
								placeholder="9 dígitos"
								keyboardType="numeric"
							/>
							{errors.nuit && (
								<Text className="text-xs text-red-500 mt-1">{errors.nuit.message}</Text>
							)}
						</View>
					)}
				/>
			</View>
		</SegmentModalLayout>
	)
}
