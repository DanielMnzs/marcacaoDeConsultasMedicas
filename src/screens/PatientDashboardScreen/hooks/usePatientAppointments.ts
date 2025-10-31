// Caminho: src/screens/PatientDashboardScreen/hooks/usePatientAppointments.ts

import { useCallback, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Appointment, // ⬅️ Este é o tipo "bruto" da API
  appointmentsApiService,
} from "../../../services/appointmentsApi";
import { authApiService } from "../../../services/authApi"; // 🔥 MUDANÇA: Importamos o serviço de autenticação

/**
 * 🔥 MUDANÇA: Criamos uma nova interface local para o Card,
 * que é o que o componente AppointmentCard espera
 */
export interface PatientAppointmentCardData {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: string;
}

export function usePatientAppointments() {
  const { user } = useAuth(); // Já temos o usuário (paciente) aqui
  const [appointments, setAppointments] = useState<
    PatientAppointmentCardData[] // 🔥 MUDANÇA: Usamos a nova interface
  >([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 🔥 MUDANÇA: Agora buscamos as consultas E os médicos ao mesmo tempo
      const [allAppointments, doctors] = await Promise.all([
        appointmentsApiService.getAllAppointments(),
        authApiService.getAllDoctors(), // Busca todos os médicos
      ]);

      // Criamos um "mapa" para achar o nome do médico pelo ID
      const doctorMap = new Map(doctors.map((d) => [d.id, d.name]));

      // Filtra só as consultas do usuário logado
      const userAppointmentsData = allAppointments.filter(
        (appointment) => appointment.patientId === user.id
      );

      // 🔥 MUDANÇA: Transformamos os dados brutos (com IDs)
      // nos dados "ricos" (com Nomes) que o Card espera
      const richAppointments = userAppointmentsData.map(
        (appointment: Appointment): PatientAppointmentCardData => ({
          id: appointment.id,
          date: appointment.date,
          time: appointment.time,
          specialty: appointment.specialty,
          status: appointment.status,
          patientName: user.name, // ⬅️ Pegamos o nome do paciente do hook useAuth
          doctorName:
            doctorMap.get(appointment.doctorId) || "Médico não encontrado", // ⬅️ Buscamos o nome do médico no mapa
        })
      );

      setAppointments(richAppointments);
    } catch (error) {
      console.error("Erro ao carregar consultas da API:", error);
      // Aqui você poderia ter um estado de erro para mostrar na tela
    } finally {
      setLoading(false);
    }
  }, [user]); // Adicionamos 'user' como dependência

  return { appointments, loading, loadAppointments };
}
