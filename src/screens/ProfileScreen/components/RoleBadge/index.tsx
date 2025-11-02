import React from "react";
import { Badge, RoleText } from "./styles";

interface RoleBadgeProps {
  role: string;
}

const getRoleText = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "doctor":
      return "Médico";
    case "patient":
      return "Usuario";
    case "Usuario":
      return "Usuario";
    default:
      return role;
  }
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => (
  <Badge role={role}>
    <RoleText>{getRoleText(role)}</RoleText>
  </Badge>
);

export default RoleBadge;
