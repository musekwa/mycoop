import ErrorAlert from "@/components/alerts/error-alert";
import SubmitButton from "@/components/buttons/submit-button";
import FormItemDescription from "@/components/form-items/form-item-description";
import NoContentPlaceholder from "@/components/no-content-placeholder";
import TransactionShimmer from "@/components/skeletons/transaction-shimmer";
import AddInfoProviderInfo from "@/features/monitoring/add-info-provider-info";
import TransactionCard from "@/features/monitoring/transaction-card";
import { OrganizationReceivedTransactionItem } from "@/features/types";
import { getTransactedItemPortugueseName } from "@/helpers/trades";
import { getWarehouseTypeLabel } from "@/helpers/transaction-helpers";
import {
  OrganizationTransactionRecord,
  TABLES,
  UserDetailsRecord,
} from "@/library/powersync/app-schemas";
import { buildOrganizationTransaction } from "@/library/powersync/schemas/organization-transactions";
import {
  insertOrganizationTransaction,
  updateOne,
} from "@/library/powersync/sql-statements";
import { useInfoProviderStore } from "@/store/trades";
import { TransactionFlowType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { Checkbox } from "react-native-paper";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";
import { z } from "zod";

const ReceivedInfoSchema = z.object({
  hasReceived: z.boolean(),
  receivedQuantity: z.number().optional(),
  confirmations: z.record(z.string(), z.boolean()),
});

type TransactionData = z.infer<typeof ReceivedInfoSchema>;

interface AddReceivedInfoProps {
  storeType: "GROUP";
  userDetails: UserDetailsRecord;
  organizationId: string;
  transactions: OrganizationReceivedTransactionItem[];
}

const ConfirmationButtons = ({
  control,
  itemId,
  onConfirm,
}: {
  control: any;
  itemId: string;
  onConfirm: (confirmed: boolean) => void;
}) => (
  <Controller
    control={control}
    name={`confirmations.${itemId}`}
    rules={{ required: "Por favor, confirme esta transacção" }}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <View>
        <View className="flex flex-row gap-x-4">
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => {
                onChange(true);
                onConfirm(true);
              }}
              className={`flex-row items-center space-x-2 p-1 rounded-lg border ${
                value === true
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700"
              }`}
            >
              <Checkbox
                status={value === true ? "checked" : "unchecked"}
                onPress={() => {
                  onChange(true);
                  onConfirm(true);
                }}
                color={value === true ? "#059669" : "#6B7280"}
              />
              <Text
                className={`text-sm font-medium ${
                  value === true
                    ? "text-green-700 dark:text-green-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Sim
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => {
                onChange(false);
                onConfirm(false);
              }}
              className={`flex-row items-center space-x-2 p-1 rounded-lg border ${
                value === false
                  ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700"
              }`}
            >
              <Checkbox
                status={value === false ? "checked" : "unchecked"}
                color={value === false ? "#DC2626" : "#6B7280"}
              />
              <Text
                className={`text-sm font-medium ${
                  value === false
                    ? "text-red-700 dark:text-red-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Não
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {error && (
          <Text className="text-xs text-red-500 mt-2 ml-1">
            {error.message}
          </Text>
        )}
      </View>
    )}
  />
);

const TransactionItem = ({
  transaction,
  index,
  control,
  onConfirm,
}: {
  transaction: OrganizationReceivedTransactionItem;
  index: number;
  control: any;
  onConfirm: (confirmed: boolean) => void;
}) => {
  const warehouseType = getWarehouseTypeLabel(
    transaction.origin_org_organization_type,
  );
  const description = transaction.origin_org_group_name;

  if (!transaction.item) {
    return null;
  }

  return (
    <TransactionCard
      index={index}
      itemType={transaction.item}
      quantity={transaction.quantity!}
      startDate={transaction.start_date!}
      endDate={transaction.end_date!}
      warehouseType={warehouseType}
      description={description}
      headerLabel={`Recebimento de ${getTransactedItemPortugueseName(transaction.item).toLowerCase()}`}
      locationLabel="Proveniência"
    >
      <FormItemDescription description={`Confirma ter recebido ${transaction.quantity} Kg. de ${getTransactedItemPortugueseName(transaction.item).toLowerCase()}?`} />
      <ConfirmationButtons
        control={control}
        itemId={transaction.id!}
        onConfirm={onConfirm}
      />
    </TransactionCard>
  );
};

