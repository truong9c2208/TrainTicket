import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAvailableSeats } from '../hooks/useSeats';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

export function SeatSelectionScreen({ route, navigation }: Props) {
  const { commonStyles, colors, mode } = useAppTheme();
  const { tripId, from, to } = route.params;
  const seatsQuery = useAvailableSeats({ tripId, from, to });

  if (seatsQuery.isLoading) {
    return (
      <View style={commonStyles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (seatsQuery.isError || !seatsQuery.data) {
    return (
      <View style={commonStyles.container}>
        <Text>Could not load seat map.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.heading}>Seat Map</Text>
      <Text style={{
        ...commonStyles.bodyText,
        marginBottom: 10,
      }}>Unavailable seats are disabled for this segment.</Text>

      {seatsQuery.data.seats.map((seat) => (
        <Pressable
          key={seat.seatId}
          disabled={!seat.available}
          style={{
            ...commonStyles.card,
            opacity: seat.available ? 1 : 0.6,
            borderColor: seat.available ? colors.accent : colors.inputBorder,
          }}
          onPress={() =>
            navigation.navigate('BookingConfirmation', {
              tripId,
              seatId: seat.seatId,
              fromStationId: from,
              toStationId: to,
            })
          }
        >
          <Text style={{
            ...commonStyles.label,
            fontWeight: '700'
          }}>
            Coach {seat.coachCode} / Seat {seat.seatNumber}
          </Text>
          <Text style={{ color: colors.textPrimary }}>Type: {seat.seatType}</Text>
          <Text style={{ color: colors.textSecondary }}>Status: {seat.available ? 'Available' : 'Occupied on overlap segment'}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
