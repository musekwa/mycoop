import { UserRoles } from "@/types";


export const getUserRole = (role: string) => {
  if (role === UserRoles.COOP_ADMIN) {
    return { label: "Gestor de Cooperativa", value: role };
  } else if (role === UserRoles.SUPERVISOR) {
    return { label: "Oficial Distrital", value: role };
  } else {
    return { label: "Promotor", value: role };
  }
};