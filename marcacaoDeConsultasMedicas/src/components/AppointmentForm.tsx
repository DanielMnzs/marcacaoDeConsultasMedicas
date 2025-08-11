import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { authApiService } from '../services/authApi';
import { specialtiesApiService, Specialty } from '../services/specialtiesApi';

// O tipo 'User' não foi fornecido, então estou usando um tipo de exemplo.
// Ajuste isso para o tipo real de seu projeto.
interface User {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

// O tipo 'AppointmentFormProps' não foi fornecido.
interface AppointmentFormProps {
  onSubmit: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  
  // Estados para dados da API
  const [doctors, setDoctors] = useState<User[]>([]);
  const [allDoctors, setAllDoctors] = useState<User[]>([]); // Armazena todos os médicos
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para os outros campos do formulário
  const [dateInput, setDateInput] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Simulação de dados para validação e horários, pois não estavam no código
  const validateDate = (date: string) => true;
  const handleDateChange = (text: string) => setDateInput(text);
  const isTimeSlotAvailable = (time: string) => true;
  const handleSubmit = () => {
    // Lógica para enviar o formulário
    onSubmit();
  };
  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00"];

  // Efeito 1: Carrega dados iniciais (especialidades e todos os médicos)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [specialtiesData, doctorsData] = await Promise.all([
          specialtiesApiService.getAllSpecialties(),
          authApiService.getAllDoctors(),
        ]);
        
        setSpecialties(specialtiesData);
        setAllDoctors(doctorsData); // Armazena todos os médicos
        setDoctors(doctorsData); // Inicialmente, mostra todos
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Efeito 2: Filtra médicos com base na especialidade selecionada
  useEffect(() => {
    if (selectedSpecialty) {
      const filteredDoctors = allDoctors.filter(
        (doctor) => doctor.specialty === selectedSpecialty
      );
      setDoctors(filteredDoctors);
    } else {
      // Se nenhuma especialidade for selecionada, mostra todos os médicos
      setDoctors(allDoctors);
    }
    // Limpa a seleção do médico anterior ao mudar a especialidade
    setSelectedDoctor(''); 
  }, [selectedSpecialty, allDoctors]);

  return (
    <Container>
      <Title>Selecione a Especialidade</Title>
      <SpecialtyContainer>
        {specialties.map((specialty) => (
          <SpecialtyButton
            key={specialty.id}
            selected={selectedSpecialty === specialty.name}
            onPress={() => setSelectedSpecialty(specialty.name)}
          >
            <SpecialtyText>{specialty.name}</SpecialtyText>
          </SpecialtyButton>
        ))}
      </SpecialtyContainer>

      <Title>Selecione o Médico</Title>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <DoctorList>
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              selected={selectedDoctor === doctor.id}
              onPress={() => setSelectedDoctor(doctor.id)}
            >
              <DoctorImage source={{ uri: doctor.image }} />
              <DoctorInfo>
                <DoctorName>{doctor.name}</DoctorName>
                <DoctorSpecialty>{doctor.specialty}</DoctorSpecialty>
              </DoctorInfo>
            </DoctorCard>
          ))}
        </DoctorList>
      )}

      <Title>Data e Hora</Title>
      <Input
        placeholder="Data (DD/MM/AAAA)"
        value={dateInput}
        onChangeText={handleDateChange}
        keyboardType="numeric"
        maxLength={10}
        containerStyle={InputContainer}
        errorMessage={dateInput && !validateDate(dateInput) ? 'Data inválida' : undefined}
      />

      <TimeSlotsContainer>
        <TimeSlotsTitle>Horários Disponíveis:</TimeSlotsTitle>
        <TimeSlotsGrid>
          {timeSlots.map((time) => {
            const isAvailable = isTimeSlotAvailable(time);
            return (
              <TimeSlotButton
                key={time}
                selected={selectedTime === time}
                disabled={!isAvailable}
                onPress={() => isAvailable && setSelectedTime(time)}
              >
                <TimeSlotText selected={selectedTime === time} disabled={!isAvailable}>
                  {time}
                </TimeSlotText>
              </TimeSlotButton>
            );
          })}
        </TimeSlotsGrid>
      </TimeSlotsContainer>

      <Input
        placeholder="Descrição da consulta"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        containerStyle={InputContainer}
      />

      <SubmitButton
        title="Agendar Consulta"
        onPress={handleSubmit}
        buttonStyle={{
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          padding: 12,
          marginTop: 20,
        }}
      />
    </Container>
  );
};

