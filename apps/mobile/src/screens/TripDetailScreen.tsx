import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTripDetail } from '../hooks/useTrips';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

function formatTime(value: string | null | undefined) {
  if (!value) return '--:--';
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen({ route, navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
  const { tripId, from, to, fromName, toName } = route.params;
  const tripQuery = useTripDetail(tripId);

  if (tripQuery.isLoading) {
    return (
      <View style={[commonStyles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <View style={[commonStyles.container, { padding: 20 }]}>
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Failed to load trip details.</Text>
      </View>
    );
  }

  const trip = tripQuery.data;

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={[commonStyles.scrollContent, { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Trip header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 18,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 }}>
          {trip.train.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>
          Train {trip.code}
        </Text>
        <View style={commonStyles.row}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 15 }}>{fromName}</Text>
          <Text style={{ color: colors.accent, fontSize: 18, marginHorizontal: 10, fontWeight: '700' }}>
            →
          </Text>
          <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 15 }}>{toName}</Text>
        </View>
      </View>

      {/* Timeline */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Stations
      </Text>

      {trip.stations.map((s, index) => {
        const isFirst = index === 0;
        const isLast = index === trip.stations.length - 1;
        const isSelected = s.stationId === from || s.stationId === to;

        return (
          <View key={s.stationId} style={{ flexDirection: 'row' }}>
            {/* Timeline column */}
            <View style={{ width: 24, alignItems: 'center', marginRight: 14 }}>
              {/* Dot */}
              <View
                style={{
                  width: isSelected ? 14 : 10,
                  height: isSelected ? 14 : 10,
                  borderRadius: isSelected ? 7 : 5,
                  backgroundColor: isSelected ? colors.accent : colors.cardBorder,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.accentDark : colors.divider,
                  marginTop: isFirst ? 4 : 0,
                }}
              />
              {/* Line */}
              {!isLast && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    backgroundColor: colors.divider,
                    marginTop: 4,
                  }}
                />
              )}
            </View>

            {/* Station info */}
            <View
              style={{
                flex: 1,
                paddingBottom: isLast ? 0 : 20,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? colors.textPrimary : colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                {s.station.name}
                {isSelected && (
                  <Text style={{ color: colors.accent, fontSize: 13 }}>
                    {s.stationId === from ? '  Origin' : '  Destination'}
                  </Text>
                )}
              </Text>
              <View style={commonStyles.row}>
                {s.arrivalTime && (
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginRight: 14 }}>
                    Arr {formatTime(s.arrivalTime)}
                  </Text>
                )}
                {s.departureTime && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: isFirst ? colors.accent : colors.textSecondary,
                      fontWeight: isFirst ? '700' : '400',
                    }}
                  >
                    Dep {formatTime(s.departureTime)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}

      {/* Fixed bottom CTA */}
      <View style={{ marginTop: 24 }}>
        <Pressable
          style={({ pressed }) => [commonStyles.button, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() =>
            navigation.navigate('SeatSelection', { tripId, from, to, fromName, toName })
          }
        >
          <Text style={commonStyles.buttonText}>Select seat</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
