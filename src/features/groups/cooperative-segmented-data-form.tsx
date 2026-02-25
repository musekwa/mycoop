import SubmitButton from "@/components/buttons/submit-button";
import { colors } from "@/constants/colors";
import { useUserDetails } from "@/hooks/queries";
import { useCheckOrganizationDuplicate } from "@/hooks/use-check-organization-duplicates";
import { useAddressStore } from "@/store/address";
import { useCoopStore } from "@/store/organizations";
import { CoopAffiliationStatus, OrganizationTypes } from "@/types";
import { Fontisto } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import GroupAddressSegment from "./segments/GroupAddressSegment";
import GroupBasicInfoSegment from "./segments/GroupBasicInfoSegment";
import GroupLegalStatusSegment from "./segments/GroupLegalStatusSegment";

type SegmentId = "basicInfo" | "legalStatus" | "address";

const SEGMENTS: { id: SegmentId; title: string }[] = [
  { id: "basicInfo", title: "Informação Básica" },
  { id: "legalStatus", title: "Estado Legal" },
  { id: "address", title: "Endereço" },
];

function useSegmentCompletion() {
  const { formData } = useCoopStore();
  const { partialAddress } = useAddressStore();

  const isBasicInfoComplete = Boolean(
    formData.name &&
    formData.name.trim().length >= 2 &&
    formData.creationYear &&
    formData.creationYear.trim().length >= 1,
  );

  const isLegalStatusComplete = (() => {
    if (!formData.affiliationStatus) return false;
    if (formData.affiliationStatus === CoopAffiliationStatus.AFFILIATED) {
      return Boolean(
        formData.affiliationYear &&
        formData.license &&
        formData.nuel &&
        /^\d{9}$/.test((formData.nuel || "").trim()) &&
        formData.nuit &&
        /^\d{9}$/.test((formData.nuit || "").trim()),
      );
    }
    return true;
  })();

  const isAddressComplete = Boolean(
    partialAddress?.adminPostId &&
    partialAddress.adminPostId.trim() !== "" &&
    partialAddress?.villageId &&
    partialAddress.villageId.trim() !== "",
  );

  return {
    basicInfo: isBasicInfoComplete,
    legalStatus: isLegalStatusComplete,
    address: isAddressComplete,
  };
}

