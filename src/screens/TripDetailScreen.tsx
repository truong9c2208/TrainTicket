import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTripDetail } from '../hooks/useTrips';
import { RootStackParamList } from '../navigation/types';
import { commonStyles } from '../styles/common';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen({ route, navigation }: Props) {
  const { tripId, from, to } = route.params;
  const tripQuery = useTripDetail(tripId);

  if (tripQuery.isLoading) {
    return (
      <View style={commonStyles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <View style={commonStyles.container}>
        <Text>Failed to load trip details.</Text>
      </View>
    );
  }

  const trip = tripQuery.data;

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.heading}>Trip {trip.code}</Text>
      <Text style={{ marginBottom: 10 }}>Train: {trip.train.name}</Text>

      {trip.stations.map((s) => (
        <View key={s.stationId} style={commonStyles.card}>
          <Text style={{ fontWeight: '700' }}>
            {s.stationOrder}. {s.station.name} ({s.station.code})
          </Text>
          <Text>Arrival: {s.arrivalTime ? new Date(s.arrivalTime).toLocaleString() : 'N/A'}</Text>
          <Text>
            Departure: {s.departureTime ? new Date(s.departureTime).toLocaleString() : 'N/A'}
          </Text>
        </View>
      ))}

      <Pressable
        style={commonStyles.button}
        onPress={() => navigation.navigate('SeatSelection', { tripId, from, to })}
      >
        <Text style={commonStyles.buttonText}>Select Seat</Text>
      </Pressable>
    </ScrollView>
  );
}
