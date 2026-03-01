import SubmitButton from "@/components/buttons/submit-button";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import ErrorAlert from "@/components/alerts/error-alert";
import { OrganizationTypes, TransactionFlowType } from "@/types";

import DateRangeSelector from "@/components/dates/date-range-selector";
import TransactionDataPreview from "@/features/monitoring/transaction-data-preview";
import {
  getCurrentStock,
  getTransactedItemPortugueseName,
} from "@/helpers/trades";
import { OrganizationTransactionRecord } from "@/library/powersync/app-schemas";
import {
  useAggregatedInfoStore,
  useDateRangeStore,
  useInfoProviderStore,
  useLostInfoStore,
  useResoldInfoStore,
  useTransactedItemStore,
  useTransferredByOrgInfoStore,
  useTransferredInfoStore,
} from "@/store/trades";
import AddAggregatedInfo from "./add-aggregated-info";
import AddInfoProviderInfo from "./add-info-provider-info";
import AddLostInfo from "./add-lost-info";
import AddResoldInfo from "./add-resold-info";
import AddTransactedItem from "./add-transacted-item";
import AddTransferredByOrgInfo from "./add-transferred-by-info";

interface AddTransactionsProps {
  setIsShowingExistingTransactions: (
    isShowingExistingTransactions: boolean,
  ) => void;
  setShowOverview: (showOverview: boolean) => void;
  transactions: OrganizationTransactionRecord[];
  organization: {
    id: string;
    name: string;
    photo: string;
    organization_type: string;
    uaid: string;
    creation_year: number;
    sync_id: string;
    address_id: string;
    admin_post: string;
    district: string;
    province: string;
    village: string;
  };
}

