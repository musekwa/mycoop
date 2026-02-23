import { colors } from '@/constants/colors';
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme, View } from 'react-native';

export default function TabLayout() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Tabs
    screenOptions={{
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: colors.primary,
      tabBarStyle: {
        backgroundColor: isDarkMode ? colors.lightblack : colors.white,
        borderTopWidth: 0,
      },
    }}
      >
      <Tabs.Screen
       name="index"
       options={{
         title: 'Início',
         headerShown: false,
         tabBarIcon: ({ color, focused }) => (
           <MaterialCommunityIcons
             name="view-dashboard"
             size={22}
             color={focused ? colors.primary : isDarkMode ? colors.gray600 : colors.black}
           />
         ),
         headerRight: () => <View />,
       }}
      />

      <Tabs.Screen
					name="actors"
					options={{
						title: 'Actores',
						headerShown: false,
						tabBarIcon: ({ color, focused }) => (
							<FontAwesome6
								name="users"
								size={20}
								color={focused ? colors.primary : isDarkMode ? colors.gray600 : colors.black}
							/>
						),
					}}
				/>
    </Tabs>
  );
}
