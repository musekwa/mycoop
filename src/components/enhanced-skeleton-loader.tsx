import React from "react";
import { View, useColorScheme } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface EnhancedSkeletonLoaderProps {
  type?: "list" | "card" | "stats";
  count?: number;
}

const EnhancedSkeletonLoader = ({
  type = "list",
  count = 3,
}: EnhancedSkeletonLoaderProps) => {
  const isDarkMode = useColorScheme() === "dark";

  const shimmerColor = isDarkMode ? "#374151" : "#E5E7EB";
  const shimmerHighlight = isDarkMode ? "#4B5563" : "#F3F4F6";

  const ListItemSkeleton = () => (
    <View
      className="flex-row items-center justify-between w-full py-3 px-3 mb-2 rounded-lg"
      style={{ backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" }}
    >
      <View className="flex-row items-center flex-1">
        <View
          className="rounded-full"
          style={{
            width: 50,
            height: 50,
            backgroundColor: shimmerColor,
          }}
        />
        <View className="flex-1 ml-3">
          <View
            className="rounded"
            style={{
              width: "60%",
              height: 16,
              backgroundColor: shimmerColor,
              marginBottom: 6,
            }}
          />
          <View
            className="rounded"
            style={{
              width: "40%",
              height: 12,
              backgroundColor: shimmerColor,
            }}
          />
        </View>
      </View>
      <View className="flex-row items-center">
        <View
          className="rounded-full mr-2"
          style={{
            width: 36,
            height: 36,
            backgroundColor: shimmerColor,
          }}
        />
        <View
          className="rounded-full"
          style={{
            width: 36,
            height: 36,
            backgroundColor: shimmerColor,
          }}
        />
      </View>
    </View>
  );

  const CardSkeleton = () => (
    <View className="items-center mr-4" style={{ width: 80 }}>
      <View
        className="rounded-full"
        style={{
          width: 60,
          height: 60,
          backgroundColor: shimmerColor,
        }}
      />
      <View
        className="rounded mt-2"
        style={{
          width: 60,
          height: 12,
          backgroundColor: shimmerColor,
        }}
      />
      <View
        className="rounded mt-1"
        style={{
          width: 40,
          height: 10,
          backgroundColor: shimmerColor,
        }}
      />
    </View>
  );

  const StatsSkeleton = () => (
    <View
      className="flex-1 items-center py-3 px-2 rounded-lg border mr-2"
      style={{
        backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
        borderColor: isDarkMode ? "#374151" : "#E5E7EB",
      }}
    >
      <View
        className="rounded"
        style={{
          width: 24,
          height: 24,
          backgroundColor: shimmerColor,
        }}
      />
      <View
        className="rounded mt-1"
        style={{
          width: 32,
          height: 24,
          backgroundColor: shimmerColor,
        }}
      />
      <View
        className="rounded mt-1"
        style={{
          width: 48,
          height: 10,
          backgroundColor: shimmerColor,
        }}
      />
    </View>
  );

  const renderSkeletonItem = () => {
    switch (type) {
      case "card":
        return <CardSkeleton />;
      case "stats":
        return <StatsSkeleton />;
      default:
        return <ListItemSkeleton />;
    }
  };

  return (
    <View className="px-4">
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.duration(300).delay(index * 100)}
        >
          {renderSkeletonItem()}
        </Animated.View>
      ))}
    </View>
  );
};

export default EnhancedSkeletonLoader;
