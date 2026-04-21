import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { RootStackParamList } from '../navigation/types';
import { commonStyles } from '../styles/common';

type Props = NativeStackScreenProps<RootStackParamList, 'TripList'>;

export function TripListScreen({ route, navigation }: Props) {
  const { from, to, date } = route.params;
  const tripsQuery = useTrips({ from, to, date });

  if (tripsQuery.isLoading) {
    return (
      <View style={commonStyles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (tripsQuery.isError) {
    return (
      <View style={commonStyles.container}>
        <Text>Failed to load trips.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.heading}>Available Trips</Text>

      {tripsQuery.data?.map((trip) => (
        <Pressable
          key={trip.id}
          style={commonStyles.card}
          onPress={() => navigation.navigate('TripDetail', { tripId: trip.id, from, to })}
        >
          <Text style={{ fontWeight: '700' }}>{trip.code}</Text>
          <Text>{trip.train.name}</Text>
          <Text>Departure: {new Date(trip.departureDate).toLocaleString()}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
