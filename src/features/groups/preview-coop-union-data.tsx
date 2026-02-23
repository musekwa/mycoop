import { View } from 'react-native'
import React from 'react'
import { CoopUnionFormDataType } from '@/store/organizations'
import { ScrollView } from 'react-native'
import { capitalize } from '@/helpers/capitalize'
import { Divider } from 'react-native-paper'
import FormFieldPreview from '@/components/form-items/form-field-preview'

type PreviewCoopUnionProps = {
	org: CoopUnionFormDataType
	adminPostName: string
	villageName: string
}

export default function PreviewCoopUnionData({ org, adminPostName, villageName }: PreviewCoopUnionProps) {


	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				paddingBottom: 60,
			}}
			className="space-y-3"
		>
			<FormFieldPreview title="União das Cooperativas:" value={capitalize(org.name)} />
			<FormFieldPreview
				title="Ano de Legalização:"
				value={org.affiliationYear ? org.affiliationYear : 'Ainda Não Legalizada'}
			/>

			<Divider />
			<FormFieldPreview title="Endereço (Posto Administrativo):" value={adminPostName} />

			<FormFieldPreview title="Endereço (Localidade):" value={villageName} />

			<Divider />

			<View className="flex flex-col py-3">
				<FormFieldPreview title={'Documentação (Alvará):'} value={org.license ? org.license : 'Nenhum'} />
				<FormFieldPreview title="Documentação (NUEL):" value={org.nuel ? org.nuel : 'Nenhum'} />
				<FormFieldPreview title="Documentação (NUIT):" value={org.nuit ? org.nuit : 'Nenhum'} />
			</View>
		</ScrollView>
	)
}
