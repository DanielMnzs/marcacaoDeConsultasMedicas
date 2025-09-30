// Caminho: src/screens/CreateAppointmentScreen/hooks/useCreateAppointment.ts

import { useState, useEffect } from "react";
import { authApiService } from "../../../services/authApi";
import { appointmentsApiService } from "../../../services/appointmentsApi";
import { User } from "../../../types/auth";
import { Doctor } from "../../../types/doctors";
import { useAuth } from "../../../contexts/AuthContext";

export function useCreateAppointment(navigation: any) {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setError("");
      const doctorsData = await authApiService.getAllDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      setError("Erro ao carregar médicos. Tente novamente.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const convertUsersToDoctors = (users: User[]): Doctor[] => {
    return users
      .filter((u) => u.role === "doctor")
      .map((u) => ({
        id: u.id,
        name: u.name,
        specialty:
          u.role === "doctor" && "specialty" in u ? u.specialty : "N/A",
        image: u.image,
      }));
  };

  const handleCreateAppointment = async () => {
    if (!date || !selectedTime || !selectedDoctor || !user) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    // Validação simples da data (DD/MM/AAAA)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      setError("Formato de data inválido. Use DD/MM/AAAA.");
      return;
    }
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    setLoading(true);
    setError("");

    try {
      const appointmentData = appointmentsApiService.mapAppointmentDataToApi({
        date: formattedDate,
        time: selectedTime,
        specialty: selectedDoctor.specialty,
        patientId: user.id,
        doctorId: selectedDoctor.id,
        notes: `Consulta para ${selectedDoctor.specialty}`,
      });

      await appointmentsApiService.createAppointment(appointmentData);

      alert("Consulta agendada com sucesso!");
      navigation.goBack();
    } catch (err) {
      setError("Erro ao agendar consulta. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    date,
    setDate,
    selectedTime,
    setSelectedTime,
    selectedDoctor,
    setSelectedDoctor,
    loading,
    error,
    doctors,
    loadingDoctors,
    convertUsersToDoctors,
    handleCreateAppointment,
  };
}