export default function AddTransactions({
  transactions,
  organization,
  setIsShowingExistingTransactions,
  setShowOverview,
}: AddTransactionsProps) {
  const { item } = useTransactedItemStore();
  const itemType = getTransactedItemPortugueseName(item);

  // Compute per-item stock for the currently selected item
  const currentStock = React.useMemo(() => {
    if (!item || !transactions?.length) return 0;
    const itemTransactions = transactions
      .filter(
        (t) =>
          t.item === item && t.quantity != null && t.transaction_type != null,
      )
      .map((t) => ({
        quantity: Number(t.quantity),
        transaction_type: t.transaction_type as TransactionFlowType,
      }));
    return getCurrentStock(itemTransactions);
  }, [item, transactions]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [showInfoProviderModal, setShowInfoProviderModal] = useState(false);

  const { assertAggregatedInfo } = useAggregatedInfoStore();
  const { assertResoldInfo } = useResoldInfoStore();
  const { assertLostInfo } = useLostInfoStore();
  const { assertTransferredInfo } = useTransferredInfoStore();
  const { assertTransferredByOrgInfo } = useTransferredByOrgInfoStore();
  const { assertDateRange, startDate, endDate } = useDateRangeStore();
  const { infoProvider } = useInfoProviderStore();
  const { assertItem } = useTransactedItemStore();

  const assertAllInfo = () => {
    if (!infoProvider?.info_provider_id || !infoProvider?.info_provider_name) {
      setCustomErrors((prev) => ({
        ...prev,
        infoProvider: "Por favor, selecione o fornecedor de informações.",
      }));
      return false;
    }

    // Validate transacted item
    const { status: itemStatus, message: itemMessage } = assertItem();
    if (!itemStatus) {
      setCustomErrors((prev) => ({
        ...prev,
        item: itemMessage,
      }));
      return false;
    }

    const { status: transferredByOrgStatus, message: transferredByOrgMessage } =
      assertTransferredByOrgInfo();
    const {
      status: aggregatedStatus,
      message: aggregatedMessage,
      quantity: aggregatedQuantity,
    } = assertAggregatedInfo();
    const {
      status: resoldStatus,
      message: resoldMessage,
      quantity: resoldQuantity,
    } = assertResoldInfo();
    const {
      status: lostStatus,
      message: lostMessage,
      quantity: lostQuantity,
    } = assertLostInfo();
    const {
      status: transferredStatus,
      message: transferredMessage,
      quantity: transferredQuantity,
    } = assertTransferredInfo();
    const { status: dateRangeStatus, message: dateRangeMessage } =
      assertDateRange();

    const newErrors = { ...customErrors };

    // Clear infoProvider error if it was previously set
    if (newErrors.infoProvider) {
      newErrors.infoProvider = "";
    }

    // Clear item error if it was previously set and item is valid
    if (newErrors.item && itemStatus) {
      newErrors.item = "";
    }

    if (!dateRangeStatus) {
      newErrors.dateRange = dateRangeMessage;
    }

    if (!resoldStatus) {
      newErrors.resold = resoldMessage;
    }
    if (!lostStatus) {
      newErrors.lost = lostMessage;
    }
    if (!transferredStatus) {
      newErrors.transferred = transferredMessage;
    }

    const availableStock = currentStock + aggregatedQuantity;
    const outgoingQuantity =
      resoldQuantity + lostQuantity + transferredQuantity;

    if (availableStock < outgoingQuantity) {
      newErrors.outgoing =
        "A quantidade transaccionada é maior que a quantidade disponível.";
    }

    if (!aggregatedStatus) {
      newErrors.aggregated = aggregatedMessage;
    }
    if (aggregatedStatus) {
      newErrors.aggregated = aggregatedMessage;
    }

    if (!transferredByOrgStatus) {
      newErrors.transferredByOrg = transferredByOrgMessage;
    }
    if (transferredByOrgStatus) {
      newErrors.transferredByOrg = transferredByOrgMessage;
    }

    setCustomErrors(newErrors);
    if (Object.values(newErrors).some((error) => error !== "")) {
      return false;
    }
    return true;
  };

  const onSubmit = () => {
    const isValid = assertAllInfo();
    if (isValid) {
      setShowPreview(true);
      setShowOverview(false);
    } else {
      console.log("customErrors", customErrors);
      setHasError(true);
      setErrorMessage("Por favor, verifique os campos obrigatórios.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          padding: 16,
          paddingBottom: 80,
        }}
        className="bg-white dark:bg-black"
      >
        {item ? (
          <View className="flex-row items-center justify-between bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-3 py-2 mb-2 rounded-lg">
            <View className="flex-col">
              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                Estoque disponível
              </Text>
              <Text className="text-[13px] font-semibold text-green-800 dark:text-green-300">
                {itemType}
              </Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-[22px] font-bold text-[#008000] dark:text-green-400">
                {Intl.NumberFormat("pt-BR", {
                  maximumFractionDigits: 2,
                }).format(currentStock)}
              </Text>
              <Text className="text-[13px] text-[#008000] dark:text-green-400 ml-1">
                Kg
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-gray-50 dark:bg-gray-800 px-3 py-3 my-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <Text className="text-[12px] text-gray-400 dark:text-gray-500 italic text-center">
              Seleccione um produto para ver o estoque.
            </Text>
          </View>
        )}

        <View className="flex flex-col pb-2 mt-8">
          <AddInfoProviderInfo
            customErrors={customErrors}
            setCustomErrors={setCustomErrors}
            setShowInfoProviderModal={setShowInfoProviderModal}
            showInfoProviderModal={showInfoProviderModal}
            ownerId={organization.id as string}
            storeId={organization.id as string}
            storeType="GROUP"
          />
        </View>

        <View className="flex flex-col pb-2">
          <AddTransactedItem
            customErrors={customErrors}
            setCustomErrors={setCustomErrors}
          />
        </View>

        <View className="flex flex-col pb-2">
          <DateRangeSelector
            customErrors={customErrors}
            setCustomErrors={setCustomErrors}
            storeId={organization.id}
            item={item}
          />
        </View>

        {itemType && infoProvider.info_provider_id && (
          <View className="flex flex-col pb-2">
            {/* activeMember participations (quantity by member) for cooperative and association */}
            {organization?.organization_type !==
              OrganizationTypes.COOP_UNION && (
              <AddAggregatedInfo
                group_id={organization.id as string}
                customErrors={customErrors}
                setCustomErrors={setCustomErrors}
                itemType={itemType}
              />
            )}

            {/* Resold Info */}
            <AddResoldInfo
              customErrors={customErrors}
              setCustomErrors={setCustomErrors}
              itemType={itemType}
            />

            {/* Transferred transaction only for cooperative and association */}
            {organization?.organization_type !==
              OrganizationTypes.COOP_UNION && (
              <AddTransferredByOrgInfo
                customErrors={customErrors}
                setCustomErrors={setCustomErrors}
                organizationId={organization.id as string}
                itemType={itemType}
              />
            )}

            {/* Lost Info */}
            <AddLostInfo
              customErrors={customErrors}
              setCustomErrors={setCustomErrors}
              itemType={itemType}
            />

            {customErrors.outgoing && (
              <View className="flex-row justify-center items-center mt-4 bg-red-100 p-2 rounded-md">
                <Text className="text-red-500 text-[12px]">
                  {customErrors.outgoing}
                </Text>
              </View>
            )}

            <View className="flex-row justify-center items-center mt-4">
              <SubmitButton title="Pré-visualizar" onPress={onSubmit} />
            </View>
          </View>
        )}

        <ErrorAlert
          visible={hasError}
          setVisible={setHasError}
          title=""
          message={errorMessage}
          setMessage={setErrorMessage}
        />

        {showPreview && (
          <TransactionDataPreview
            previewData={showPreview}
            setPreviewData={setShowPreview}
            organization={organization}
            setIsShowingExistingTransactions={setIsShowingExistingTransactions}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
