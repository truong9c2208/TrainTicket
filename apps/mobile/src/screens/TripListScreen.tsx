import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

function formatDateTime(value: string) {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

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
        <Text style={{ color: colors.danger }}>Failed to load trips.</Text>
        <Text style={{ color: colors.textSecondary }}>{String(tripsQuery.error)}</Text>
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
            Departure: {formatDateTime(trip.departureDate)}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            Route: {trip.fromStationName} -&gt; {trip.toStationName}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
