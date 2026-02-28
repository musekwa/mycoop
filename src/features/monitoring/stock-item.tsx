import { getTransactedItemPortugueseName } from "@/helpers/trades";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type StockItemProps = {
  icon: string;
  label: string;
  value: number;
  color: string;
  itemBreakdown?: {
    [key: string]: number;
  };
};

export default function StockItem({
  icon,
  label,
  value,
  color,
  itemBreakdown,
}: StockItemProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const hasBreakdown = Boolean(
    itemBreakdown && Object.keys(itemBreakdown).length > 0,
  );

  // Debug logging
  console.log(`StockItem [${label}]:`, {
    hasBreakdown,
    itemBreakdown,
    value,
    color,
    itemBreakdownType: typeof itemBreakdown,
    itemBreakdownKeys: itemBreakdown ? Object.keys(itemBreakdown) : "undefined",
    objectKeysLength: itemBreakdown ? Object.keys(itemBreakdown).length : "N/A",
  });

  return (
    <View className="mb-2 bg-white dark:bg-black p-2 border border-gray-200 dark:border-gray-700 rounded">
      <TouchableOpacity
        onPress={() => hasBreakdown && setShowBreakdown(!showBreakdown)}
        className={`flex-row items-center ${hasBreakdown ? "py-2" : "mb-2"}`}
        disabled={!hasBreakdown}
      >
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400 flex-1">
          {label}:
        </Text>
        <View className="flex-row items-center">
          <Text className="text-base font-semibold" style={{ color }}>
            {Intl.NumberFormat("pt-BR", {
              style: "decimal",
              maximumFractionDigits: 2,
            }).format(value)}{" "}
            kg
          </Text>
          {hasBreakdown ? (
            <Ionicons
              name={showBreakdown ? "chevron-up" : "chevron-down"}
              size={16}
              color="#6B7280"
              className="ml-2"
            />
          ) : (
            <View className="ml-2 w-4 h-4 bg-red-500 rounded-full" />
          )}
        </View>
      </TouchableOpacity>

      {hasBreakdown && showBreakdown && itemBreakdown && (
        <View
          className="ml-8 mb-2 bg-gray-50 dark:bg-gray-800 rounded-md p-2 border-l-2"
          style={{ borderLeftColor: color }}
        >
          <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Por Produto:
          </Text>
          {Object.entries(itemBreakdown).map(([itemType, itemValue]) => (
            <View
              key={itemType}
              className="flex-row justify-between items-center py-1"
            >
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {getTransactedItemPortugueseName(itemType).toLowerCase()}
              </Text>
              <Text className="text-xs font-medium" style={{ color }}>
                {Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  maximumFractionDigits: 2,
                }).format(itemValue)}{" "}
                kg
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
