import { Ionicons } from "@expo/vector-icons";
import * as ExpoMediaLibrary from "expo-media-library";
import {
  Href,
  RelativePathString,
  useNavigation,
  useRouter,
} from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useCameraPermission } from "react-native-vision-camera";

import ConfirmDialog from "@/components/dialog-boxes/confirm-dialog";
import { colors } from "@/constants/colors";
// import HeroCard from "@/components/auth/hero-card";
import BackButton from "@/components/buttons/back-button";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import { useHeaderOptions } from "@/hooks/use-navigation-search";
import { useActionStore } from "@/store/actions/actions";
import { ResourceName } from "@/types";

type PermissionSwitchProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
};

function PermissionSwitch({
  icon,
  title,
  description,
  value,
  onValueChange,
}: PermissionSwitchProps) {
  const isDark = useColorScheme() === "dark";

  const handleToggle = (newValue: boolean) => {
    if (newValue) {
      onValueChange(true);
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View
      style={[
        styles.permissionCard,
        { backgroundColor: isDark ? "#1e293b" : "#f8fafc" },
      ]}
    >
      <View style={styles.permissionIcon}>
        <Ionicons
          name={icon}
          size={24}
          color={value ? colors.primary : isDark ? "#94a3b8" : "#475569"}
        />
      </View>
      <View style={styles.permissionContent}>
        <Text
          style={[
            styles.permissionTitle,
            { color: isDark ? "#f1f5f9" : "#0f172a" },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.permissionDescription,
            { color: isDark ? "#94a3b8" : "#475569" },
          ]}
        >
          {description}
        </Text>
      </View>
      <Switch
        trackColor={{ false: "#cbd5e1", true: colors.primary }}
        thumbColor="#fff"
        value={value}
        onValueChange={handleToggle}
      />
    </View>
  );
}

export default function PermissionsScreen() {
  const { currentResource, addActionType } = useActionStore();
  const router = useRouter();
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ExpoMediaLibrary.usePermissions();

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Local state to track user's permission choices (default to false)
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [mediaLibraryEnabled, setMediaLibraryEnabled] = useState(false);

  const handleCameraToggle = async (request: boolean) => {
    setCameraEnabled(request);
    if (request) await requestCameraPermission();
  };

  const handleMediaLibraryToggle = async (request: boolean) => {
    setMediaLibraryEnabled(request);
    if (request) await requestMediaLibraryPermission();
  };

  const handleBackNavigationUrl = () => {
    if (
      currentResource.id.length > 10 &&
      currentResource.name === ResourceName.FARMER
    ) {
      return "/(profiles)/farmer";
    } else if (
      currentResource.id.length > 10 &&
      currentResource.name === ResourceName.GROUP
    ) {
      return "/(profiles)/group";
    } else {
      return "/(tabs)";
    }
  };

  // Check if user has enabled any permissions (not actual system permissions)
  const anyPermissionEnabled = cameraEnabled || mediaLibraryEnabled;

  // Check if all requested permissions are actually granted by the system
  const allGranted =
    anyPermissionEnabled &&
    (!cameraEnabled || hasCameraPermission) &&
    (!mediaLibraryEnabled || (mediaLibraryPermission?.granted ?? false));

  useHeaderOptions();
  useEffect(() => {
    const backNavigationUrl = handleBackNavigationUrl();
    navigation.setOptions({
      headerTitle: "Permissões",
      headerLeft: () => (
        <BackButton route={backNavigationUrl as RelativePathString} />
      ),
    });
  }, [addActionType, currentResource, handleBackNavigationUrl, navigation]);

  const handleContinue = () => {
    // If no permissions are enabled, show dialog to prompt user
    if (!anyPermissionEnabled) {
      setErrorMessage(
        "Por favor, active as permissões da Câmara e/ou Galeria para continuar. Isto permitirá que a MyCoop tire fotos e aceda à sua galeria quando necessário.",
      );
      setHasError(true);
      return;
    }

    // Check if the enabled permissions are actually granted by the system
    if (!allGranted) {
      setErrorMessage(
        "Por favor, conceda as permissões que activou para continuar. Toque em 'Configurações' para permitir o acesso.",
      );
      setHasError(true);
      return;
    }

    // Only allow camera access if camera permission is enabled and granted
    if (cameraEnabled && hasCameraPermission) {
      router.navigate("/(native)/camera" as Href);
      return;
    }

    // If only media library is enabled, go back
    const backNavigationUrl = handleBackNavigationUrl();
    router.navigate(backNavigationUrl as Href);
  };

  const handleContinueWithoutPermissions = () => {
    setHasError(false);
    setErrorMessage("");
    const backNavigationUrl = handleBackNavigationUrl();
    router.navigate(backNavigationUrl as Href);
  };

  const handleDismissDialog = () => {
    setHasError(false);
    setErrorMessage("");
  };

  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0f172a" : "#fff" },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* <View style={styles.heroSection}>
              <HeroCard
                title="MyCoop"
                description="A MyCoop solicita permissões para funcionar correctamente."
              />
            </View> */}

            <View style={styles.permissionsList}>
              <PermissionSwitch
                icon="camera-outline"
                title="Câmara"
                description="Permitir que a MyCoop tire fotos"
                value={cameraEnabled}
                onValueChange={handleCameraToggle}
              />

              <PermissionSwitch
                icon="image-outline"
                title="Galeria"
                description="Permitir que a MyCoop aceda à galeria de fotos"
                value={mediaLibraryEnabled}
                onValueChange={handleMediaLibraryToggle}
              />
            </View>
          </View>
          <View className="flex-1 justify-end pb-10">
            <View>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  anyPermissionEnabled && styles.continueButtonActive,
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!anyPermissionEnabled}
              >
                <Text
                  style={[
                    styles.continueButtonText,
                    { color: anyPermissionEnabled ? "#fff" : colors.gray800 },
                  ]}
                >
                  Continuar
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={anyPermissionEnabled ? "#fff" : colors.gray800}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      <ConfirmDialog
        title="Permissões"
        visible={hasError}
        setVisible={() => setHasError(false)}
        message={errorMessage}
        yesText="OK"
        noText=""
        yesCallback={handleDismissDialog}
        noCallback={() => {}}
      />
    </CustomSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  heroSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    // textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  permissionsList: {
    gap: 12,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  permissionIcon: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.2)",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray600,
  },
  continueButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
