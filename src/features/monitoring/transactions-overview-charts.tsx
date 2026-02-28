import { getTransactedItemPortugueseName } from "@/helpers/trades";
import { StockDetailsType } from "@/types";
import React from "react";
import { Text, View } from "react-native";

export default function TransactionsOverViewCharts({
  stockDetails,
  transactions,
}: {
  stockDetails: StockDetailsType;
  transactions?: Array<{
    quantity: number;
    transaction_type: string;
    item?: string;
    confirmed?: boolean;
  }>;
}) {
  // Aggregate totals by item from the transactions array
  const itemData = React.useMemo(() => {
    const itemTotals: { [key: string]: number } = {};

    if (transactions && transactions.length > 0) {
      transactions.forEach((t) => {
        const item = t.item;
        if (!item) return;
        const qty = t.quantity || 0;
        if (qty > 0) {
          itemTotals[item] = (itemTotals[item] || 0) + qty;
        }
      });
    }

    return Object.entries(itemTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [transactions]);

  if (itemData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          Sem dados de transações por produto
        </Text>
      </View>
    );
  }

  const maxValue = Math.max(...itemData.map((item) => item.total));
  const formatValue = (value: number) =>
    Intl.NumberFormat("pt-BR", {
      style: "decimal",
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <View className="py-2">
      <Text className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
        Transações por Produto
      </Text>
      {itemData.map((item, index) => {
        const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0;

        return (
          <View key={item.name} className="mb-2.5">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {getTransactedItemPortugueseName(item.name)}
              </Text>
              <Text className="text-xs font-semibold text-gray-800 dark:text-white">
                {formatValue(item.total)} kg
              </Text>
            </View>
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(percentage, 2)}%`,
                  backgroundColor:
                    index === 0
                      ? "#008000"
                      : index === 1
                        ? "#16a34a"
                        : "#4ade80",
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
