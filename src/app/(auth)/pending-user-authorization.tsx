import { AUTH_CODES } from "@/data/auth-codes";
import { useUserDetails } from "@/hooks/queries";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Href, Redirect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import Spinner from "@/components/loaders/spinner";
import {
  getUserDetails,
  updateUserMetdata,
} from "@/library/supabase/user-auth";
import { useAuthStore } from "@/store/auth";
// import { useToast } from '@/components/toast-message'
import ErrorAlert from "@/components/alerts/error-alert";
import CancelButton from "@/components/buttons/cancel-button";
import SubmitButton from "@/components/buttons/submit-button";
import HeroCard from "@/components/hero-card";

export default function PendingUserAuthorization() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState<Href | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { userDetails, isLoading } = useUserDetails();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [statusTitle, setStatusTitle] = useState<string>("");
  const { signOut, isSigningOut } = useAuthStore();
  // const { showError, showSuccess } = useToast()
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorAlertMessage, setErrorAlertMessage] = useState("");
  const [errorAlertTitle, setErrorAlertTitle] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ["50%"], []);

  const handleContactSupport = useCallback(() => {
    setShowContactSheet(true);
    setShowStatusSheet(false); // Hide status sheet when showing contact support
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setShowContactSheet(false);
    setShowStatusSheet(false);
  }, []);

  const handleShowStatusSheet = useCallback(
    (title: string, message: string) => {
      setStatusTitle(title);
      setStatusMessage(message);
      setShowStatusSheet(true);
      bottomSheetRef.current?.expand();
    },
    [],
  );

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    if (!userDetails?.id) {
      // showError('Não foi possível obter informações do usuário.')
      return;
    }
    const { data, success, message } = await getUserDetails(userDetails?.id);
    if (!success || !data) {
      // showError('Não foi possível obter informações do usuário.')
      return;
    }

    const status = data?.status;

    if (!success || !data || !status) {
      // showError('Não foi possível obter informações do usuário.')
      return;
    }
    await updateUserMetdata({ status });

    switch (status) {
      case AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED:
        // User is authorized, redirect to main app
        handleCloseSheet();
        // showSuccess('A sua conta foi autorizada com sucesso.')
        setTimeout(() => {
          setShouldRedirect("/(tabs)");
        }, 1000);
        break;

      case AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED:
        // Still unauthorized, show message
        handleShowStatusSheet(
          "Aguardando Autorização",
          "Sua conta ainda não foi autorizada. Nossa equipe está a analisar a sua solicitação. Você receberá uma notificação assim que for aprovada.",
        );
        break;

      case AUTH_CODES.USER_DETAILS_STATUS.BLOCKED:
        // Account blocked
        handleShowStatusSheet(
          "Conta Bloqueada",
          "Sua conta foi bloqueada. Entre em contacto com a equipe de suporte para mais informações.",
        );
        break;
      case AUTH_CODES.USER_DETAILS_STATUS.BANNED:
        // Account banned
        handleShowStatusSheet(
          "Conta Banida",
          "Sua conta foi banida. Entre em contacto com a equipe de suporte para mais informações.",
        );
        break;

      case AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION:
        // Email not verified, redirect to verification page
        setShouldRedirect("/(auth)/pending-email-verification");
        break;

      default:
        // Unknown status
        // setShouldRedirect('/(auth)/login')
        handleShowStatusSheet(
          "Status Desconhecido",
          "Status da conta não reconhecido. Entre em contacto com a equipe de suporte para mais informações.",
        );
        break;
    }
    setIsCheckingStatus(false);
  };

  const handleWhatsApp = async () => {
    const phoneNumber = "+258876414210";
    const message = `
					Prezados senhores,
					
					Criei uma conta no aplicativo MyCoop, mas ainda não foi autorizada.

					Detalhes da conta:
					Nome: ${userDetails?.full_name}
					Email: ${userDetails?.email}
					Telefone: ${userDetails?.phone}
					
					Preciso de ajuda com a autorização da minha conta MyCoop. Se possível, me avise quando a conta for autorizada.

					Obrigado!`;
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        setShowErrorAlert(true);
        setErrorAlertMessage("WhatsApp não está instalado no seu dispositivo.");
        setErrorAlertTitle("Erro");
      }
    } catch (error) {
      setShowErrorAlert(true);
      setErrorAlertMessage("Não foi possível abrir o WhatsApp.");
      setErrorAlertTitle("Erro");
    }
    handleCloseSheet();
  };

  const handleCall = async () => {
    const phoneNumber = "+258876414210";
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      setShowErrorAlert(true);
      setErrorAlertMessage("Não foi possível fazer a chamada.");
      setErrorAlertTitle("Erro");
    }
    handleCloseSheet();
  };

  const handleEmail = async () => {
    const email = "edias@ampcm.coop";
    const subject = "Pedido de Autorização - Conta MyCoop";
    const body = `
					Prezados senhores,

					Criei uma conta no aplicativo MyCoop, mas ainda não foi autorizada.

					Detalhes da conta:
					Nome: ${userDetails?.full_name}
					Email: ${userDetails?.email}
					Telefone: ${userDetails?.phone}
					
					Preciso de ajuda com a autorização da minha conta MyCoop. Se possível, me avise quando a conta for autorizada.

					Obrigado!`;

    try {
      await Linking.openURL(
        `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      );
    } catch (error) {
      setShowErrorAlert(true);
      setErrorAlertMessage("Não foi possível abrir o aplicativo de email.");
      setErrorAlertTitle("Erro");
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

  // Handle redirects
  if (shouldRedirect) {
    return <Redirect href={shouldRedirect} />;
  }

  // Show loading while checking user details
  if (isLoading) {
    return <Spinner />;
  }

  const handleSignOut = async () => {
    await signOut();
    // The auth store will handle the sign-out process
    // and the root layout will redirect to login
  };

  return (
    <View
      className="flex-1 bg-white dark:bg-black"
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View className="flex-1 w-full">
          <View className="pt-8">
            <HeroCard
              title="MyCoop"
              description="Aguarde Autorização. A autorização da sua conta está a ser processada. Você receberá um email assim que for aprovada."
            />
          </View>

          <View className="flex-1 pt-6 gap-4 justify-end">
            <View className="w-full">
              <SubmitButton
                onPress={handleCheckStatus}
                title={isCheckingStatus ? "Verificando..." : "Verificar Status"}
                isSubmitting={isCheckingStatus}
                disabled={isCheckingStatus}
              />
            </View>

            <View className="w-full">
              <CancelButton
                onCancel={handleContactSupport}
                disabled={isCheckingStatus}
                cancelText="Contactar Suporte"
              />
            </View>

            <View className="w-full">
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={isSigningOut}
                activeOpacity={0.6}
              >
                <Text
                  style={styles.signOutButtonText}
                  className={isDark ? "text-red-200" : "text-red-800"}
                >
                  {isSigningOut ? "A sair..." : "Sair"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        onClose={() => {
          setShowContactSheet(false);
          setShowStatusSheet(false);
        }}
      >
        <BottomSheetView>
          <View className="px-3 pb-6 pt-3">
            {showContactSheet && (
              <>
                <Text
                  style={[
                    styles.bottomSheetTitle,
                    { color: isDark ? "#ffffff" : "#1a1a1a" },
                  ]}
                >
                  Como deseja contactar o suporte?
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
              </>
            )}

            {showStatusSheet && (
              <>
                <Text
                  style={[
                    styles.bottomSheetTitle,
                    { color: isDark ? "#ffffff" : "#1a1a1a" },
                  ]}
                >
                  {statusTitle}
                </Text>
                <Text
                  style={[
                    styles.statusMessage,
                    { color: isDark ? "#cfcfcf" : "#666666" },
                  ]}
                >
                  {statusMessage}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.contactOption,
                    {
                      backgroundColor: isDark ? "#0b0b0b" : "#f8f9fa",
                      borderColor: isDark ? "#1f1f1f" : "#e9ecef",
                    },
                  ]}
                  onPress={handleContactSupport}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={isDark ? "#ffffff" : "#000000"}
                  />
                  <Text
                    style={[
                      styles.contactText,
                      { color: isDark ? "#ffffff" : "#1a1a1a" },
                    ]}
                  >
                    Contactar Suporte
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
      <ErrorAlert
        visible={showErrorAlert}
        setVisible={setShowErrorAlert}
        message={errorAlertMessage}
        setMessage={setErrorAlertMessage}
        title={errorAlertTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 64,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  statusMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 5,
  },
  contactText: {
    fontSize: 16,
  },
  signOutButton: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
