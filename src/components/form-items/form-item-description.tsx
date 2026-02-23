import { Text } from 'react-native'

type FormItemDescriptionProps = {
	description: string
	style?: any
}

export default function FormItemDescription({ description, style }: FormItemDescriptionProps) {
	return (
		<Text className="text-[12px] italic text-gray-500 dark:text-white font-normal pb-2" style={style}>
			{description}
		</Text>
	)
}
