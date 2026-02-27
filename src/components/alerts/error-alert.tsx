import { Foundation } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { Dialog } from "react-native-simple-dialogs";

import { colors } from "@/constants/colors";

type DialogProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  title: string;
};

export default function ErrorAlert({
  visible,
  setVisible,
  title,
  message,
  setMessage,
}: DialogProps) {
  const colorScheme = useColorScheme();
  return (
    <Dialog
      animationType={"fade"}
      statusBarTranslucent={true}
      titleStyle={{ color: "red", fontSize: 20 }}
      visible={visible}
      dialogStyle={{
        backgroundColor: colorScheme === "dark" ? colors.gray800 : colors.white,
      }}
      contentInsetAdjustmentBehavior={"automatic"}
      onRequestClose={() => setVisible(!visible)}
      onTouchOutside={() => setVisible(!visible)}
    >
      <View className="min-h-12.5 space-y-3">
        <View className="items-center">
          <Foundation name="alert" size={30} color={colors.primary} />
        </View>
        <Text className="text-[16px] text-center text-black dark:text-white ">
          {message}
        </Text>
        <View className="flex items-center mx-6">
          <Pressable
            onPress={() => {
              setVisible(false);
              setMessage("");
            }}
            className="bg-[#008000] px-5 py-1 rounded-md"
          >
            <Text className="font-bold text-[18px] text-white">OK</Text>
          </Pressable>
        </View>
      </View>
    </Dialog>
  );
}
