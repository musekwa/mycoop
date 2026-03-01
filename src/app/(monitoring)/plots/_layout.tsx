import { Stack } from "expo-router";


export default function PlotsLayout() {
    
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Plots", headerShown: false }} />
        </Stack>
    )
}