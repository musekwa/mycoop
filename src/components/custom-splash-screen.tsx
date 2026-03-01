import { ampcmWhiteFullLogoUri } from "@/constants/image-uris";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function CustomSplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(400)}
      style={styles.container}
    >
      <Image
        source={{ uri: ampcmWhiteFullLogoUri }}
        style={styles.logo}
        contentFit="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#008000",
  },
  logo: {
    width: 200,
    height: 100,
  },
});
