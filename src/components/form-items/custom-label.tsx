import { Text } from "react-native";

type LabelProps = {
	label: string;
	className?: string;
};

export default function CustomLabel({ label, className }: LabelProps) {
	return <Text className={`text-[14px] text-black dark:text-white font-normal pb-2 ${className}`}>{label}</Text>;
}

