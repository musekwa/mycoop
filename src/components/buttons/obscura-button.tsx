import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ObscuraButtonProps {
  onPress: () => void;
  title?: string;
  iconName?: ComponentProps<typeof Ionicons>["name"];
  containerStyle?: any;
  iconSize?: number;
}
export default function ObscuraButton({
  onPress,
  iconName,
  title,
  containerStyle,
  iconSize,
}: ObscuraButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          borderRadius: title ? 6 : 40,
          alignSelf: "flex-start",
        },
        containerStyle,
      ]}
    >
      {iconName && (
        <Ionicons name={iconName} size={iconSize ?? 28} color={"white"} />
      )}
      {title ? (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "white",
          }}
        >
          {title}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 7,
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
});
