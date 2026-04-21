import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTripDetail } from '../hooks/useTrips';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen({ route, navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
  const { tripId, from, to, fromName, toName } = route.params;
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
      <Text style={[commonStyles.bodyText, { marginBottom: 6 }]}>Train: {trip.train.name}</Text>
      <Text style={[commonStyles.bodyText, { marginBottom: 12 }]}>Selected: {fromName} -&gt; {toName}</Text>

      {trip.stations.map((s) => (
        <View key={s.stationId} style={commonStyles.card}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
            {s.stationOrder}. {s.station.name} ({s.station.code})
          </Text>
          <Text style={commonStyles.bodyText}>
            Arrival: {s.arrivalTime ? new Date(s.arrivalTime).toLocaleString() : 'N/A'}
          </Text>
          <Text style={commonStyles.bodyText}>
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
