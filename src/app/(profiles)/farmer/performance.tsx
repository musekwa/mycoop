import CustomPopUpMenu from "@/components/custom-popup-menu";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import NoContentPlaceholder from "@/components/no-content-placeholder";
import { useActionStore } from "@/store/actions/actions";
import { PopMenuOption } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { Href, useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import Animated, { SlideInDown } from "react-native-reanimated";

export default function FarmerProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { currentResource } = useActionStore();

  useEffect(() => {
    const menuOptions: PopMenuOption[] = [
      {
        label: "Actualizar Dados",
        icon: <FontAwesome name="edit" size={18} />,
        action: () => {
          // router.navigate(
          //   `/(actions)/edit?resourceName=${currentResource.name}&id=${currentResource.id}` as Href,
          // );
        },
      },
    ];
    navigation.setOptions({
      headerRight: () => <CustomPopUpMenu title="Menu" options={menuOptions} />,
    });
  }, [currentResource, navigation, router]);

  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <Animated.ScrollView
        entering={SlideInDown.duration(500)}
        className="flex-1 bg-white dark:bg-black"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <NoContentPlaceholder message="Nenhum conteúdo" />
      </Animated.ScrollView>
    </CustomSafeAreaView>
  );
}
