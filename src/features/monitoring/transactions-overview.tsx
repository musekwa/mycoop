import NoContentPlaceholder from "@/components/no-content-placeholder";
import { colors } from "@/constants/colors";
import { getTransactedItemPortugueseName } from "@/helpers/trades";
import { CashewWarehouseType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import TransactionsOverViewCharts from "./transactions-overview-charts";

type TransactionsOverviewProps = {
  currentStock: number;
  stockDetails: {
    bought: number;
    sold: number;
    transferredOut: number;
    transferredIn: number;
    exported: number;
    processed: number;
    lost: number;
    aggregated: number;
    // Item type breakdowns
    boughtByItem?: { [key: string]: number };
    soldByItem?: { [key: string]: number };
    transferredOutByItem?: { [key: string]: number };
    transferredInByItem?: { [key: string]: number };
    exportedByItem?: { [key: string]: number };
    processedByItem?: { [key: string]: number };
    lostByItem?: { [key: string]: number };
    aggregatedByItem?: { [key: string]: number };
  };
  warehouseType: CashewWarehouseType;
  warehouseStatus: boolean;
  transactions?: Array<{
    quantity: number;
    transaction_type: string;
    item?: string;
    confirmed?: boolean;
  }>;
};
export default function TransactionsOverview({
  warehouseStatus,
  currentStock,
  stockDetails,
  warehouseType,
  transactions,
}: TransactionsOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width,
  );

  // Track screen dimensions for adaptive layout
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Determine if we should use compact layout based on screen width
  const useCompactLayout = screenWidth < 400;

  // Skeleton loader component
  const SkeletonLoader = () => (
    <View className="border border-gray-300 rounded-md p-2">
      <Text className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
        Resumo por Tipo de Produto
      </Text>
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
        >
          <View className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
          {[1, 2, 3].map((line) => (
            <View
              key={line}
              className="flex-row justify-between items-center py-1"
            >
              <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  // Enhanced empty state component
  const EnhancedEmptyState = () => (
    <View className="flex h-50 items-center justify-center px-6">
      <View className="items-center">
        <NoContentPlaceholder message="Nenhuma transacção encontrada" />
      </View>
    </View>
  );

  const IndividualTransactions = () => {
    if (isLoading) {
      return <SkeletonLoader />;
    }

    if (!transactions || transactions.length === 0) {
      return <EnhancedEmptyState />;
    }

    // Calculate sums by item type and transaction type
    const sumsByItemAndType: {
      [itemType: string]: { [transactionType: string]: number };
    } = {};

    // Calculate current stock for each item type: aggregated + received - transferred_out - lost - sold
    const currentStockByItem: { [itemType: string]: number } = {};

    transactions.forEach((transaction) => {
      const itemType = transaction.item;
      if (!itemType) {
        return;
      }
      const transactionType = transaction.transaction_type;
      if (!transactionType) {
        return;
      }
      const quantity = transaction.quantity || 0;

      if (!sumsByItemAndType[itemType]) {
        sumsByItemAndType[itemType] = {};
      }
      if (!sumsByItemAndType[itemType][transactionType]) {
        sumsByItemAndType[itemType][transactionType] = 0;
      }
      sumsByItemAndType[itemType][transactionType] += quantity;

      // Calculate current stock using business logic for each item type
      if (!currentStockByItem[itemType]) {
        currentStockByItem[itemType] = 0;
      }

      // Apply business logic: aggregated + received - transferred_out - lost - sold
      const normalizedType = transactionType.toUpperCase();
      if (
        normalizedType.includes("AGGREG") ||
        normalizedType === "AGGREGATED" ||
        normalizedType === "AGGREGATION"
      ) {
        currentStockByItem[itemType] += quantity;
      } else if (
        normalizedType.includes("RECEIV") ||
        normalizedType === "TRANSFERRED_IN" ||
        normalizedType === "TRANSFER_IN"
      ) {
        currentStockByItem[itemType] += quantity;
      } else if (
        normalizedType.includes("TRANSFER_OUT") ||
        normalizedType === "TRANSFERRED_OUT" ||
        normalizedType === "TRANSFER_OUT"
      ) {
        currentStockByItem[itemType] -= quantity;
      } else if (
        normalizedType.includes("LOST") ||
        normalizedType === "LOST" ||
        normalizedType === "LOSS"
      ) {
        currentStockByItem[itemType] -= quantity;
      } else if (
        normalizedType.includes("SOLD") ||
        normalizedType === "SOLD" ||
        normalizedType === "SALE"
      ) {
        currentStockByItem[itemType] -= quantity;
      }
      // Other types like PURCHASE, PROCESSING, EXPORT don't affect the stock calculation
    });

    const getTransactionTypeLabel = (type: string) => {
      const labels: { [key: string]: string } = {
        AGGREGATED: "Agregado",
        SOLD: "Vendido",
        TRANSFERRED_OUT: "Transferido",
        TRANSFERRED_IN: "Recebido",
        LOST: "Desperdiçado",
        AGGREGATION: "Agregado",
        SALE: "Vendido",
        TRANSFER_OUT: "Transferido",
        TRANSFER_IN: "Recebido",
        LOSS: "Desperdiçado",
        PURCHASE: "Comprado",
        PROCESSING: "Processado",
        EXPORT: "Exportado",
      };
      return labels[type] || type;
    };

    const getTransactionTypeColor = (type: string) => {
      const colors: { [key: string]: string } = {
        AGGREGATED: "#166534",
        SOLD: "#DC2626",
        TRANSFERRED_OUT: "#2563EB",
        TRANSFERRED_IN: "#7C3AED",
        LOST: "#EA580C",
        AGGREGATION: "#166534",
        SALE: "#DC2626",
        TRANSFER_OUT: "#2563EB",
        TRANSFER_IN: "#7C3AED",
        LOSS: "#EA580C",
        PURCHASE: "#059669",
        PROCESSING: "#0891B2",
        EXPORT: "#B91C1C",
      };
      return colors[type] || "#6B7280";
    };

    // Get all unique item types and transaction types from the actual data
    const allItemTypes = Array.from(
      new Set(transactions.map((t) => t.item || "CASHEWNUT")),
    );
    const allTransactionTypesInData = Array.from(
      new Set(
        transactions
          .map((t) => t.transaction_type || "UNKNOWN")
          .filter((t) => t !== "UNKNOWN"),
      ),
    );

    // Combine with predefined types to ensure we show all relevant categories
    const predefinedTypes = [
      "AGGREGATED",
      "SOLD",
      "TRANSFERRED_OUT",
      warehouseType === CashewWarehouseType.COOP_UNION
        ? "TRANSFERRED_IN"
        : null,
      "LOST",
    ].filter(Boolean) as string[];

    const allTransactionTypes = Array.from(
      new Set([...predefinedTypes, ...allTransactionTypesInData]),
    );

    return (
      <View className="border border-gray-300 rounded-md p-2">
        <Text className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
          Resumo por Tipo de Produto
        </Text>
        {allItemTypes.map((itemType) => {
          const itemTransactions = sumsByItemAndType[itemType] || {};
          const itemCurrentStock = currentStockByItem[itemType] || 0;

          return (
            <View
              key={itemType}
              className={`mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md ${
                useCompactLayout ? "p-2" : "p-3"
              }`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className={`font-semibold text-gray-800 dark:text-white ${
                    useCompactLayout ? "text-xs" : "text-sm"
                  }`}
                >
                  {getTransactedItemPortugueseName(itemType)}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons
                    name="cube-outline"
                    size={useCompactLayout ? 12 : 14}
                    color={colors.primary}
                  />
                  <Text
                    className={`text-primary font-medium ml-1 ${
                      useCompactLayout ? "text-xs" : "text-xs"
                    }`}
                  >
                    Estoque:{" "}
                    {Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      maximumFractionDigits: 2,
                    }).format(itemCurrentStock)}{" "}
                    kg
                  </Text>
                </View>
              </View>
              {allTransactionTypes.map((transactionType) => {
                const quantity = itemTransactions[transactionType] || 0;

                return (
                  <View
                    key={transactionType}
                    className={`justify-between items-center py-1 ${
                      useCompactLayout ? "flex-row" : "flex-row"
                    }`}
                  >
                    <View
                      className={`flex-row items-center ${
                        useCompactLayout ? "flex-1" : "flex-1"
                      }`}
                    >
                      <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            getTransactionTypeColor(transactionType),
                        }}
                      />
                      <Text
                        className={`text-gray-600 dark:text-gray-400 ${
                          useCompactLayout ? "text-xs" : "text-xs"
                        }`}
                      >
                        {getTransactionTypeLabel(transactionType)}
                      </Text>
                    </View>
                    <Text
                      className={`font-medium ${
                        useCompactLayout ? "text-xs" : "text-xs"
                      }`}
                      style={{
                        color: getTransactionTypeColor(transactionType),
                      }}
                    >
                      {Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        maximumFractionDigits: 2,
                      }).format(quantity)}{" "}
                      kg
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Animated.ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
    >
      <View className={`px-3 ${!warehouseStatus ? "opacity-20" : ""}`}>
        <View className="flex justify-between w-full h-62.5">
          <TransactionsOverViewCharts
            stockDetails={stockDetails}
            transactions={transactions}
          />
        </View>

        <IndividualTransactions />
      </View>
      {!warehouseStatus && (
        <View className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center">
          <Ionicons name="lock-closed-outline" size={24} color={colors.red} />
          <Text className="text-red-500 font-bold text-2xl">Encerrado</Text>
        </View>
      )}
    </Animated.ScrollView>
  );
}
