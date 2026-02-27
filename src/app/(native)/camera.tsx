import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { Href, Redirect, useRouter } from "expo-router";
import * as React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { pickImage } from "@/helpers/pick-image";
import { useActionStore } from "@/store/actions/actions";

import CustomProgressAlert from "@/components/alerts/custom-progress-alert";
import ErrorAlert from "@/components/alerts/error-alert";
import ObscuraButton from "@/components/buttons/obscura-button";
import CameraZoomControls from "@/components/camera-zoom-controls";
import { ResourceName } from "@/types";

export default function Page() {
  const { setBase64, setReloading, reloading, currentResource } =
    useActionStore();
  const { hasPermission } = useCameraPermission();
  // const microphonePermission = Camera.getMicrophonePermissionStatus()
  const directToPermission = !hasPermission;
  const [cameraPosition, setCameraPosition] = React.useState<"back" | "front">(
    "back",
  );
  const device = useCameraDevice(cameraPosition);
  const [zoom, setZoom] = React.useState(device?.neutralZoom);
  const [exposure, setExposure] = React.useState(0);
  const [flash, setFlash] = React.useState<"off" | "on">("off");
  const [torch, setTorch] = React.useState<"off" | "on">("off");
  const camera = React.useRef<Camera>(null);
  const [showZoomControls, setShowZoomControls] = React.useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  // const navigation = useNavigation()

  const toggleFlash = () => {
    setFlash((f) => (f === "off" ? "on" : "off"));
  };

  const handleBack = () => {
    console.log("currentResource", currentResource);
    // console.log('addActionType', addActionType)
    if (
      currentResource.id.length > 10 &&
      currentResource.name === ResourceName.FARMER
    ) {
      router.navigate(`/(profiles)/farmer` as Href);
    } else if (
      currentResource.id.length > 10 &&
      currentResource.name === ResourceName.GROUP
    ) {
      router.navigate(`/(profiles)/group` as Href);
    } else {
      router.back();
    }
  };

  const uploadPhoto = async () => {
    try {
      const base64 = await pickImage();
      if (base64) {
        setBase64(base64);
        router.navigate("/(native)/media-preview" as Href);
      }
    } catch (error) {
      console.log("Error uploading image", error);
      setHasError(true);
      setErrorMessage("Erro ao carregar a foto, tente mais tarde.");
    }
  };

  const takePicture = async () => {
    try {
      if (!camera.current) throw new Error("Camera not found");
      const photo = await camera.current.takePhoto({
        flash: flash,
        // enableAutoDistortionCorrection: true,
        enableShutterSound: true,
      });
      setReloading(true);
      const result = await ImageManipulator.manipulateAsync(photo.path, [], {
        base64: true,
      });

      if (result.base64) {
        setBase64(`data:image/jpeg;base64,${result.base64}`);
        router.navigate("/(native)/media-preview" as Href);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (directToPermission) {
    return <Redirect href="/(native)/device-permissions" />;
  }

  if (!device) return <></>;

  return (
    <>
      <View style={{ flex: 1 }}>
        <View className="flex-1 bg-white dark:bg-black">
          <View style={{ flex: 3, borderRadius: 0, overflow: "hidden" }}>
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[styles.backButton, { top: insets.top + 8 }]}
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Camera
              ref={camera}
              style={{ flex: 1 }}
              device={device}
              isActive={true}
              zoom={zoom}
              resizeMode="cover"
              exposure={exposure}
              torch={torch}
              photo={true}
            />
            <View className="absolute bottom-0 right-0 p-2 opacity-50 bg-black/50 rounded-tl-md">
              <Text className="text-white">Zoom: x{zoom}</Text>
            </View>
          </View>
          {showZoomControls ? (
            <CameraZoomControls
              setZoom={setZoom}
              setShowZoomControls={setShowZoomControls}
              zoom={zoom ?? 1}
            />
          ) : (
            <View style={{ flex: 1 }}>
              {/* Middle section */}
              <View
                style={{
                  flex: 0.7,
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                }}
                className="bg-black"
              >
                <ObscuraButton
                  iconName={
                    flash === "on" ? "flash-outline" : "flash-off-outline"
                  }
                  onPress={toggleFlash}
                  containerStyle={{ alignSelf: "center" }}
                />
                <ObscuraButton
                  iconName="camera-reverse-outline"
                  onPress={() =>
                    setCameraPosition((p) => (p === "back" ? "front" : "back"))
                  }
                  containerStyle={{ alignSelf: "center" }}
                />
                <ObscuraButton
                  iconName="image-outline"
                  onPress={async () => {
                    await uploadPhoto();
                  }}
                  containerStyle={{ alignSelf: "center" }}
                />
              </View>

              {/* bottom section */}
              <View
                style={{
                  flex: 1.1,
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
                className="bg-black"
              >
                <ObscuraButton
                  iconSize={40}
                  title="+/-"
                  onPress={() => {
                    // setShowZoomControls((s) => !s)
                  }}
                  containerStyle={{ alignSelf: "center" }}
                />
                <TouchableHighlight onPress={() => takePicture()}>
                  <FontAwesome5
                    name="dot-circle"
                    size={55}
                    color={colors.primary}
                  />
                </TouchableHighlight>
                <ObscuraButton
                  iconSize={40}
                  title="1x"
                  onPress={() => {
                    // setShowExposureControls((s) => !s)
                  }}
                  containerStyle={{ alignSelf: "center" }}
                />
              </View>
            </View>
          )}
          <ErrorAlert
            title=""
            visible={hasError}
            message={errorMessage}
            setVisible={setHasError}
            setMessage={setErrorMessage}
          />
        </View>
      </View>
      <CustomProgressAlert isLoading={reloading} setIsLoading={setReloading} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});
