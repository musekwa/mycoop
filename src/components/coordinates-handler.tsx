import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from "react-native";

import SuccessAlert from "@/components/alerts/success-alert";
import ConfirmOrCancelButtons from "@/components/buttons/confirm-or-cancel-button";
import { colors } from "@/constants/colors";
import { mozMapPatternUri } from "@/constants/image-uris";
import { AddressDetailRecord, TABLES } from "@/library/powersync/app-schemas";
import { updateOne } from "@/library/powersync/sql-statements";
interface CoordinatesHandlerProps {
  setShowCapturingCoordinatesDialog: (show: boolean) => void;
  setShowErrorAlert: (show: boolean) => void;
  setErrorMessage: (message: string) => void;
  showErrorAlert: boolean;
  errorMessage: string;
  address_id: string;
}

const LocationDisplay = ({
  location,
}: {
  location: Location.LocationObject;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-green-200"
    >
      <View className="flex flex-col items-center">
        <View className="bg-green-100 rounded-full p-3 mb-3">
          <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
        </View>
        <Text className="text-green-700 font-semibold text-sm mb-2">
          Localização Capturada!
        </Text>
        <View className="bg-gray-50 rounded-lg px-3 py-2">
          <Text className="text-gray-700 text-xs font-mono">
            Latitude: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text className="text-gray-700 text-xs font-mono">
            Longitude: {location.coords.longitude.toFixed(6)}
          </Text>
        </View>
        <Text className="text-gray-500 text-xs mt-2">
          Precisão: ±{location.coords.accuracy?.toFixed(0) || "N/A"}m
        </Text>
      </View>
    </Animated.View>
  );
};

const WaitingDisplay = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);
    Animated.loop(pulse).start();
  }, []);

  return (
    <Animated.View
      style={{ transform: [{ scale: pulseAnim }] }}
      className="flex flex-col items-center"
    >
      <View className="bg-blue-100 rounded-full p-4 mb-4">
        <Ionicons name="navigate" size={40} color={colors.primary} />
      </View>
      <View className="text-center px-6">
        <Text className="text-gray-800 dark:text-gray-200 font-semibold text-sm mb-2 text-center">
          Pronto para capturar localização
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed text-center">
          Toque em "Capturar" para obter a localização actual com alta precisão
        </Text>
        <View className="flex flex-row items-center justify-center mt-3 gap-4">
          <View className="flex flex-row items-center gap-1">
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={colors.gray600}
            />
            <Text className="text-gray-500 text-xs">Seguro</Text>
          </View>
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="speedometer" size={16} color={colors.gray600} />
            <Text className="text-gray-500 text-xs">Alta precisão</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const ErrorDisplay = ({ message }: { message: string }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shake = Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
    shake.start();
  }, []);

  return (
    <Animated.View
      style={{ transform: [{ translateX: shakeAnim }] }}
      className="bg-red-50 border border-red-200 rounded-2xl p-4"
    >
      <View className="flex flex-col items-center">
        <View className="bg-red-100 rounded-full p-3 mb-3">
          <Ionicons name="warning-outline" size={32} color={colors.red} />
        </View>
        <Text className="text-red-700 font-semibold text-center mb-2">
          Erro na Captura
        </Text>
        <Text className="text-red-600 text-center text-sm">{message}</Text>
        <Text className="text-gray-500 text-xs text-center mt-2">
          Verifique suas permissões e conexão com a internet
        </Text>
      </View>
    </Animated.View>
  );
};

export default function CoordinatesHandler({
  setShowCapturingCoordinatesDialog,
  setShowErrorAlert,
  setErrorMessage,
  showErrorAlert,
  errorMessage,
  address_id,
}: CoordinatesHandlerProps) {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasSavedCoordinates, setHasSavedCoordinates] = useState(false);
  const captureProgress = useRef(new Animated.Value(0)).current;

  const handleError = (message: string) => {
    setShowErrorAlert(true);
    setErrorMessage(message);
  };

  const saveCoordinates = async () => {
    if (!location) return;

    try {
      await updateOne<AddressDetailRecord>(
        `UPDATE ${TABLES.ADDRESS_DETAILS} SET gps_lat = ?, gps_long = ? WHERE id = ?`,
        [
          String(location.coords.latitude),
          String(location.coords.longitude),
          address_id,
        ],
      );
      setHasSavedCoordinates(true);
    } catch (error) {
      console.log("Error saving coordinates", error);
      handleError("Erro ao gravar coordenadas");
    }
  };

  const captureLocation = async () => {
    setIsCapturing(true);
    captureProgress.setValue(0);

    // Animate progress bar
    Animated.timing(captureProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    try {
      if (!status?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          handleError("Permissão de localização negada");
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
    } catch (err: any) {
      console.log("Error handling coordinates", err);
      handleError("Erro ao capturar localização");
    }
    setIsCapturing(false);
    captureProgress.setValue(0);
  };

  const handleConfirm = () => {
    if (location) {
      saveCoordinates();
    } else {
      captureLocation();
    }
  };

  useEffect(() => {
    if (hasSavedCoordinates) {
      const timer = setTimeout(() => {
        setShowCapturingCoordinatesDialog(false);
        setHasSavedCoordinates(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSavedCoordinates, setShowCapturingCoordinatesDialog]);

  const CapturingDisplay = () => (
    <View className="flex flex-col items-center">
      <View className="relative mb-6">
        <View className="bg-blue-100 rounded-full p-6">
          <Ionicons name="location" size={48} color={colors.primary} />
        </View>
        <View className="absolute -bottom-1 -right-1">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
      <Text className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-3">
        Capturando localização...
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
        Obtendo coordenadas GPS com alta precisão
      </Text>
      <View className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          style={{
            width: captureProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            }),
            backgroundColor: colors.primary,
          }}
          className="h-full rounded-full"
        />
      </View>
      <Text className="text-gray-500 text-xs mt-2">Aguarde um momento...</Text>
    </View>
  );

  const renderContent = () => {
    if (showErrorAlert) return <ErrorDisplay message={errorMessage} />;
    if (location) return <LocationDisplay location={location} />;
    if (isCapturing) return <CapturingDisplay />;
    return <WaitingDisplay />;
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-t-3xl overflow-hidden">
      <View className="bg-linear-to-r from-blue-500 to-green-500 px-6 pt-4 pb-6">
        <View className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />
        <Text className="text-white font-bold text-lg text-center">
          {!location ? "Capturar Coordenadas GPS" : "Coordenadas Capturadas"}
        </Text>
        <Text className="text-white/80 text-sm text-center mt-1">
          {!location
            ? "Obtenha a localização actual"
            : "Localização obtida com sucesso"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        className="bg-gray-50 dark:bg-gray-900"
        showsVerticalScrollIndicator={false}
      >
        <View className="min-h-75 justify-center items-center px-6">
          {!hasSavedCoordinates ? (
            <View className="w-full">
              <ImageBackground
                source={{ uri: mozMapPatternUri }}
                className="absolute inset-0 opacity-5 rounded-2xl"
                imageStyle={{ borderRadius: 16 }}
              />
              <View className="relative">{renderContent()}</View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <SuccessAlert
                visible={hasSavedCoordinates}
                setVisible={setHasSavedCoordinates}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View className="bg-white dark:bg-gray-800 px-6 py-4">
        <ConfirmOrCancelButtons
          onCancel={() => setShowCapturingCoordinatesDialog(false)}
          onConfirm={handleConfirm}
          cancelText="Cancelar"
          confirmText={location ? "Gravar" : "Capturar"}
        />
      </View>
    </View>
  );
}
