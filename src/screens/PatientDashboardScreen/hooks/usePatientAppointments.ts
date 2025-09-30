// Caminho: src/screens/PatientDashboardScreen/hooks/usePatientAppointments.ts

import { useCallback, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Appointment,
  appointmentsApiService,
} from "../../../services/appointmentsApi";

export function usePatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allAppointments = await appointmentsApiService.getAllAppointments();
      const userAppointments = allAppointments.filter(
        (appointment) => appointment.patientId === user.id
      );
      setAppointments(userAppointments);
    } catch (error) {
      console.error("Erro ao carregar consultas da API:", error);
      // Aqui você poderia ter um estado de erro para mostrar na tela
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { appointments, loading, loadAppointments };
}
