import BackButton from "@/components/buttons/back-button";
import AddCooperativeForm from "@/features/groups/add-cooperative";
import { useHeaderOptions } from "@/hooks/use-navigation-search";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

export default function CooperativeRegistrationScreen() {
  const navigation = useNavigation();

  useHeaderOptions({}, "Registo de Cooperativa");
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <BackButton />,
    });
  }, []);

  return <AddCooperativeForm />;
}
