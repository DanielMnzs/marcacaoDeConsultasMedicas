// Caminho: src/services/readingApi.ts (ARQUIVO NOVO)

import { apiClient, API_ENDPOINTS } from "./api";

/**
 * Interface para a leitura (Reading) vinda da API
 * (Baseado no seu backend: Reading.java)
 */
interface ApiReading {
  id: number;
  sensorId: string;
  value: number; // No backend está 'value'
  timestamp: string; // Vem como string (ISO 8601)
}

/**
 * Interface para a leitura (Reading) usada no frontend
 */
export interface Reading {
  id: string;
  sensorId: string;
  value: number;
  timestamp: string;
}

/**
 * Serviço para gerenciar as leituras dos sensores
 */
export const readingApiService = {
  /**
   * Busca TODAS as leituras de sensores
   */
  async getAllReadings(): Promise<Reading[]> {
    try {
      const readings = await apiClient.get<ApiReading[]>(
        API_ENDPOINTS.READINGS
      );
      return readings.map(this.mapApiReadingToReading);
    } catch (error) {
      console.error("Erro ao buscar leituras:", error);
      throw new Error("Erro ao carregar leituras dos sensores");
    }
  },

  /**
   * Busca leituras de um sensor específico
   */
  async getReadingsBySensorId(sensorId: string): Promise<Reading[]> {
    try {
      const readings = await apiClient.get<ApiReading[]>(
        `${API_ENDPOINTS.READINGS}?sensorId=${sensorId}`
      );
      return readings.map(this.mapApiReadingToReading);
    } catch (error) {
      console.error("Erro ao buscar leituras do sensor:", error);
      throw new Error("Erro ao carregar dados do sensor");
    }
  },

  /**
   * Mapeia uma leitura da API para o formato do frontend
   */
  mapApiReadingToReading(apiReading: ApiReading): Reading {
    return {
      id: apiReading.id.toString(),
      sensorId: apiReading.sensorId,
      value: apiReading.value,
      // Formata a data para ficar mais legível
      timestamp: new Date(apiReading.timestamp).toLocaleString("pt-BR"),
    };
  },
};
