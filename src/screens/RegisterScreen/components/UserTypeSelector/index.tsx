import React from "react";
import {
  SectionTitle,
  UserTypeContainer,
  UserTypeButton,
  UserTypeText,
} from "./styles";

interface UserTypeSelectorProps {
  userType: "Usuario" | "ADMIN";
  setUserType: (type: "Usuario" | "ADMIN") => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  userType,
  setUserType,
}) => (
  <>
    <SectionTitle>Tipo de Usuário</SectionTitle>
    <UserTypeContainer>
      <UserTypeButton
        selected={userType === "Usuario"}
        onPress={() => setUserType("Usuario")}
      >
        <UserTypeText selected={userType === "Usuario"}>
          👤 Usuario
        </UserTypeText>
      </UserTypeButton>
      <UserTypeButton
        selected={userType === "ADMIN"}
        onPress={() => setUserType("ADMIN")}
      >
        <UserTypeText selected={userType === "ADMIN"}>
          🔧 Administrador
        </UserTypeText>
      </UserTypeButton>
    </UserTypeContainer>
  </>
);

export default UserTypeSelector;
