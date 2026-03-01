import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function PlotsLayout() {
  const isDark = useColorScheme() === "dark";

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: isDark ? colors.white : colors.black,
        headerStyle: {
          backgroundColor: isDark ? colors.lightblack : colors.white,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Plots", headerShown: false }}
      />
    </Stack>
  );
}
