import { ampcmGreenLogoUri, ampcmWhiteLogoUri } from "@/constants/image-uris";
import { Image } from "expo-image";
import { Text, View } from "react-native";

type HeroCardProps = {
  title: string;
  description: string;
  imgColor?: "white" | "green";
};

export default function HeroCard({
  title,
  description,
  imgColor = "green",
}: HeroCardProps) {
  const uri = imgColor === "white" ? ampcmWhiteLogoUri : ampcmGreenLogoUri;
  return (
    <View className="bg-white dark:bg-black flex items-center justify-center">
      <Image
        source={{ uri }}
        contentFit="contain"
        style={{
          width: 120,
          height: 40,
        }}
      />
      <Text className="text-xs italic text-center text-gray-500 dark:text-gray-400">
        {description}
      </Text>
    </View>
  );
}
