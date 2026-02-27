import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import React from "react";
import CoopUnionSegmentedDataForm from "./coop-union-segmented-data-form";

export default function AddCoopUnionForm() {
  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <CoopUnionSegmentedDataForm />
    </CustomSafeAreaView>
  );
}