export default function CooperativeSegmentedDataForm() {
  const router = useRouter();
  const { userDetails } = useUserDetails();

  const { resetFormData, formData } = useCoopStore();
  const { reset: resetAddress } = useAddressStore();
  const [activeSegment, setActiveSegment] = useState<SegmentId | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const completion = useSegmentCompletion();

  const allComplete =
    completion.basicInfo &&
    completion.legalStatus &&
    completion.address &&
    !activeSegment;

  useEffect(() => {
    resetFormData();
    resetAddress();
  }, []);

  const {
    hasDuplicate,
    duplicateType,
    message: duplicateMessage,
    isLoading: isCheckingDuplicate,
    duplicateOrganizations,
  } = useCheckOrganizationDuplicate({
    name: formData.name || "",
    nuit: formData.nuit || undefined,
    nuel: formData.nuel || undefined,
    organizationType: OrganizationTypes.COOPERATIVE,
  });

  const handleSegmentPress = (id: SegmentId) => {
    setActiveSegment((prev) => (prev === id ? null : id));
  };

  const handleSegmentClose = () => {
    setActiveSegment(null);
  };

  const handleSubmit = useCallback(async () => {
    if (isCheckingDuplicate) return;

    if (!userDetails?.district_id || !userDetails?.province_id) {
      setHasError(true);
      setErrorMessage(
        "Por favor, selecione a província e o distrito antes de continuar.",
      );
      return;
    }
    setIsSaving(true);
    setHasError(false);
    setErrorMessage("");

    if (hasDuplicate) {
      setShowDuplicateModal(true);
      return;
    }

    if (allComplete) {
      //
    }
  }, [isCheckingDuplicate, hasDuplicate, allComplete]);

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs italic text-gray-600 dark:text-gray-400 mb-6">
          Toque num segmento para abrir e preencher. Assim que todos estiverem
          preenchidos, o botão para pré-visualizar aparecerá em baixo.
        </Text>

        {SEGMENTS.map((segment) => {
          const isComplete = completion[segment.id];
          const isOpen = activeSegment === segment.id;
          return (
            <View key={segment.id} className="mb-3">
              <TouchableOpacity
                onPress={() => handleSegmentPress(segment.id)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between py-4 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Text
                  className={`text-base font-medium flex-1 ${
                    isComplete
                      ? "text-green-700 dark:text-green-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {segment.title}
                </Text>
                <View className="w-10 h-10 rounded-full items-center justify-center bg-white dark:bg-gray-700">
                  {isComplete ? (
                    <Fontisto name="check" size={20} color={colors.primary} />
                  ) : isOpen ? (
                    <Fontisto name="minus-a" size={18} color={colors.primary} />
                  ) : (
                    <Fontisto name="plus-a" size={18} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>

              {segment.id === "basicInfo" ? (
                <GroupBasicInfoSegment
                  visible={isOpen}
                  onClose={handleSegmentClose}
                  variant="inline"
                  groupType={OrganizationTypes.COOPERATIVE}
                />
              ) : null}
              {segment.id === "legalStatus" ? (
                <GroupLegalStatusSegment
                  visible={isOpen}
                  onClose={handleSegmentClose}
                  variant="inline"
                  groupType={OrganizationTypes.COOPERATIVE}
                />
              ) : null}
              {segment.id === "address" ? (
                <GroupAddressSegment
                  visible={isOpen}
                  onClose={handleSegmentClose}
                  variant="inline"
                  description="Indica o endereço da cooperativa"
                />
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {allComplete && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-black">
          <SubmitButton
            onPress={handleSubmit}
            title="Gravar Dados"
            isSubmitting={isSaving}
            disabled={isSaving}
          />
        </View>
      )}

      {/* Duplicate Modal */}
      {/* <Modal
          visible={showDuplicateModal}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl max-h-[80%]">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="flex-row items-center space-x-2">
                  <Fontisto name="info" size={20} color={colors.red} />
                  <Text className="text-lg font-bold text-gray-800">
                    Não é possível prosseguir enquanto existirem duplicados
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowDuplicateModal(false)}>
                  <Fontisto name="close" size={20} color={colors.gray600} />
                </TouchableOpacity>
              </View>
              <ScrollView className="flex-1 p-4">
                {duplicateOrganizations.length > 0 && (
                  <View className="space-y-4">
                    {duplicateOrganizations.map((org, index) => {
                      const orgTypeLabel =
                        org.organization_type === OrganizationTypes.ASSOCIATION
                          ? "Associação"
                          : org.organization_type ===
                              OrganizationTypes.COOPERATIVE
                            ? "Cooperativa"
                            : "União de Cooperativas";
                      return (
                        <View
                          key={org.id}
                          className="bg-gray-50 p-4 rounded-lg space-y-2"
                        >
                          <FormFieldPreview title="Tipo" value={orgTypeLabel} />
                          <FormFieldPreview
                            title="Nome"
                            value={capitalize(org.group_name)}
                          />
                          {org.nuit &&
                            org.nuit.trim() !== "0" &&
                            org.nuit.trim() !== "" &&
                            org.nuit.trim() !== "N/A" && (
                              <FormFieldPreview title="NUIT" value={org.nuit} />
                            )}
                          {org.nuel &&
                            org.nuel.trim() !== "0" &&
                            org.nuel.trim() !== "" &&
                            org.nuel.trim() !== "N/A" && (
                              <FormFieldPreview title="NUEL" value={org.nuel} />
                            )}
                          {index < duplicateOrganizations.length - 1 && (
                            <Divider className="my-2" />
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal> */}
    </View>
  );
}
