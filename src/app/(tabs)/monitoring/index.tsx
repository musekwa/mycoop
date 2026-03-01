import React, { useEffect, useMemo } from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import CustomPopUpMenu from "@/components/custom-popup-menu";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import CustomShimmerPlaceholder from "@/components/skeletons/custom-shimmer-placeholder";
import { colors } from "@/constants/colors";
import RouteProtection from "@/features/auth/route-protection";
import { commercializationCampainsdateRange } from "@/helpers/dates";
import { getTransactedItemPortugueseName } from "@/helpers/trades";
import { useQueryManyAndWatchChanges, useUserDetails } from "@/hooks/queries";
import useUserDistrict from "@/hooks/ue-user-district";
import { TABLES } from "@/library/powersync/app-schemas";
import { OrganizationTypes, TransactionFlowType } from "@/types";

// ─── Data Hook ───────────────────────────────────────────────────────────────
const useMonitoringData = (districtId: string | undefined) => {
  const shouldQuery = !!districtId;

  // Groups with their types
  const { data: groups, isLoading: isGroupsLoading } =
    useQueryManyAndWatchChanges<{
      id: string;
      name: string;
      organization_type: string;
    }>(
      shouldQuery
        ? `
      SELECT 
        a.id,
        ad.other_names as name,
        ac.subcategory as organization_type
      FROM ${TABLES.ACTORS} a
      INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
      INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
      INNER JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
      WHERE addr.district_id = '${districtId}' AND a.category = 'GROUP'
    `
        : "",
    );

  // Transactions by item across all groups
  const { data: transactionsByItem, isLoading: isTransactionsLoading } =
    useQueryManyAndWatchChanges<{
      item: string;
      transaction_type: string;
      total_quantity: number;
    }>(
      shouldQuery
        ? `
      SELECT 
        ot.item,
        ot.transaction_type,
        SUM(ot.quantity) as total_quantity
      FROM ${TABLES.ORGANIZATION_TRANSACTIONS} ot
      INNER JOIN ${TABLES.ACTORS} a ON a.id = ot.store_id
      INNER JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
      WHERE addr.district_id = '${districtId}'
        AND ot.item IS NOT NULL
      GROUP BY ot.item, ot.transaction_type
    `
        : "",
    );

  // Process groups
  const groupSummary = useMemo(() => {
    if (!groups)
      return { cooperatives: 0, associations: 0, unions: 0, total: 0 };
    const cooperatives = groups.filter(
      (g) => g.organization_type === OrganizationTypes.COOPERATIVE,
    ).length;
    const associations = groups.filter(
      (g) => g.organization_type === OrganizationTypes.ASSOCIATION,
    ).length;
    const unions = groups.filter(
      (g) => g.organization_type === OrganizationTypes.COOP_UNION,
    ).length;
    return {
      cooperatives,
      associations,
      unions,
      total: cooperatives + associations + unions,
    };
  }, [groups]);

  // Process transactions by item
  const itemBreakdown = useMemo(() => {
    if (!transactionsByItem?.length) return [];

    const itemMap = new Map<
      string,
      {
        aggregated: number;
        sold: number;
        transferredOut: number;
        transferredIn: number;
        lost: number;
      }
    >();

    transactionsByItem.forEach((t) => {
      if (!itemMap.has(t.item)) {
        itemMap.set(t.item, {
          aggregated: 0,
          sold: 0,
          transferredOut: 0,
          transferredIn: 0,
          lost: 0,
        });
      }
      const entry = itemMap.get(t.item)!;
      switch (t.transaction_type) {
        case TransactionFlowType.AGGREGATED:
          entry.aggregated += t.total_quantity;
          break;
        case TransactionFlowType.SOLD:
          entry.sold += t.total_quantity;
          break;
        case TransactionFlowType.TRANSFERRED_OUT:
          entry.transferredOut += t.total_quantity;
          break;
        case TransactionFlowType.TRANSFERRED_IN:
          entry.transferredIn += t.total_quantity;
          break;
        case TransactionFlowType.LOST:
          entry.lost += t.total_quantity;
          break;
      }
    });

    return Array.from(itemMap.entries()).map(([item, data]) => ({
      item,
      aggregated: data.aggregated,
      sold: data.sold,
      transferredOut: data.transferredOut,
      transferredIn: data.transferredIn,
      lost: data.lost,
      available:
        data.aggregated +
        data.transferredIn -
        (data.sold + data.transferredOut + data.lost),
    }));
  }, [transactionsByItem]);

  return {
    groupSummary,
    itemBreakdown,
    isLoading: isGroupsLoading || isTransactionsLoading,
  };
};

// ─── Item Colors ─────────────────────────────────────────────────────────────
const ITEM_COLORS: Record<string, string> = {
  CASHEWNUT: "#D97706",
  GROUNDNUT: "#059669",
  BEANS: "#7C3AED",
};
const ITEM_ICONS: Record<string, string> = {
  CASHEWNUT: "nutrition-outline",
  GROUNDNUT: "leaf-outline",
  BEANS: "ellipse-outline",
};

