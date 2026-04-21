import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBookTicket } from '../hooks/useTickets';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ route, navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
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
        <Text style={{ color: colors.textPrimary }}>Trip ID: {tripId}</Text>
        <Text style={{ color: colors.textPrimary }}>Seat ID: {seatId}</Text>
        <Text style={{ color: colors.textPrimary }}>From: {fromStationId}</Text>
        <Text style={{ color: colors.textPrimary }}>To: {toStationId}</Text>
      </View>

      <Pressable style={commonStyles.button} onPress={confirm}>
        <Text style={commonStyles.buttonText}>Book Ticket</Text>
      </Pressable>
    </View>
  );
}