export default function AddReceivedInfo({
  storeType,
  userDetails,
  organizationId,
  transactions,
}: AddReceivedInfoProps) {
  const { control } = useForm<TransactionData>({
    defaultValues: {
      hasReceived: false,
      receivedQuantity: undefined,
    },
    resolver: zodResolver(ReceivedInfoSchema),
  });
  const [confirmedTransactions, setConfirmedTransactions] = useState<
    OrganizationTransactionRecord[]
  >([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInfoProviderModal, setShowInfoProviderModal] = useState(false);
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const { infoProvider } = useInfoProviderStore();

  const onSubmit = async () => {
    if (confirmedTransactions.length === 0) {
      setHasError(true);
      setErrorMessage("Nenhuma transação confirmada");
      return;
    }

    if (
      !infoProvider?.info_provider_id ||
      infoProvider.info_provider_id === "N/A"
    ) {
      setHasError(true);
      setErrorMessage("Por favor, seleccione o fornecedor de informações");
      setCustomErrors({
        infoProvider: "Seleccione um fornecedor de informações",
      });
      return;
    }
    try {
      await Promise.all(
        confirmedTransactions.map(async (transaction) => {
          if (!transaction.item) {
            return;
          }
          const transaction_row = buildOrganizationTransaction({
            item: transaction.item,
            transaction_type: TransactionFlowType.TRANSFERRED_IN,
            quantity: transaction.quantity || 0,
            unit_price: 0,
            start_date: transaction.start_date ?? "",
            end_date: transaction.end_date ?? "",
            store_id: transaction.reference_store_id ?? "",
            created_by: userDetails?.full_name ?? "",
            confirmed: "true",
            reference_store_id: transaction.store_id ?? "",
            sync_id: userDetails?.district_id ?? "",
            updated_by: userDetails?.full_name ?? "",
            info_provider_id: infoProvider?.info_provider_id ?? "",
          });
          await insertOrganizationTransaction(transaction_row);
          await updateOne(
            `UPDATE ${TABLES.ORGANIZATION_TRANSACTIONS} 
                        SET 
                            confirmed = 'true', 
                            updated_at = ? ,
							updated_by = ?
                        WHERE id = ?`,
            [
              new Date().toISOString(),
              userDetails?.full_name ?? "",
              transaction.id,
            ],
          );
        }),
      );
    } catch (error) {
      setHasError(true);
      setErrorMessage("Erro ao gravar transações");
      console.error(error);
    }
  };

  const handleUpdateTransaction = useCallback(
    (transaction: OrganizationReceivedTransactionItem, confirmed: boolean) => {
      if (confirmed) {
        // Add or update transaction in confirmedTransactions
        const updatedTransaction = {
          ...transaction,
          confirmed: "true",
          updated_at: new Date().toISOString(),
          updated_by: userDetails?.full_name,
          transaction_type: TransactionFlowType.TRANSFERRED_IN,
        } as OrganizationTransactionRecord;

        setConfirmedTransactions((prev) => {
          const exists = prev.find((t) => t.id === transaction.id);
          if (exists) {
            // Update existing transaction
            return prev.map((t) =>
              t.id === transaction.id ? updatedTransaction : t,
            );
          }
          // Add new transaction
          return [...prev, updatedTransaction];
        });
      } else {
        // Remove transaction from confirmedTransactions if it exists
        setConfirmedTransactions((prev) =>
          prev.filter((t) => t.id !== transaction.id),
        );
      }
    },
    [userDetails],
  );

  // Show shimmer only when transactions is undefined (initial load)
  const isLoading = transactions === undefined;
  const isEmpty = !isLoading && transactions.length === 0;

  if (isLoading) {
    return (
      <View>
        {Array(1)
          .fill({})
          .map((_, index) => (
            <TransactionShimmer key={index} />
          ))}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <NoContentPlaceholder message="Não há transacções pendentes de confirmação." />
    );
  }

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingLeft: 8,
        // paddingBottom: 80,
        paddingTop: 0,
      }}
      showsVerticalScrollIndicator={false}
      className="bg-white dark:bg-black"
    >
      <View className="py-4">
        <AddInfoProviderInfo
          customErrors={customErrors}
          setCustomErrors={setCustomErrors}
          setShowInfoProviderModal={setShowInfoProviderModal}
          showInfoProviderModal={showInfoProviderModal}
          ownerId={transactions[0].origin_org_id!}
          storeId={organizationId}
          storeType={storeType}
        />
      </View>

      {transactions.map((transaction, index) => (
        <Animated.View
          key={transaction.id}
          entering={FadeInDown.delay(index * 100).springify()}
          layout={LinearTransition.springify()}
        >
          <TransactionItem
            transaction={transaction}
            index={index}
            control={control}
            onConfirm={(confirmed) =>
              handleUpdateTransaction(transaction, confirmed)
            }
          />
        </Animated.View>
      ))}
      <View className="py-3">
        <SubmitButton
          disabled={confirmedTransactions.length === 0}
          title="Gravar"
          onPress={onSubmit}
        />
      </View>
      <ErrorAlert
        visible={hasError}
        setVisible={setHasError}
        message={errorMessage}
        setMessage={setErrorMessage}
        title="Erro"
      />
    </Animated.ScrollView>
  );
}
