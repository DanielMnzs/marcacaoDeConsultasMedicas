// Caminho: src/screens/SensorDashboardScreen/index.tsx (ARQUIVO NOVO)

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  RefreshControl,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { Button, Text } from "react-native-elements";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import theme from "../../styles/theme";
import Header from "../../components/Header";
import { readingApiService, Reading } from "../../services/readingApi";
import styled from "styled-components/native";

// --- Estilos para esta tela ---
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

const ErrorText = styled.Text`
  text-align: center;
  color: ${theme.colors.error};
  font-size: 16px;
  margin-top: 20px;
`;

const SensorCard = styled.View`
  background-color: ${theme.colors.white};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${theme.colors.border};
  elevation: 2;
`;

const SensorId = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.primary};
`;

const SensorValue = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin: 8px 0;
`;

const SensorTimestamp = styled.Text`
  font-size: 14px;
  color: ${theme.colors.secondary};
`;

const styles = {
  scrollContent: {
    padding: 20,
  },
  button: {
    marginTop: 20,
    width: "100%",
  },
  buttonStyle: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
};
// --- Fim dos Estilos ---

type SensorDashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SensorDashboard">;
};

const SensorDashboardScreen: React.FC = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation<SensorDashboardProps["navigation"]>();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadReadings = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      // Busca todas as leituras
      const data = await readingApiService.getAllReadings();

      // A Sprint pede "múltiplos sensores". Vamos agrupar
      // e pegar apenas a leitura MAIS RECENTE de cada sensor.
      const latestReadings = new Map<string, Reading>();
      for (const reading of data) {
        latestReadings.set(reading.sensorId, reading);
      }

      setReadings(Array.from(latestReadings.values()));
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados dos sensores.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  }, [loadReadings]);

  useFocusEffect(
    React.useCallback(() => {
      loadReadings();
    }, [loadReadings])
  );

  return (
    <Container>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Title>Dashboard de Sensores</Title>

        {loading && (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}

        {error && <ErrorText>{error}</ErrorText>}

        {!loading && !error && readings.length === 0 && (
          <LoadingText>Nenhuma leitura de sensor encontrada.</LoadingText>
        )}

        {!loading &&
          !error &&
          readings.map((reading) => (
            <SensorCard key={reading.id}>
              <SensorId>Sensor: {reading.sensorId}</SensorId>
              <SensorValue>Valor: {reading.value}</SensorValue>
              <SensorTimestamp>
                Última Leitura: {reading.timestamp}
              </SensorTimestamp>
            </SensorCard>
          ))}

        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />
      </ScrollView>
    </Container>
  );
};

export default SensorDashboardScreen;
