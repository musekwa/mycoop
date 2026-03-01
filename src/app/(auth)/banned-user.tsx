import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function BannedUser() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showContactSheet, setShowContactSheet] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const userStatus = "banned"; // This would come from your user details

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ["50%"], []);

  const handleContactSupport = useCallback(() => {
    setShowContactSheet(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setShowContactSheet(false);
  }, []);

  const handleWhatsApp = async () => {
    const phoneNumber = "+258840445375";
    const message =
      "Olá! Preciso de ajuda com minha conta MyCoop que foi bloqueada/banida.";
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert("Erro", "WhatsApp não está instalado no seu dispositivo.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    }
    handleCloseSheet();
  };

  const handleCall = async () => {
    const phoneNumber = "+258840445375";
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer a chamada.");
    }
    handleCloseSheet();
  };

  const handleEmail = async () => {
    const email = "mycoop@ampcm.org";
    const subject = "Suporte - Conta Bloqueada/Banida MyCoop";
    const body =
      "Olá! Preciso de ajuda com minha conta MyCoop que foi bloqueada/banida.";

    try {
      await Linking.openURL(
        `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir o aplicativo de email.");
    }
    handleCloseSheet();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const getStatusInfo = () => {
    if (userStatus === "banned") {
      return {
        icon: "",
        title: "Conta Banida",
        subtitle: "Sua conta foi permanentemente banida do sistema.",
        description:
          "Infelizmente, sua conta foi banida devido a violações dos termos de uso. Esta ação é permanente e não pode ser revertida.",
        color: "#dc3545",
        bgColor: "#f8d7da",
        borderColor: "#dc3545",
      };
    } else {
      return {
        icon: "",
        title: "Conta Bloqueada",
        subtitle: "Sua conta foi temporariamente bloqueada.",
        description:
          "Sua conta foi bloqueada devido a violações dos termos de uso. Entre em contato com o suporte para solicitar o desbloqueio.",
        color: "#ffc107",
        bgColor: "#fff3cd",
        borderColor: "#ffc107",
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#f8f9fa" },
      ]}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: statusInfo.bgColor,
                  borderColor: statusInfo.borderColor,
                },
              ]}
            >
              <Text style={styles.statusIconText}>{statusInfo.icon}</Text>
            </View>
            <Text style={[styles.title, { color: statusInfo.color }]}>
              {statusInfo.title}
            </Text>
            <Text
              style={[styles.subtitle, { color: isDark ? "#adb5bd" : "#666" }]}
            >
              {statusInfo.subtitle}
            </Text>
          </View>

          {/* Status Information */}
          <View
            style={[
              styles.statusCard,
              { backgroundColor: isDark ? "#1a1a1a" : "#ffffff" },
            ]}
          >
            <Text
              style={[
                styles.statusTitle,
                { color: isDark ? "#ffffff" : "#1a1a1a" },
              ]}
            >
              Status da Conta
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusInfo.color },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: isDark ? "#adb5bd" : "#495057" },
                  ]}
                >
                  {statusInfo.title}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, styles.statusInactive]} />
                <Text
                  style={[
                    styles.statusText,
                    { color: isDark ? "#adb5bd" : "#495057" },
                  ]}
                >
                  Acesso Bloqueado
                </Text>
              </View>
            </View>
          </View>

          {/* Information Cards */}
          <View style={styles.infoSection}>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: isDark ? "#1a1a1a" : "#ffffff" },
              ]}
            >
              <Text
                style={[
                  styles.infoCardTitle,
                  { color: isDark ? "#ffffff" : "#1a1a1a" },
                ]}
              >
                {" "}
                O que aconteceu?
              </Text>
              <Text
                style={[
                  styles.infoCardText,
                  { color: isDark ? "#adb5bd" : "#666" },
                ]}
              >
                {statusInfo.description}
              </Text>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: isDark ? "#1a1a1a" : "#ffffff" },
              ]}
            >
              <Text
                style={[
                  styles.infoCardTitle,
                  { color: isDark ? "#ffffff" : "#1a1a1a" },
                ]}
              >
                {" "}
                O que você pode fazer?
              </Text>
              <Text
                style={[
                  styles.infoCardText,
                  { color: isDark ? "#adb5bd" : "#666" },
                ]}
              >
                • Entre em contato com o suporte{"\n"}• Solicite esclarecimentos
                sobre a decisão{"\n"}• Apresente sua defesa se aplicável
              </Text>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: isDark ? "#1a1a1a" : "#ffffff" },
              ]}
            >
              <Text
                style={[
                  styles.infoCardTitle,
                  { color: isDark ? "#ffffff" : "#1a1a1a" },
                ]}
              >
                {" "}
                Próximos Passos
              </Text>
              <Text
                style={[
                  styles.infoCardText,
                  { color: isDark ? "#adb5bd" : "#666" },
                ]}
              >
                Entre em contato com nossa equipe de suporte para discutir sua
                situação e entender as opções disponíveis.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContactSupport}
            >
              <Text style={styles.primaryButtonText}>Contatar Suporte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: isDark ? "#adb5bd" : "#6c757d" },
              ]}
              onPress={() => {}}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? "#adb5bd" : "#6c757d" },
                ]}
              >
                Sair da Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: isDark ? "#6c757d" : "#999" },
              ]}
            >
              Precisa de ajuda? Nossa equipe de suporte está disponível para
              ajudá-lo.
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Contact Options Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        onClose={() => setShowContactSheet(false)}
      >
        <BottomSheetView>
          <View className="px-3 pb-6 pt-3">
            <Text
              style={[
                styles.bottomSheetTitle,
                { color: isDark ? "#ffffff" : "#1a1a1a" },
              ]}
            >
              Como deseja contatar o suporte?
            </Text>

            <TouchableOpacity
              style={[
                styles.contactOption,
                {
                  backgroundColor: isDark ? "#0b0b0b" : "#f8f9fa",
                  borderColor: isDark ? "#1f1f1f" : "#e9ecef",
                },
              ]}
              onPress={handleWhatsApp}
            >
              <Ionicons
                name="logo-whatsapp"
                size={24}
                color={isDark ? "#ffffff" : "#000000"}
              />
              <Text
                style={[
                  styles.contactText,
                  { color: isDark ? "#ffffff" : "#1a1a1a" },
                ]}
              >
                WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactOption,
                {
                  backgroundColor: isDark ? "#0b0b0b" : "#f8f9fa",
                  borderColor: isDark ? "#1f1f1f" : "#e9ecef",
                },
              ]}
              onPress={handleCall}
            >
              <Ionicons
                name="call-outline"
                size={24}
                color={isDark ? "#ffffff" : "#000000"}
              />
              <Text
                style={[
                  styles.contactText,
                  { color: isDark ? "#ffffff" : "#1a1a1a" },
                ]}
              >
                Ligar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactOption,
                {
                  backgroundColor: isDark ? "#0b0b0b" : "#f8f9fa",
                  borderColor: isDark ? "#1f1f1f" : "#e9ecef",
                },
              ]}
              onPress={handleEmail}
            >
              <Ionicons
                name="mail-outline"
                size={24}
                color={isDark ? "#ffffff" : "#000000"}
              />
              <Text
                style={[
                  styles.contactText,
                  { color: isDark ? "#ffffff" : "#1a1a1a" },
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
  },
  statusIconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  statusRow: {
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInactive: {
    backgroundColor: "#6c757d",
  },
  statusText: {
    fontSize: 16,
    color: "#495057",
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: "#dc3545",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6c757d",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 24,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    gap: 5,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 16,
  },
});
