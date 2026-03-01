import EndDateSelector from "@/components/dates/end-date-selector";
import StartDateSelector from "@/components/dates/start-date-selector";
import { useQueryOneAndWatchChanges } from "@/hooks/queries";
import {
  OrganizationTransactionRecord,
  TABLES,
} from "@/library/powersync/app-schemas";
import { useDateRangeStore } from "@/store/trades";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import NoContentPlaceholder from "../no-content-placeholder";

interface DateRangeSelectorProps {
  customErrors: Record<string, string>;
  setCustomErrors: (customErrors: Record<string, string>) => void;
  storeId: string;
  item: string;
}

const ONE_DAY = 86400000;
const normalize = (d: Date) => {
  const copy = new Date(d.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export default function DateRangeSelector({
  customErrors,
  setCustomErrors,
  storeId,
  item,
}: DateRangeSelectorProps) {
  const { setStartDate: setStoreStartDate, setEndDate: setStoreEndDate } =
    useDateRangeStore();
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // Query last transaction for this group + item
  const query = item
    ? `SELECT end_date FROM ${TABLES.ORGANIZATION_TRANSACTIONS} WHERE store_id = $1 AND item = $2 ORDER BY end_date DESC LIMIT 1`
    : "";
  const params = useMemo(() => (item ? [storeId, item] : []), [storeId, item]);

  const { data: lastTransaction } =
    useQueryOneAndWatchChanges<OrganizationTransactionRecord>(query, params);

  // Compute last transaction end date
  const lastTransactionEndDate = useMemo(() => {
    if (lastTransaction?.end_date) {
      return normalize(new Date(lastTransaction.end_date));
    }
    return null;
  }, [lastTransaction?.end_date]);

  // Compute initial start date
  const computedStartDate = useMemo(() => {
    const today = normalize(new Date());
    if (lastTransactionEndDate) {
      // Day after last transaction end_date
      const dayAfter = normalize(
        new Date(lastTransactionEndDate.getTime() + ONE_DAY),
      );
      // Cannot be after today
      return dayAfter > today ? today : dayAfter;
    }
    // No transaction for this item: 1 month before today
    const oneMonthAgo = new Date(today.getTime());
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return normalize(oneMonthAgo);
  }, [lastTransactionEndDate]);

  // Compute initial end date (start + 1 day, capped at today)
  const computedEndDate = useMemo(() => {
    const today = normalize(new Date());
    const dayAfterStart = normalize(
      new Date(computedStartDate.getTime() + ONE_DAY),
    );
    return dayAfterStart > today ? today : dayAfterStart;
  }, [computedStartDate]);

  const [startDate, setStartDate] = useState<Date>(computedStartDate);
  const [endDate, setEndDate] = useState<Date>(computedEndDate);

  // Re-initialize when item changes (new computed dates)
  useEffect(() => {
    setStartDate(computedStartDate);
    setEndDate(computedEndDate);
  }, [computedStartDate, computedEndDate]);

  // Sync to store whenever local dates change
  useEffect(() => {
    setStoreStartDate(startDate);
    setStoreEndDate(endDate);
  }, [startDate, endDate, setStoreStartDate, setStoreEndDate]);

  // Validation
  useEffect(() => {
    const today = normalize(new Date());
    let error = "";

    if (lastTransactionEndDate) {
      if (lastTransactionEndDate.getTime() >= today.getTime()) {
        error =
          "Não é possível registar transacções quando a data da última monitoria é hoje. Aguarde até amanhã.";
      }
    }

    if (!error && startDate.getTime() >= endDate.getTime()) {
      error = "A data de início deve ser anterior à data de fim.";
    }

    if (!error && startDate.getTime() > today.getTime()) {
      error = "A data de início não pode ser posterior a hoje.";
    }

    if (!error && endDate.getTime() > today.getTime()) {
      error = "A data de fim não pode ser posterior a hoje.";
    }

    // Max range = 1 month
    if (!error) {
      const maxEnd = new Date(startDate.getTime());
      maxEnd.setMonth(maxEnd.getMonth() + 1);
      if (endDate.getTime() > maxEnd.getTime()) {
        error = "O intervalo máximo permitido é de 1 mês.";
      }
    }

    setDateRangeError(error || null);

    // Also sync to customErrors.dateMismatch
    if (error) {
      if (customErrors.dateMismatch !== error) {
        setCustomErrors({ ...customErrors, dateMismatch: error });
      }
    } else {
      if (customErrors.dateMismatch) {
        setCustomErrors({ ...customErrors, dateMismatch: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, lastTransactionEndDate]);

  // Determine min/max for start picker
  const startPickerConstraints = useMemo(() => {
    const today = normalize(new Date());
    // Min: if there's a last transaction, day after it; else 1 month ago
    let minDate: Date;
    if (lastTransactionEndDate) {
      minDate = normalize(new Date(lastTransactionEndDate.getTime() + ONE_DAY));
    } else {
      minDate = new Date(today.getTime());
      minDate.setMonth(minDate.getMonth() - 1);
    }
    // Max: endDate - 1 day or today, whichever is earlier
    const maxByEnd = normalize(new Date(endDate.getTime() - ONE_DAY));
    const maxDate = maxByEnd < today ? maxByEnd : today;
    return { minDate, maxDate };
  }, [lastTransactionEndDate, endDate]);

  // Determine min/max for end picker
  const endPickerConstraints = useMemo(() => {
    const today = normalize(new Date());
    // Min: startDate + 1 day
    const minDate = normalize(new Date(startDate.getTime() + ONE_DAY));
    // Max: startDate + 1 month or today, whichever is earlier
    const maxByRange = new Date(startDate.getTime());
    maxByRange.setMonth(maxByRange.getMonth() + 1);
    const maxDate =
      normalize(maxByRange) < today ? normalize(maxByRange) : today;
    return { minDate, maxDate };
  }, [startDate]);

  const handleStartDateChange = useCallback(
    (date: Date) => {
      const normalized = normalize(date);
      setStartDate(normalized);
      // Auto-adjust end date if it violates rules
      const today = normalize(new Date());
      const dayAfter = normalize(new Date(normalized.getTime() + ONE_DAY));
      if (endDate.getTime() <= normalized.getTime()) {
        setEndDate(dayAfter > today ? today : dayAfter);
      }
      // Check max range
      const maxEnd = new Date(normalized.getTime());
      maxEnd.setMonth(maxEnd.getMonth() + 1);
      if (endDate.getTime() > maxEnd.getTime()) {
        setEndDate(normalize(maxEnd) > today ? today : normalize(maxEnd));
      }
    },
    [endDate],
  );

  const handleEndDateChange = useCallback((date: Date) => {
    setEndDate(normalize(date));
  }, []);

  // Determine if start date picker should be disabled
  const isStartDateLocked = useMemo(() => {
    if (!lastTransactionEndDate) return false;
    const today = normalize(new Date());
    const dayAfter = normalize(
      new Date(lastTransactionEndDate.getTime() + ONE_DAY),
    );
    // Locked if the only valid start date is dayAfter (no range to pick from)
    return dayAfter.getTime() >= today.getTime();
  }, [lastTransactionEndDate]);

  if (!item) {
    return (
      <View className="flex flex-col pb-3">
        <NoContentPlaceholder message="Seleccione um produto para definir as datas." />
      </View>
    );
  }

  return (
    <View className="flex flex-col space-y-6 pb-3">
      <View className="flex flex-col dark:text-gray-400">
        {lastTransactionEndDate ? (
          <Text className="text-gray-600 dark:text-gray-400 text-[12px] italic text-center mx-4">
            Registar transacções ocorridas desde{" "}
            <Text className="font-bold text-[#008000]">
              {normalize(
                new Date(lastTransactionEndDate.getTime() + ONE_DAY),
              ).toLocaleDateString("pt-BR")}
            </Text>
          </Text>
        ) : (
          <Text className="text-gray-600 dark:text-gray-400 text-[12px] italic text-center mx-4">
            Registar transacções
          </Text>
        )}
      </View>

      <StartDateSelector
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        minDate={startPickerConstraints.minDate}
        maxDate={startPickerConstraints.maxDate}
        isLocked={isStartDateLocked}
      />

      <EndDateSelector
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
        minDate={endPickerConstraints.minDate}
        maxDate={endPickerConstraints.maxDate}
      />

      {dateRangeError && (
        <View className="mt-2">
          <View className="bg-red-100 p-2 rounded-md">
            <Text className="text-red-500 text-[12px] text-center">
              {dateRangeError}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
