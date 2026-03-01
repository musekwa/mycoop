import { colors } from "@/constants/colors";
import { PopMenuOption } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, useColorScheme, View } from "react-native";
import { Divider } from "react-native-paper";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { IconComponentType } from "./dynamic-icon";

type CustomPopUpMenuProps = {
  options: PopMenuOption[];
  icon?: IconComponentType;
  title?: string;
};

export default function CustomPopUpMenu({
  options,
  icon,
  title = "Menu",
}: CustomPopUpMenuProps) {
  const isDarkMode = useColorScheme() === "dark";
  return (
    <Menu
    // renderer={Popover}
    >
      <MenuTrigger
        style={{
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 100,
          backgroundColor: isDarkMode ? colors.black : colors.gray50,
        }}
      >
        {icon ? (
          icon
        ) : (
          <FontAwesome
            name="ellipsis-v"
            size={20}
            color={isDarkMode ? colors.white : colors.black}
          />
        )}
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            width: 230,
            paddingLeft: 10,
            paddingRight: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: isDarkMode ? "#1a1a1a" : colors.white,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0.4 : 0.15,
            shadowRadius: 8,
            elevation: 8,
          },
        }}
      >
        <View className="ml-1 mb-1">
          <Text
            className="font-bold py-2"
            style={{ color: isDarkMode ? colors.white : colors.black }}
          >
            {title}
          </Text>
          <Divider
            style={{ backgroundColor: isDarkMode ? "#333" : "#e0e0e0" }}
          />
        </View>
        {options.map((option, index) => {
          return (
            <View key={index}>
              <MenuOption onSelect={() => option.action()}>
                <View className="flex flex-row gap-x-2 my-2 items-center">
                  {option.icon}
                  <Text
                    style={{ color: isDarkMode ? colors.white : colors.black }}
                  >
                    {option.label}
                  </Text>
                </View>
              </MenuOption>
              {index < options.length - 1 && (
                <Divider
                  style={{ backgroundColor: isDarkMode ? "#333" : "#e0e0e0" }}
                />
              )}
            </View>
          );
        })}
      </MenuOptions>
    </Menu>
  );
}
