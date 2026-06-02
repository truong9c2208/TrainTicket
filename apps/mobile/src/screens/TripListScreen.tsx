import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

function formatTime(value: string) {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(value: string) {
  const d = new Date(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Props = NativeStackScreenProps<RootStackParamList, 'TripList'>;

export function TripListScreen({ route, navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
  const { from, to, date, fromName, toName } = route.params;
  const tripsQuery = useTrips({ from, to, date });

  if (tripsQuery.isLoading) {
    return (
      <View style={[commonStyles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[commonStyles.bodyText, { marginTop: 12 }]}>Searching trips...</Text>
      </View>
    );
  }

  if (tripsQuery.isError) {
    return (
      <View style={[commonStyles.container, { padding: 20 }]}>
        <Text style={{ color: colors.danger, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Could not load trips
        </Text>
        <Text style={commonStyles.bodyText}>{String(tripsQuery.error)}</Text>
      </View>
    );
  }

  const trips = tripsQuery.data ?? [];

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={commonStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Route header */}
      <View style={{ marginBottom: 20 }}>
        <View style={[commonStyles.row, { marginBottom: 4 }]}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{fromName}</Text>
          <Text style={{ color: colors.accent, fontSize: 18, marginHorizontal: 10, fontWeight: '700' }}>
            →
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{toName}</Text>
        </View>
        <Text style={commonStyles.bodyText}>{date ? formatDate(date + 'T00:00:00') : ''}</Text>
      </View>

      {trips.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 48,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}
        >
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🚆</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 }}>
            No trips found
          </Text>
          <Text style={[commonStyles.bodyText, { textAlign: 'center', maxWidth: 240 }]}>
            Try a different date or route.
          </Text>
        </View>
      ) : (
        trips.map((trip) => (
          <Pressable
            key={trip.id}
            style={({ pressed }) => [
              commonStyles.card,
              {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 18,
                opacity: pressed ? 0.85 : 1,
                borderColor: pressed ? colors.accent : colors.cardBorder,
              },
            ]}
            onPress={() =>
              navigation.navigate('TripDetail', {
                tripId: trip.id,
                from,
                to,
                fromName,
                toName,
              })
            }
          >
            {/* Departure time */}
            <View
              style={{
                backgroundColor: colors.accent + '15',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                minWidth: 72,
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.accent, letterSpacing: -0.5 }}>
                {formatTime(trip.departureDate)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.accent, fontWeight: '600', marginTop: 2 }}>
                Departure
              </Text>
            </View>

            {/* Trip info */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 }}>
                {trip.train.name}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>
                {trip.fromStationName ?? fromName} - {trip.toStationName ?? toName}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.textHint,
                  backgroundColor: colors.surface,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 5,
                  marginTop: 4,
                  overflow: 'hidden',
                }}
              >
                {trip.code}
              </Text>
            </View>

            {/* Arrow */}
            <Text style={{ color: colors.cardBorder, fontSize: 20, marginLeft: 8 }}>›</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
