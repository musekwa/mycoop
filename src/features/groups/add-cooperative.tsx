import React from "react";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import CooperativeSegmentedDataForm from "./cooperative-segmented-data-form";

export default function AddCooperativeForm() {
  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <CooperativeSegmentedDataForm />
    </CustomSafeAreaView>
  );
}
