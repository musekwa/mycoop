import { View } from 'react-native'
import React from 'react'
import { useActionStore } from '@/store/actions/actions'
import CustomImageViewer from '@/components/custom-image-viewer'

export default function MediaPreview() {
	const { base64 } = useActionStore()

	return (
		<View className="flex-1 items-center justify-center bg-black">
			<CustomImageViewer images={[{ uri: base64 }]} visible={!!base64} setVisible={() => {}} />
		</View>
	)
}
