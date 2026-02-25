import ErrorAlert from "@/components/alerts/error-alert";
import CustomBottomSheetModal from "@/components/bottom-sheets/custom-bottom-sheet-modal";
import CoordinatesHandler from "@/components/coordinates-handler";
import { colors } from "@/constants/colors";
import {
  useAddressById,
  useContactById,
  useUserDetails,
} from "@/hooks/queries";
import { getDistrictById } from "@/library/sqlite/selects";
import { useActionStore } from "@/store/actions/actions";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

interface ActorContactInfoProps {
  contact_id: string;
  address_id: string;
}

export default function ActorContactInfo({
  contact_id,
  address_id,
}: ActorContactInfoProps) {
  const { primaryPhone, secondaryPhone } = useContactById(contact_id);
  const { districtName, lat, long } = useAddressById(address_id);
  const [userDistrictName, setUserDistrictName] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const { userDetails } = useUserDetails();
  const { setDrawerStatus } = useActionStore();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (userDetails?.district_id) {
      getDistrictById(userDetails.district_id).then((district) => {
        setUserDistrictName(district);
      });
    }
  }, [userDetails?.district_id]);

  const captureLocation = async () => {
    if (userDistrictName !== districtName) {
      setHasPermissionError(true);
      setErrorMessage(
        "Não é possível capturar a localização de um recurso que não está no mesmo distrito",
      );
      return;
    }
    try {
      if (!status?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          setShowErrorAlert(true);
          setErrorMessage("Permissão de localização negada");
          return;
        }
      }
      // Close drawer before opening bottom sheet
      setDrawerStatus("closed");
      bottomSheetModalRef.current?.present();
    } catch (err) {
      console.log("Error requesting permissions", err);
      setShowErrorAlert(true);
      setErrorMessage("Erro ao solicitar permissão de localização");
    }
  };

  const handleDismissModal = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const hasGPSCoordinates = Number(lat) && Number(long);
  const hasPermissionToCaptureLocation = userDistrictName === districtName;

  return (
    <>
      <View className="flex flex-col gap-y-2 py-3">
        <View className="flex flex-row gap-x-1 items-center">
          <TouchableOpacity
            className="flex flex-row gap-x-1 items-center"
            onPress={() =>
              Linking.openURL(`tel:${primaryPhone ?? secondaryPhone ?? "N/A"}`)
            }
          >
            <Feather name="phone" size={15} color={colors.primary} />
            <Text className="text-[12px] text-black dark:text-white">
              {primaryPhone ?? secondaryPhone ?? "N/A"}
            </Text>
          </TouchableOpacity>
        </View>

        {hasPermissionToCaptureLocation && (
          <TouchableOpacity
            onPress={captureLocation}
            className={`rounded-lg flex flex-row items-center space-x-2 ${
              hasGPSCoordinates
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-gray-50 dark:bg-gray-900/20"
            }`}
          >
            <Ionicons
              name={hasGPSCoordinates ? "location" : "location-outline"}
              size={20}
              color={hasGPSCoordinates ? colors.primary : colors.gray600}
            />

            <View className="">
              <Text className="text-[12px] font-normal text-black dark:text-white">
                {districtName}
              </Text>

              {hasGPSCoordinates ? (
                <Text className="text-xs text-gray-600 dark:text-gray-300">
                  {Number(lat).toFixed(6)}, {Number(long).toFixed(6)}
                </Text>
              ) : (
                <Text className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Capture a localização
                </Text>
              )}
            </View>
            {!hasGPSCoordinates && (
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      <CustomBottomSheetModal
        bottomSheetModalRef={bottomSheetModalRef}
        handleDismissModalPress={handleDismissModal}
      >
        <View className="p-4">
          <CoordinatesHandler
            errorMessage={errorMessage}
            showErrorAlert={showErrorAlert}
            setShowErrorAlert={setShowErrorAlert}
            setErrorMessage={setErrorMessage}
            address_id={address_id || ""}
            setShowCapturingCoordinatesDialog={() => handleDismissModal()}
          />
        </View>
      </CustomBottomSheetModal>
      <ErrorAlert
        visible={hasPermissionError}
        setVisible={setHasPermissionError}
        message={errorMessage}
        setMessage={setErrorMessage}
        title=""
      />
    </>
  );
}
