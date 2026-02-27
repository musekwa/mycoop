import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors } from "@/constants/colors";

interface TagProps {
  onPress: () => void;
  title: string;
  selected: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
}

export default function Tag({ onPress, title, selected, iconName }: TagProps) {
  const isDarkMode = useColorScheme() === "dark";
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`flex flex-row items-center justify-center px-4 py-3 rounded-lg border min-w-32 gap-x-2 ${
          selected
            ? "border-[#008000] bg-green-50 dark:bg-green-900/30"
            : isDarkMode
              ? "border-gray-500 bg-gray-800"
              : "border-gray-400 bg-white"
        }`}
        style={{
          shadowColor: selected ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0.2 : 0,
          shadowRadius: 4,
          elevation: selected ? 4 : 0,
        }}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color={
              selected
                ? colors.primary
                : isDarkMode
                  ? colors.lightestgray
                  : colors.gray800
            }
          />
        )}
        <Text
          className={`text-sm font-semibold ${
            selected
              ? "text-[#008000]"
              : isDarkMode
                ? "text-gray-100"
                : "text-gray-800"
          }`}
          style={{
            fontSize: 14,
            // lineHeight: 10,
          }}
        >
          {title}
        </Text>
        {selected && (
          <View
            className="w-2 h-2 rounded-full ml-1"
            style={{ backgroundColor: colors.primary }}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}