// Componentes de estilo (os seus componentes de estilo originais)
const theme = {
  colors: {
    primary: '#007BFF',
    text: '#333',
    white: '#FFF',
    background: '#F0F0F0',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  typography: {
    subtitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
  },
};

const Container = styled.View`
  padding: ${theme.spacing.medium}px;
`;

const Title = styled.Text`
  font-size: ${theme.typography.subtitle.fontSize}px;
  font-weight: ${theme.typography.subtitle.fontWeight};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.medium}px;
`;

// NOVO: Componentes de estilo para especialidades
const SpecialtyContainer = styled.ScrollView`
  flex-direction: row;
  margin-bottom: ${theme.spacing.medium}px;
`;

const SpecialtyButton = styled(TouchableOpacity)<{ selected: boolean }>`
  padding: ${theme.spacing.small}px ${theme.spacing.medium}px;
  background-color: ${(props) => (props.selected ? theme.colors.primary : theme.colors.white)};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${(props) => (props.selected ? theme.colors.primary : theme.colors.text)};
  margin-right: ${theme.spacing.small}px;
`;

const SpecialtyText = styled.Text`
  color: ${(props) => (props.selected ? theme.colors.white : theme.colors.text)};
  font-weight: bold;
`;

const DoctorList = styled.ScrollView`
  margin-bottom: ${theme.spacing.large}px;
`;

const DoctorCard = styled(TouchableOpacity)<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${theme.spacing.medium}px;
  background-color: ${(props) => (props.selected ? theme.colors.primary : theme.colors.white)};
  border-radius: 8px;
  margin-bottom: ${theme.spacing.medium}px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

const DoctorImage = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin-right: ${theme.spacing.medium}px;
`;

const DoctorInfo = styled.View`
  flex: 1;
`;

const DoctorName = styled.Text`
  font-size: ${theme.typography.subtitle.fontSize}px;
  font-weight: ${theme.typography.subtitle.fontWeight};
  color: ${(props) => (props.selected ? theme.colors.white : theme.colors.text)};
`;

const DoctorSpecialty = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${(props) => (props.selected ? theme.colors.white : theme.colors.text)};
  opacity: 0.8;
`;

const TimeSlotsContainer = styled.View`
  margin-bottom: ${theme.spacing.large}px;
`;

const TimeSlotsTitle = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.small}px;
`;

const TimeSlotsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${theme.spacing.small}px;
`;

const TimeSlotButton = styled(TouchableOpacity)<{ selected: boolean; disabled: boolean }>`
  background-color: ${(props) =>
    props.disabled
      ? theme.colors.background
      : props.selected
      ? theme.colors.primary
      : theme.colors.white};
  padding: ${theme.spacing.small}px ${theme.spacing.medium}px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${(props) =>
    props.disabled
      ? theme.colors.background
      : props.selected
      ? theme.colors.primary
      : theme.colors.text};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const TimeSlotText = styled(Text)<{ selected: boolean; disabled: boolean }>`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${(props) =>
    props.disabled
      ? theme.colors.text
      : props.selected
      ? theme.colors.white
      : theme.colors.text};
`;

const InputContainer = {
  marginBottom: theme.spacing.medium,
  backgroundColor: theme.colors.white,
  borderRadius: 8,
  paddingHorizontal: theme.spacing.medium,
};

const SubmitButton = styled(TouchableOpacity)`
  margin-top: ${theme.spacing.large}px;
`;

// Faltavam os componentes 'Input' e 'Button', então estou usando um 'styled(Text)' e 'styled(TouchableOpacity)'
const Input = styled.TextInput`
  ${InputContainer}
`;

const Button = styled(TouchableOpacity)`
  ${(props) => props.buttonStyle}
`;


export default AppointmentForm;