// ─── Shimmer ─────────────────────────────────────────────────────────────────
const ShimmerBlock = ({ height = 80 }: { height?: number }) => (
  <View className="mb-3">
    <CustomShimmerPlaceholder
      style={{ width: "100%", height, borderRadius: 16 }}
    />
  </View>
);

// ─── Navigation Card ─────────────────────────────────────────────────────────
const NavCard = ({
  icon,
  iconFamily,
  label,
  subtitle,
  color,
  onPress,
  badge,
  delay,
}: {
  icon: string;
  iconFamily?: "ionicons" | "material";
  label: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  badge?: string;
  delay: number;
}) => (
  <Animated.View
    entering={FadeInDown.duration(400).delay(delay).springify()}
    className="flex-1"
  >
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="rounded-2xl p-4 border"
      style={{
        backgroundColor: `${color}10`,
        borderColor: `${color}25`,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          {iconFamily === "material" ? (
            <MaterialCommunityIcons
              name={icon as any}
              size={20}
              color={color}
            />
          ) : (
            <Ionicons name={icon as any} size={20} color={color} />
          )}
        </View>
        {badge && (
          <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
            <Text className="text-amber-600 dark:text-amber-400 text-[9px] font-semibold">
              {badge}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-gray-900 dark:text-white font-bold text-[15px]">
        {label}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-[11px] mt-1">
        {subtitle}
      </Text>
      <View className="flex-row items-center mt-3">
        <Text className="text-[11px] font-medium" style={{ color }}>
          Abrir
        </Text>
        <Ionicons name="chevron-forward" size={14} color={color} />
      </View>
    </TouchableOpacity>
  </Animated.View>
);

// ─── Groups Summary Section ──────────────────────────────────────────────────
const GroupsSummarySection = ({
  summary,
  isLoading,
}: {
  summary: {
    cooperatives: number;
    associations: number;
    unions: number;
    total: number;
  };
  isLoading: boolean;
}) => {
  if (isLoading) return <ShimmerBlock height={100} />;
  if (summary.total === 0) return null;

  const items = [
    {
      label: "Cooperativas",
      count: summary.cooperatives,
      color: "#7C3AED",
      icon: "people-outline",
    },
    {
      label: "Associações",
      count: summary.associations,
      color: "#D97706",
      icon: "people-circle-outline",
    },
    {
      label: "Uniões",
      count: summary.unions,
      color: "#0891B2",
      icon: "link-outline",
    },
  ].filter((i) => i.count > 0);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(100).springify()}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-4"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
            <Ionicons name="business-outline" size={16} color="#2563EB" />
          </View>
          <Text className="text-gray-900 dark:text-white font-bold text-[15px] ml-2">
            Grupos
          </Text>
        </View>
        <View className="bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-[12px]">
            {summary.total}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-3">
        {items.map((item, index) => (
          <View
            key={item.label}
            className="flex-1 rounded-xl p-3"
            style={{ backgroundColor: `${item.color}08` }}
          >
            <View className="flex-row items-center mb-1.5">
              <Ionicons name={item.icon as any} size={14} color={item.color} />
              <Text
                className="text-[10px] font-medium ml-1"
                style={{ color: item.color }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
            <Text
              className="font-bold text-[22px]"
              style={{ color: item.color }}
            >
              {item.count}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

// ─── Item Transaction Card ───────────────────────────────────────────────────
const ItemTransactionCard = ({
  data,
  index,
}: {
  data: {
    item: string;
    aggregated: number;
    sold: number;
    transferredOut: number;
    transferredIn: number;
    lost: number;
    available: number;
  };
  index: number;
}) => {
  const color = ITEM_COLORS[data.item] || "#6B7280";
  const icon = ITEM_ICONS[data.item] || "ellipse-outline";
  const itemName = getTransactedItemPortugueseName(data.item);

  const rows = [
    { label: "Agregado", value: data.aggregated, icon: "add-circle-outline" },
    {
      label: "Recebido",
      value: data.transferredIn,
      icon: "arrow-down-circle-outline",
    },
    { label: "Vendido", value: data.sold, icon: "cart-outline" },
    {
      label: "Transferido",
      value: data.transferredOut,
      icon: "arrow-up-circle-outline",
    },
    { label: "Desperdiçado", value: data.lost, icon: "warning-outline" },
  ].filter((r) => r.value > 0);

  return (
    <Animated.View
      entering={FadeInDown.duration(400)
        .delay(200 + index * 100)
        .springify()}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-4"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <Ionicons name={icon as any} size={16} color={color} />
          </View>
          <Text className="font-bold text-[15px] ml-2" style={{ color }}>
            {itemName}
          </Text>
        </View>
        <View
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${color}12` }}
        >
          <Text className="font-bold text-[12px]" style={{ color }}>
            {Intl.NumberFormat("pt-BR").format(Math.max(data.available, 0))} Kg
          </Text>
        </View>
      </View>

      {/* Available stock highlight */}
      <View
        className="rounded-xl p-3 mb-3"
        style={{ backgroundColor: `${color}08` }}
      >
        <Text className="text-gray-500 dark:text-gray-400 text-[10px] mb-1">
          Estoque disponível
        </Text>
        <Text className="font-bold text-[28px]" style={{ color }}>
          {Intl.NumberFormat("pt-BR").format(Math.max(data.available, 0))}
          <Text className="text-[14px] font-normal"> Kg</Text>
        </Text>
      </View>

      {/* Breakdown rows */}
      <View className="gap-y-2">
        {rows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name={row.icon as any} size={14} color="#6B7280" />
              <Text className="text-gray-600 dark:text-gray-400 text-[12px] ml-2">
                {row.label}
              </Text>
            </View>
            <Text className="text-gray-900 dark:text-white font-semibold text-[13px]">
              {Intl.NumberFormat("pt-BR").format(row.value)} Kg
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function MonitoringScreen() {
  const { userDetails } = useUserDetails();
  const { districtName } = useUserDistrict();
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const { groupSummary, itemBreakdown, isLoading } = useMonitoringData(
    userDetails?.district_id ?? undefined,
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle />,
      headerRight: () => <HeaderRight />,
    });
  }, [navigation]);

  return (
    <RouteProtection>
      <CustomSafeAreaView edges={["bottom"]}>
        <Animated.ScrollView
          entering={FadeIn.duration(300)}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          className="bg-gray-50 dark:bg-black"
        >
          {/* District label */}
          <View className="flex-row items-center mb-5">
            <Ionicons name="location" size={16} color="#2563EB" />
            <Text className="text-gray-700 dark:text-gray-300 text-[13px] font-medium ml-1.5">
              {districtName || "Distrito"}
            </Text>
          </View>

          {/* Navigation Cards */}
          <View className="flex-row gap-3 mb-6">
            <NavCard
              icon="people-outline"
              label="Grupos"
              subtitle="Cooperativas, associações e uniões"
              color="#2563EB"
              delay={0}
              onPress={() => router.push("/(tabs)/monitoring/groups")}
            />
            <NavCard
              icon="land-fields"
              iconFamily="material"
              label="Áreas Cultivadas"
              subtitle="Machambas e parcelas"
              color="#059669"
              delay={80}
              badge="Em breve"
              onPress={() => router.push("/(monitoring)/plots")}
            />
          </View>

          {/* Section Title */}
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <Ionicons name="bar-chart-outline" size={16} color="#6B7280" />
            </View>
            <Text className="text-gray-900 dark:text-white font-bold text-[16px] ml-2">
              Visão Geral
            </Text>
          </View>

          {/* Groups Summary */}
          <GroupsSummarySection summary={groupSummary} isLoading={isLoading} />

          {/* Transactions by Item */}
          {isLoading ? (
            <>
              <ShimmerBlock height={200} />
              <ShimmerBlock height={200} />
            </>
          ) : itemBreakdown.length > 0 ? (
            <>
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 items-center justify-center">
                  <Ionicons name="cube-outline" size={16} color="#D97706" />
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-[16px] ml-2">
                  Transacções por Produto
                </Text>
              </View>
              {itemBreakdown.map((data, index) => (
                <ItemTransactionCard
                  key={data.item}
                  data={data}
                  index={index}
                />
              ))}
            </>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 items-center">
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#9CA3AF"
              />
              <Text className="text-gray-400 dark:text-gray-500 text-[13px] mt-3 text-center">
                Nenhuma transacção registada
              </Text>
            </View>
          )}
        </Animated.ScrollView>
      </CustomSafeAreaView>
    </RouteProtection>
  );
}

// ─── Header Components ───────────────────────────────────────────────────────
const HeaderTitle = () => (
  <View className="items-center">
    <Text
      className="text-black dark:text-white text-[14px] font-bold"
      numberOfLines={1}
    >
      Monitoria
    </Text>
    <Text className="text-gray-600 dark:text-gray-400 font-mono text-[12px]">
      {commercializationCampainsdateRange}
    </Text>
  </View>
);

const HeaderRight = () => {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  return (
    <CustomPopUpMenu
      title="Monitorar"
      options={[
        {
          label: "Grupos",
          icon: (
            <Ionicons
              name="people-outline"
              size={18}
              color={isDark ? colors.white : colors.black}
            />
          ),
          action: () => router.push("/(tabs)/monitoring/groups"),
        },
        {
          label: "Áreas Cultivadas",
          icon: (
            <MaterialCommunityIcons
              name="land-fields"
              size={18}
              color={isDark ? colors.white : colors.black}
            />
          ),
          action: () => router.push("/(monitoring)/plots"),
        },
      ]}
    />
  );
};
