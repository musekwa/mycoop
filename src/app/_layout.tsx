import "@/global.css";
import "react-native-reanimated";

// React and React Native imports
import { useEffect, useState } from "react";

// Third party libraries
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Href, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

// Components
import CustomSplashScreen from "@/components/custom-splash-screen";
import PowerSyncConnecting from "@/components/loaders/powersync-connecting";
import { useUserDetails } from "@/hooks/queries";
import Providers from "@/Providers";

export const unstable_settings = {
  anchor: "(tabs)",
};

// Register translations
// registerTranslation('pt', pt)

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
// 	// Ensure that reloading on `/modal` keeps a back button present.
// 	initialRouteName: '(tabs)',
// }

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide native splash once fonts are loaded, then show custom splash
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const onSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // Wait for fonts before rendering anything
  if (!loaded) {
    return null;
  }

  if (showCustomSplash) {
    return <CustomSplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
}

function RootLayoutNav() {
  const { userDetails, isLoading } = useUserDetails();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user details, redirect to login
    if (!isLoading && !userDetails) {
      router.replace("/(auth)/login" as Href);
    }
  }, [userDetails, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <PowerSyncConnecting />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(aux)"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="(profiles)"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen name="(native)" options={{ headerShown: false }} />
        <Stack.Screen name="(monitoring)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
