import FormFieldPreview from "@/components/form-items/form-field-preview";
import { colors } from "@/constants/colors";
import { capitalize } from "@/helpers/capitalize";
import { useCheckOrganizationDuplicate } from "@/hooks/use-check-organization-duplicates";
import { useAddressStore } from "@/store/address";
import { useCoopUnionStore } from "@/store/organizations";
import { OrganizationTypes } from "@/types";
import { Fontisto } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-paper";
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
  const { formData } = useCoopUnionStore();
  const { partialAddress } = useAddressStore();

  const isBasicInfoComplete = Boolean(
    formData.name && formData.name.trim().length >= 2,
  );

  const isLegalStatusComplete = Boolean(
    formData.affiliationYear &&
    formData.license &&
    formData.nuel &&
    /^\d{9}$/.test((formData.nuel || "").trim()) &&
    formData.nuit &&
    /^\d{9}$/.test((formData.nuit || "").trim()),
  );

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

type AddCoopUnionFormProps = {
  setPreviewData: (preview: boolean) => void;
  setErrorMessage: (message: string) => void;
  setHasError: (error: boolean) => void;
};

export default function AddCoopUnionForm({
  setPreviewData,
  setErrorMessage,
  setHasError,
}: AddCoopUnionFormProps) {
  const { resetFormData, formData } = useCoopUnionStore();
  const { reset: resetAddress } = useAddressStore();
  const [activeSegment, setActiveSegment] = useState<SegmentId | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const completion = useSegmentCompletion();

  const allComplete =
    completion.basicInfo && completion.legalStatus && completion.address;

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
    organizationType: OrganizationTypes.COOP_UNION,
  });

  const handleSegmentPress = (id: SegmentId) => {
    setActiveSegment((prev) => (prev === id ? null : id));
  };

  const handleSegmentClose = () => {
    setActiveSegment(null);
  };

  const handlePreview = () => {
    if (isCheckingDuplicate) return;

    if (hasDuplicate) {
      setShowDuplicateModal(true);
      return;
    }

    if (allComplete) {
      //   setPreviewData(true);
    }
  };

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
                  groupType={OrganizationTypes.COOP_UNION}
                />
              ) : null}
              {segment.id === "legalStatus" ? (
                <GroupLegalStatusSegment
                  visible={isOpen}
                  onClose={handleSegmentClose}
                  variant="inline"
                  groupType={OrganizationTypes.COOP_UNION}
                />
              ) : null}
              {segment.id === "address" ? (
                <GroupAddressSegment
                  visible={isOpen}
                  onClose={handleSegmentClose}
                  variant="inline"
                  description="Indica o endereço da união"
                />
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {allComplete && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-black">
          <TouchableOpacity
            onPress={handlePreview}
            disabled={isCheckingDuplicate}
            activeOpacity={0.8}
            style={{
              backgroundColor: isCheckingDuplicate
                ? colors.gray100
                : colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ color: colors.white, fontWeight: "600", fontSize: 16 }}
            >
              Pré-visualizar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Duplicate Modal */}
      <Modal
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
      </Modal>
    </View>
  );
}
