import React from "react";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import AssociationSegmentedDataForm from "./association-segmented-data-form";

export default function AddAssociationForm() {

  return (
    <CustomSafeAreaView edges={['bottom']}>
      <AssociationSegmentedDataForm />
      </CustomSafeAreaView>

  );
}
