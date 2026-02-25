import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";
import { avatarPlaceholderUri } from "@/constants/image-uris";
import { getAdminPostById } from "@/library/sqlite/selects";
import { useActionStore } from "@/store/actions/actions";
import { ResourceName } from "@/types";

type ActorListItemProps = {
  item: {
    id: string;
    surname: string;
    other_names: string;
    admin_post_id: string;
    primary_phone: string;
    secondary_phone: string;
  };
  resource_name: ResourceName;
};

export default function ActorListItem({
  item,
  resource_name,
}: ActorListItemProps) {
  const router = useRouter();
  const { setCurrentResource } = useActionStore();
  const [adminPost, setAdminPost] = useState<string | null>(null);

  const phoneNumber =
    item.primary_phone && item.primary_phone !== "N/A"
      ? item.primary_phone
      : item.secondary_phone && item.secondary_phone !== "N/A"
        ? item.secondary_phone
        : "Não disponível";
  const surname =
    item.surname?.toLowerCase().includes("company") &&
    item.surname?.split(" - ").length > 1
      ? item.surname?.split(" - ")[0]
      : item.surname?.toLowerCase().includes("company")
        ? `(Empresa)`
        : item.surname;

  const handleNavigation = (id: string) => {
    setCurrentResource({
      id: id,
      name: resource_name,
    });
    router.navigate(`/(profiles)/${resource_name.toLowerCase()}` as Href);
  };

  useEffect(() => {
    const fetchAdminPost = async () => {
      getAdminPostById(item.admin_post_id, (adminPost) => {
        if (adminPost) {
          setAdminPost(adminPost.name);
        }
      });
    };

    fetchAdminPost();
  }, [item.admin_post_id]);

  return (
    <TouchableOpacity
      onPress={() => handleNavigation(item.id)}
      activeOpacity={0.7}
      className="relative flex flex-row gap-x-2 items-center p-2 border m-2 rounded-md border-slate-50 shadow-sm shadow-black bg-gray-50 dark:border-slate-600 dark:bg-slate-900"
    >
      <Image
        source={{ uri: avatarPlaceholderUri }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
        }}
      />
      <View className="flex flex-col gap-y-0 flex-1 pb-3">
        <View className="flex flex-row gap-x-2 flex-wrap items-center">
          <Text
            style={{}}
            className="text-black dark:text-white font-bold text-[15px]"
          >
            {item.other_names}
          </Text>
          <Text
            style={{}}
            className="text-black dark:text-white font-bold text-[15px]"
          >
            {surname}
          </Text>
        </View>
        <View className="flex flex-row gap-x-1">
          <Feather name="phone" size={15} color={colors.primary} />
          <Text className="text-black dark:text-white">{phoneNumber}</Text>
        </View>
      </View>
      <View className="absolute right-0 bottom-0 w-full">
        <View>
          <Text className="text-black dark:text-white text-[10px] text-right">
            {adminPost}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
