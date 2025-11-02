import React from "react";
import { ListItem, Text } from "react-native-elements";
import { Card } from "./styles";
import StatusBadge from "../StatusBadge";

// AJUSTE 1: Importa o tipo 'Appointment' correto do serviço
import { Appointment } from "../../../../services/appointmentsApi";

interface AppointmentCardProps {
  // AJUSTE 2: Usa a interface 'Appointment' importada
  appointment: Appointment;
  styles: any;
}

// AJUSTE 3: Atualiza o componente para usar os dados que existem em 'Appointment'
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  styles,
}) => (
  <Card>
    <ListItem.Content>
      <ListItem.Title style={styles.patientName}>
        {/* 'patientName' e 'doctorName' não existem neste tipo de Appointment */}
        {/* Exibe a especialidade */}
        Especialidade: {appointment.specialty}
      </ListItem.Title>
      <ListItem.Subtitle style={styles.dateTime}>
        {appointment.date} às {appointment.time}
      </ListItem.Subtitle>
      {/* Exibe as notas da consulta */}
      <Text style={styles.doctorName}>
        {appointment.notes || "Consulta Agendada"}
      </Text>
      {/* <Text style={styles.specialty}>{appointment.specialty}</Text> // <- Já está no título */}
      <StatusBadge status={appointment.status} />
    </ListItem.Content>
  </Card>
);

export default AppointmentCard;
