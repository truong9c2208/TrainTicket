import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBookTicket } from '../hooks/useTickets';
import { RootStackParamList } from '../navigation/types';
import { commonStyles } from '../styles/common';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ route, navigation }: Props) {
  const { tripId, seatId, fromStationId, toStationId } = route.params;
  const bookMutation = useBookTicket();

  const confirm = async () => {
    try {
      await bookMutation.mutateAsync({
        tripId,
        seatId,
        fromStationId,
        toStationId,
      });
      Alert.alert('Success', 'Your ticket is booked.');
      navigation.navigate('MyTickets');
    } catch {
      Alert.alert('Booking failed', 'Seat may have been taken. Please refresh and retry.');
    }
  };

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>Confirm Booking</Text>
      <View style={commonStyles.card}>
        <Text>Trip ID: {tripId}</Text>
        <Text>Seat ID: {seatId}</Text>
        <Text>From: {fromStationId}</Text>
        <Text>To: {toStationId}</Text>
      </View>

      <Pressable style={commonStyles.button} onPress={confirm}>
        <Text style={commonStyles.buttonText}>Book Ticket</Text>
      </Pressable>
    </View>
  );
}
