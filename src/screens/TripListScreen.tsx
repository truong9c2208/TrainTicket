import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TripList'>;

export function TripListScreen({ route, navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
  const { from, to, date, fromName, toName } = route.params;
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
      <Text style={[commonStyles.bodyText, { marginBottom: 12 }]}>From {fromName} to {toName}</Text>

      {tripsQuery.data?.map((trip) => (
        <Pressable
          key={trip.id}
          style={commonStyles.card}
          onPress={() => navigation.navigate('TripDetail', { tripId: trip.id, from, to, fromName, toName })}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16 }}>{trip.code}</Text>
          <Text style={{ color: colors.textSecondary }}>{trip.train.name}</Text>
          <Text style={{ color: colors.textPrimary, marginTop: 6 }}>
            Departure: {new Date(trip.departureDate).toLocaleString()}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            Route: {trip.fromStationName} -&gt; {trip.toStationName}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
