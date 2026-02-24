import FormItemDescription from "@/components/form-items/form-item-description";
import PickAddress from "@/components/form-items/pick-address";
import { useUserDetails } from "@/hooks/queries";
import { useAddressStore } from "@/store/address";
import { useFarmerRegistrationStore } from "@/store/farmer-registration";
import { AddressLevel } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import SegmentModalLayout from "./SegmentModalLayout";

const AddressSchema = z.object({
  adminPostId: z.string().min(1, "Seleccione o posto administrativo"),
  villageId: z.string().min(1, "Seleccione a localidade"),
});

type AddressFormData = z.infer<typeof AddressSchema>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddressSegmentModal({ visible, onClose }: Props) {
  const { userDetails } = useUserDetails();
  const { address: savedAddress, setAddress } = useFarmerRegistrationStore();
  const { partialAddress, setPartialAdminPostId, setPartialVillageId } =
    useAddressStore();
  const districtId = userDetails?.district_id ?? "";
  const hasHydratedRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    defaultValues: {
      adminPostId: "",
      villageId: "",
    },
    resolver: zodResolver(AddressSchema),
  });

  useEffect(() => {
    if (visible) {
      if (!hasHydratedRef.current) {
        hasHydratedRef.current = true;
        // Hydrate from saved segment data (edit) or address store (draft)
        const adminPostId =
          savedAddress?.adminPostId ?? partialAddress?.adminPostId ?? "";
        const villageId =
          savedAddress?.villageId ?? partialAddress?.villageId ?? "";
        setPartialAdminPostId(adminPostId || undefined);
        setPartialVillageId(villageId || undefined);
        reset({ adminPostId, villageId });
      }
    } else {
      hasHydratedRef.current = false;
    }
  }, [
    visible,
    savedAddress,
    reset,
    setPartialAdminPostId,
    setPartialVillageId,
  ]);

  const onSave = handleSubmit((data) => {
    setPartialAdminPostId(data.adminPostId);
    setPartialVillageId(data.villageId);
    setAddress({
      adminPostId: data.adminPostId,
      villageId: data.villageId,
      districtId: districtId || undefined,
    });
    onClose();
  });

  return (
    <SegmentModalLayout
      visible={visible}
      title="Endereço"
      onClose={onClose}
      onSave={onSave}
    >
      <FormItemDescription description="Indica o endereço de residência do produtor" />
      <View className="mt-4">
        <PickAddress
          control={control}
          errors={errors}
          customErrors={{}}
          clearFieldError={() => {}}
          districtId={districtId}
          addressLevel={AddressLevel.FROM_ADMIN_POSTS}
          description=""
        />
      </View>
    </SegmentModalLayout>
  );
}
