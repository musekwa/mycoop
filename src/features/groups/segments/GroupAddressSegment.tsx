import FormItemDescription from "@/components/form-items/form-item-description";
import PickAddress from "@/components/form-items/pick-address";
import SegmentModalLayout from "@/features/farmers/registration/segments/SegmentModalLayout";
import { useUserDetails } from "@/hooks/queries";
import { useAddressStore } from "@/store/address";
import { AddressLevel } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

const AddressSchema = z.object({
  adminPostId: z.string().min(1, "Seleccione o posto administrativo"),
  villageId: z.string().min(1, "Seleccione a localidade"),
});

type AddressFormData = z.infer<typeof AddressSchema>;

type Props = {
  visible: boolean;
  onClose: () => void;
  variant?: "bottomSheet" | "inline";
  description?: string;
};

export default function GroupAddressSegment({
  visible,
  onClose,
  variant = "bottomSheet",
  description = "Indica o endereço da organização",
}: Props) {
  const { userDetails } = useUserDetails();
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
        const adminPostId = partialAddress?.adminPostId ?? "";
        const villageId = partialAddress?.villageId ?? "";
        setPartialAdminPostId(adminPostId || undefined);
        setPartialVillageId(villageId || undefined);
        reset({ adminPostId, villageId });
      }
    } else {
      hasHydratedRef.current = false;
    }
  }, [visible, reset, setPartialAdminPostId, setPartialVillageId]);

  const onSave = handleSubmit((data) => {
    setPartialAdminPostId(data.adminPostId);
    setPartialVillageId(data.villageId);
    onClose();
  });

  return (
    <SegmentModalLayout
      visible={visible}
      title="Endereço"
      onClose={onClose}
      onSave={onSave}
      variant={variant}
    >
      <FormItemDescription description={description} />
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
