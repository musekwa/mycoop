import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { StatusBar, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { ampcmWhiteFullLogoUri } from "@/constants/image-uris";
import { getTransactedItemPortugueseName } from "@/helpers/trades";
import { OrganizationTypes, TransactionFlowType } from "@/types";

import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import CustomShimmerPlaceholder from "@/components/skeletons/custom-shimmer-placeholder";
import RouteProtection from "@/features/auth/route-protection";
import { useQueryMany, useUserDetails } from "@/hooks/queries";
import useUserDistrict from "@/hooks/ue-user-district";
import { TABLES, UserDetailsRecord } from "@/library/powersync/app-schemas";
import { getAdminPostsByDistrictId } from "@/library/sqlite/selects";
import { getUserSession } from "@/library/supabase/user-auth";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";

// ─── Data Hook ───────────────────────────────────────────────────────────────
const useHomeData = (userDetails: UserDetailsRecord | null) => {
  const [adminPosts, setAdminPosts] = useState<{ id: string; name: string }[]>(
    [],
  );

  const districtId = userDetails?.district_id;
  const shouldQuery = !!districtId;

  // Farmers filtered by category = FARMER
  const { data: farmers, isLoading: isFarmersLoading } = useQueryMany<{
    id: string;
    admin_post_id: string;
  }>(
    shouldQuery
      ? `
      SELECT 
        a.id,
        addr.admin_post_id
      FROM ${TABLES.ACTORS} a
      INNER JOIN ${TABLES.ADDRESS_DETAILS} addr 
        ON addr.owner_id = a.id AND addr.owner_type = 'FARMER'
      WHERE a.category = 'FARMER' AND addr.district_id = '${districtId}'
      GROUP BY a.id, addr.admin_post_id
    `
      : "",
  );

  // Groups (cooperatives, associations, unions)
  const { data: organizations, isLoading: isOrganizationsLoading } =
    useQueryMany<{
      id: string;
      admin_post_id: string;
      organization_type: OrganizationTypes;
    }>(
      shouldQuery
        ? `
      SELECT 
        a.id,
        ac.subcategory as organization_type,
        addr.admin_post_id
      FROM ${TABLES.ACTORS} a
      INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
      INNER JOIN ${TABLES.ADDRESS_DETAILS} addr 
        ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
      WHERE addr.district_id = '${districtId}' AND a.category = 'GROUP'
    `
        : "",
    );

  // Aggregated quantities by item across all groups in the district
  const { data: aggregatedByItem, isLoading: isAggregatedLoading } =
    useQueryMany<{
      item: string;
      total_quantity: number;
    }>(
      shouldQuery
        ? `
      SELECT 
        ot.item,
        SUM(
          CASE 
            WHEN ot.transaction_type IN ('${TransactionFlowType.AGGREGATED}', '${TransactionFlowType.TRANSFERRED_IN}')
            THEN ot.quantity 
            WHEN ot.transaction_type IN ('${TransactionFlowType.SOLD}', '${TransactionFlowType.TRANSFERRED_OUT}', '${TransactionFlowType.LOST}')
            THEN -ot.quantity
            ELSE 0
          END
        ) as total_quantity
      FROM ${TABLES.ORGANIZATION_TRANSACTIONS} ot
      INNER JOIN ${TABLES.ACTORS} a ON a.id = ot.store_id
      INNER JOIN ${TABLES.ADDRESS_DETAILS} addr 
        ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
      WHERE addr.district_id = '${districtId}'
        AND ot.item IS NOT NULL
      GROUP BY ot.item
    `
        : "",
    );

  // Fetch admin posts
  useEffect(() => {
    if (!shouldQuery || !districtId) {
      setAdminPosts([]);
      return;
    }
    const fetchAdminPosts = async () => {
      try {
        const posts = await getAdminPostsByDistrictId(districtId);
        setAdminPosts(
          posts?.length ? posts.map((p) => ({ id: p.id, name: p.name })) : [],
        );
      } catch (error) {
        console.error("Error getting admin posts:", error);
        setAdminPosts([]);
      }
    };
    fetchAdminPosts();
  }, [shouldQuery, districtId]);

  // Process data by admin post
  const dataByAdminPost = useMemo(() => {
    if (!adminPosts.length) return [];
    return adminPosts.map((post) => {
      const postFarmers = (farmers || []).filter(
        (f) => f.admin_post_id === post.id,
      );
      const postOrgs = (organizations || []).filter(
        (o) => o.admin_post_id === post.id,
      );
      return {
        adminPost: post,
        farmerCount: postFarmers.length,
        cooperativeCount: postOrgs.filter(
          (o) => o.organization_type === OrganizationTypes.COOPERATIVE,
        ).length,
        associationCount: postOrgs.filter(
          (o) => o.organization_type === OrganizationTypes.ASSOCIATION,
        ).length,
        unionCount: postOrgs.filter(
          (o) => o.organization_type === OrganizationTypes.COOP_UNION,
        ).length,
      };
    });
  }, [adminPosts, farmers, organizations]);

  const totalFarmers = farmers?.length || 0;
  const totalCooperatives =
    organizations?.filter(
      (o) => o.organization_type === OrganizationTypes.COOPERATIVE,
    ).length || 0;
  const totalAssociations =
    organizations?.filter(
      (o) => o.organization_type === OrganizationTypes.ASSOCIATION,
    ).length || 0;
  const totalUnions =
    organizations?.filter(
      (o) => o.organization_type === OrganizationTypes.COOP_UNION,
    ).length || 0;
  const totalGroups = totalCooperatives + totalAssociations + totalUnions;

  return {
    dataByAdminPost,
    aggregatedByItem: aggregatedByItem || [],
    totalFarmers,
    totalGroups,
    totalCooperatives,
    totalAssociations,
    totalUnions,
    isLoading:
      isFarmersLoading || isOrganizationsLoading || isAggregatedLoading,
  };
};

// ─── Shimmer Placeholder ─────────────────────────────────────────────────────
const ShimmerRow = () => (
  <View className="flex-row gap-3 mb-3">
    {[1, 2, 3].map((_, i) => (
      <CustomShimmerPlaceholder
        key={i}
        style={{ flex: 1, height: 80, borderRadius: 12 }}
      />
    ))}
  </View>
);

// ─── Hero Summary Card ───────────────────────────────────────────────────────
const HeroCard = ({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  delay: number;
}) => (
  <Animated.View
    entering={FadeInDown.duration(400).delay(delay).springify()}
    className="flex-1 rounded-2xl p-4 border"
    style={{
      backgroundColor: `${color}12`,
      borderColor: `${color}30`,
    }}
  >
    <View
      className="w-9 h-9 rounded-full items-center justify-center mb-2"
      style={{ backgroundColor: `${color}20` }}
    >
      <Ionicons name={icon as any} size={18} color={color} />
    </View>
    <Text className="font-bold text-[26px]" style={{ color }}>
      {Intl.NumberFormat("pt-BR").format(value)}
    </Text>
    <Text className="text-gray-500 dark:text-gray-400 text-[11px] mt-1">
      {label}
    </Text>
  </Animated.View>
);

// ─── Aggregated Stock Card ───────────────────────────────────────────────────
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

const AggregatedStockSection = ({
  data,
  isLoading,
}: {
  data: { item: string; total_quantity: number }[];
  isLoading: boolean;
}) => {
  if (isLoading) return <ShimmerRow />;

  const itemData = data
    .filter((d) => d.item && d.total_quantity != null)
    .map((d) => ({
      item: d.item,
      quantity: Math.max(d.total_quantity || 0, 0),
    }));
  const totalStock = itemData.reduce((sum, d) => sum + d.quantity, 0);

  if (itemData.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-4">
        <View className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
          <Ionicons name="cube-outline" size={18} color="#D97706" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-gray-900 dark:text-white font-bold text-[16px]">
            Estoque Agregado
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-[11px]">
            Total: {Intl.NumberFormat("pt-BR").format(totalStock)} Kg
          </Text>
        </View>
      </View>
      <View className="flex-row gap-3">
        {itemData.map((d, index) => {
          const color = ITEM_COLORS[d.item] || "#6B7280";
          const icon = ITEM_ICONS[d.item] || "ellipse-outline";
          const pct = totalStock > 0 ? (d.quantity / totalStock) * 100 : 0;
          return (
            <Animated.View
              key={d.item}
              entering={FadeInDown.duration(400)
                .delay(index * 80)
                .springify()}
              className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${color}18` }}
              >
                <Ionicons name={icon as any} size={16} color={color} />
              </View>
              <Text className="font-bold text-[18px]" style={{ color }}>
                {Intl.NumberFormat("pt-BR").format(d.quantity)}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-[10px]">
                Kg
              </Text>
              <Text
                className="text-[10px] mt-1 font-medium"
                numberOfLines={1}
                style={{ color }}
              >
                {getTransactedItemPortugueseName(d.item)}
              </Text>
              <View className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: color,
                    width: `${pct}%` as unknown as number,
                  }}
                />
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

// ─── Admin Post Breakdown ────────────────────────────────────────────────────
const AdminPostBreakdown = ({
  data,
  isLoading,
}: {
  data: Array<{
    adminPost: { id: string; name: string };
    farmerCount: number;
    cooperativeCount: number;
    associationCount: number;
    unionCount: number;
  }>;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <View>
        {[1, 2].map((_, i) => (
          <View key={i} className="mb-3">
            <CustomShimmerPlaceholder
              style={{ width: "100%", height: 120, borderRadius: 16 }}
            />
          </View>
        ))}
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="py-8 items-center">
        <Ionicons name="map-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-400 dark:text-gray-500 text-[13px] mt-2">
          Nenhum posto administrativo encontrado
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-y-3">
      {data.map((item, index) => {
        const totalGroups =
          item.cooperativeCount + item.associationCount + item.unionCount;
        return (
          <Animated.View
            key={item.adminPost.id}
            entering={FadeInDown.duration(400)
              .delay(index * 80)
              .springify()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
          >
            {/* Admin post header */}
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                <Ionicons name="location" size={14} color="#2563EB" />
              </View>
              <Text
                className="text-gray-900 dark:text-white font-semibold text-[14px] ml-2 flex-1"
                numberOfLines={1}
              >
                {item.adminPost.name}
              </Text>
            </View>

            {/* Stats row */}
            <View className="flex-row gap-2">
              {/* Farmers */}
              <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium mb-1">
                  Produtores
                </Text>
                <Text className="text-emerald-700 dark:text-emerald-300 font-bold text-[20px]">
                  {item.farmerCount}
                </Text>
              </View>
              {/* Groups breakdown */}
              <View className="flex-1 bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3">
                <Text className="text-violet-600 dark:text-violet-400 text-[10px] font-medium mb-1">
                  Grupos ({totalGroups})
                </Text>
                <View className="gap-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400 text-[9px]">
                      Cooperativas
                    </Text>
                    <Text className="text-violet-700 dark:text-violet-300 font-bold text-[11px]">
                      {item.cooperativeCount}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400 text-[9px]">
                      Associações
                    </Text>
                    <Text className="text-violet-700 dark:text-violet-300 font-bold text-[11px]">
                      {item.associationCount}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400 text-[9px]">
                      Uniões
                    </Text>
                    <Text className="text-violet-700 dark:text-violet-300 font-bold text-[11px]">
                      {item.unionCount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { userDetails, isLoading: isUserDetailsLoading } = useUserDetails();
  const { districtName } = useUserDistrict();
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  const {
    dataByAdminPost,
    aggregatedByItem,
    totalFarmers,
    totalGroups,
    totalCooperatives,
    totalAssociations,
    totalUnions,
    isLoading,
  } = useHomeData(userDetails);

  const isDataReady = !isUserDetailsLoading && !isLoading;

  useEffect(() => {
    const checkSession = async () => {
      const { session } = await getUserSession();
      setSession(session);
      if (!session) {
        router.replace("/(auth)/login");
      }
    };
    if (!session) {
      checkSession();
    }
  }, [session, router]);

  return (
    <RouteProtection>
      <CustomSafeAreaView edges={["top", "bottom"]}>
        <Animated.ScrollView
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          contentContainerStyle={{
            paddingTop: StatusBar.currentHeight || 20,
            flexGrow: 1,
            paddingBottom: 20,
            backgroundColor: "#008000",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Green Header ── */}
          <View className="bg-[#008000]">
            <View className="items-center justify-center">
              <Image
                source={{ uri: ampcmWhiteFullLogoUri }}
                style={{ width: 160, height: 80 }}
                contentFit="contain"
              />
            </View>
            <View className="pb-4 gap-2 px-4 flex-row items-center">
              <Ionicons name="location-outline" size={18} color="white" />
              <Text className="text-white text-[14px] font-semibold">
                {districtName || "Distrito não definido"}
              </Text>
            </View>
          </View>

          {/* ── Content Area ── */}
          <View className="flex-1 pt-6 px-4 rounded-t-3xl bg-gray-50 dark:bg-black">
            {/* Hero summary cards */}
            <Text className="text-gray-900 dark:text-white font-bold text-[20px] mb-4">
              Visão Geral
            </Text>
            {!isDataReady ? (
              <ShimmerRow />
            ) : (
              <View className="flex-row gap-3 mb-6">
                <HeroCard
                  icon="people-outline"
                  label="Produtores"
                  value={totalFarmers}
                  color="#059669"
                  delay={0}
                />
                <HeroCard
                  icon="business-outline"
                  label="Grupos"
                  value={totalGroups}
                  color="#2563EB"
                  delay={80}
                />
              </View>
            )}

            {/* Group type breakdown */}
            {isDataReady && totalGroups > 0 && (
              <View className="flex-row gap-3 mb-6">
                <HeroCard
                  icon="people-outline"
                  label="Cooperativas"
                  value={totalCooperatives}
                  color="#7C3AED"
                  delay={160}
                />
                <HeroCard
                  icon="people-circle-outline"
                  label="Associações"
                  value={totalAssociations}
                  color="#D97706"
                  delay={240}
                />
                <HeroCard
                  icon="link-outline"
                  label="Uniões"
                  value={totalUnions}
                  color="#0891B2"
                  delay={320}
                />
              </View>
            )}

            {/* Aggregated Stock */}
            <AggregatedStockSection
              data={aggregatedByItem}
              isLoading={!isDataReady}
            />

            {/* Admin Post Breakdown */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                  <Ionicons name="map-outline" size={18} color="#2563EB" />
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-[16px] ml-3">
                  Por Posto Administrativo
                </Text>
              </View>
              <AdminPostBreakdown
                data={dataByAdminPost}
                isLoading={!isDataReady}
              />
            </View>
          </View>
        </Animated.ScrollView>
      </CustomSafeAreaView>
      <ExpoStatusBar style="light" backgroundColor="#008000" />
    </RouteProtection>
  );
}
