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
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import CoopUnionSegmentedDataForm from "./coop-union-segmented-data-form";


export default function AddCoopUnionForm() {

  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <CoopUnionSegmentedDataForm />
    </CustomSafeAreaView>
  );
}
