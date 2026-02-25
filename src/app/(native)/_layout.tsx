import { Slot, Stack } from "expo-router";
export default function NativeFeaturesLayout() {
    return (
      <Stack>
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