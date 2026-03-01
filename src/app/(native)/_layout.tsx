import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function NativeFeaturesLayout() {
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
      <Stack.Screen name="device-permissions" />
      <Stack.Screen
        name="media-preview"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
