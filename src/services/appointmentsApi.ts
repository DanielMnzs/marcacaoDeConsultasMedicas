// Caminho: src/services/appointmentsApi.ts

import { apiClient, API_ENDPOINTS } from "./api";

/**
 * Interface para a consulta retornada pela API
 */
interface ApiAppointment {
  id: number;
  dataHora: string;
  especialidade: string;
  usuario: { id: number }; // Ajustado para refletir o modelo
  medico: { id: number }; // Ajustado para refletir o modelo
  observacao: string;
  status: "AGENDADA" | "REALIZADA" | "CANCELADA";
}

/**
 * Interface para a consulta usada no frontend
 */
export interface Appointment {
  id: string;
  date: string;
  time: string;
  specialty: string;
  patientId: string;
  doctorId: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
}

/**
 * Interface para criar uma nova consulta
 */
export interface CreateAppointmentData {
  dataHora: string;
  especialidade: string;
  usuario: { id: number };
  medico: { id: number };
  observacao: string;
  status: "AGENDADA";
}

/**
 * Serviço para gerenciar consultas médicas
 */
export const appointmentsApiService = {
  /**
   * Busca TODAS as consultas (para filtrar no frontend depois)
   */
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const appointments = await apiClient.get<ApiAppointment[]>(
        API_ENDPOINTS.APPOINTMENTS
      );
      return appointments.map(this.mapApiAppointmentToAppointment);
    } catch (error) {
      console.error("Erro ao buscar todas as consultas:", error);
      throw new Error("Erro ao carregar consultas");
    }
  },

  /**
   * Cria uma nova consulta
   */
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
      const appointment = await apiClient.post<ApiAppointment>(
        API_ENDPOINTS.APPOINTMENTS,
        data
      );
      return this.mapApiAppointmentToAppointment(appointment);
    } catch (error) {
      console.error("Erro ao criar consulta:", error);
      throw new Error("Erro ao agendar consulta");
    }
  },

  /**
   * Busca uma consulta por ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const appointment = await apiClient.get<ApiAppointment>(
        `${API_ENDPOINTS.APPOINTMENTS}/${id}`
      );
      return this.mapApiAppointmentToAppointment(appointment);
    } catch (error) {
      console.error("Erro ao buscar consulta:", error);
      throw new Error("Erro ao carregar consulta");
    }
  },

  /**
   * Cancela uma consulta
   */
  async cancelAppointment(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.APPOINTMENTS}/${id}`);
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      throw new Error("Erro ao cancelar consulta");
    }
  },

  /**
   * Mapeia uma consulta da API para o formato usado no frontend
   */
  mapApiAppointmentToAppointment(apiAppointment: ApiAppointment): Appointment {
    // Divide data e hora
    const dateTime = new Date(apiAppointment.dataHora);
    const date = dateTime.toISOString().split("T")[0];
    const time = dateTime.toTimeString().slice(0, 5);

    // Mapeia o status
    let status: Appointment["status"];
    switch (apiAppointment.status) {
      case "AGENDADA":
        status = "scheduled";
        break;
      case "REALIZADA":
        status = "completed";
        break;
      case "CANCELADA":
        status = "cancelled";
        break;
      default:
        status = "scheduled";
    }

    return {
      id: apiAppointment.id.toString(),
      date,
      time,
      specialty: apiAppointment.especialidade,
      patientId: apiAppointment.usuario.id.toString(),
      doctorId: apiAppointment.medico.id.toString(),
      notes: apiAppointment.observacao,
      status,
    };
  },

  /**
   * Mapeia dados do frontend para o formato da API
   */
  mapAppointmentDataToApi(data: {
    date: string;
    time: string;
    specialty: string;
    patientId: string;
    doctorId: string;
    notes: string;
  }): CreateAppointmentData {
    // Combina data e hora
    const dateTime = `${data.date}T${data.time}:00`;

    return {
      dataHora: dateTime,
      especialidade: data.specialty,
      usuario: { id: parseInt(data.patientId, 10) },
      medico: { id: parseInt(data.doctorId, 10) },
      observacao: data.notes,
      status: "AGENDADA",
    };
  },
};
