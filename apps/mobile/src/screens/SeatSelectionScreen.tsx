import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAvailableSeats } from '../hooks/useSeats';
import { SeatAvailability } from '../types/api';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

export function SeatSelectionScreen({ route, navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
  const { tripId, from, to, fromName, toName } = route.params;
  const seatsQuery = useAvailableSeats({ tripId, from, to });
  const [activeCoachId, setActiveCoachId] = useState<number | null>(null);

  const coaches = useMemo(() => {
    if (!seatsQuery.data) return [];
    const map = new Map<number, { code: string; index: number }>();
    seatsQuery.data.seats.forEach((s) =>
      map.set(s.coachId, { code: s.coachCode, index: s.coachIndex }),
    );
    return Array.from(map.entries())
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => a.index - b.index);
  }, [seatsQuery.data]);

  const currentCoachId = activeCoachId ?? coaches[0]?.id ?? null;

  const seatsInCoach = useMemo(() => {
    if (!seatsQuery.data || currentCoachId === null) return [];
    return seatsQuery.data.seats
      .filter((s) => s.coachId === currentCoachId)
      .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
  }, [seatsQuery.data, currentCoachId]);

  const priceCents = seatsQuery.data?.priceCents ?? 0;

  const handleSelectSeat = (seat: SeatAvailability) => {
    navigation.navigate('BookingConfirmation', {
      tripId,
      seatId: seat.seatId,
      fromStationId: from,
      toStationId: to,
      tripCode: undefined,
      coachCode: seat.coachCode,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      fromName,
      toName,
      priceCents,
    });
  };

  if (seatsQuery.isLoading) {
    return (
      <View style={[commonStyles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[commonStyles.bodyText, { marginTop: 12 }]}>Loading seat map...</Text>
      </View>
    );
  }

  if (seatsQuery.isError || !seatsQuery.data) {
    return (
      <View style={[commonStyles.container, { padding: 20 }]}>
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Could not load seat map.</Text>
      </View>
    );
  }

  const availableCount = seatsQuery.data.seats.filter((s) => s.available).length;

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={commonStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <Text style={commonStyles.heading}>Select a seat</Text>
        <Text style={commonStyles.bodyText}>
          {availableCount} seat{availableCount !== 1 ? 's' : ''} available
          {priceCents > 0
            ? ` · ${(priceCents / 100).toLocaleString('vi-VN')}₫ per seat`
            : ''}
        </Text>
      </View>

      {/* Coach selector */}
      {coaches.length > 1 && (
        <View>
          <Text style={[commonStyles.label, { marginBottom: 10 }]}>Coach</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ gap: 8 } as any}
          >
            {coaches.map((c) => {
              const isActive = c.id === currentCoachId;
              return (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => ({
                    paddingHorizontal: 18,
                    paddingVertical: 9,
                    borderRadius: 10,
                    backgroundColor: isActive ? colors.accent : colors.card,
                    borderWidth: 1,
                    borderColor: isActive ? colors.accent : colors.cardBorder,
                    opacity: pressed ? 0.8 : 1,
                    marginRight: 8,
                  })}
                  onPress={() => setActiveCoachId(c.id)}
                >
                  <Text
                    style={{
                      color: isActive ? colors.accentText : colors.textSecondary,
                      fontWeight: '700',
                      fontSize: 14,
                    }}
                  >
                    Coach {c.code}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Legend */}
      <View style={[commonStyles.row, { marginBottom: 16, gap: 16 } as any]}>
        <View style={[commonStyles.row, { gap: 6 } as any]}>
          <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: colors.accent }} />
          <Text style={commonStyles.caption}>Available</Text>
        </View>
        <View style={[commonStyles.row, { gap: 6 } as any]}>
          <View
            style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: colors.cardBorder }}
          />
          <Text style={commonStyles.caption}>Occupied</Text>
        </View>
      </View>

      {/* Seat grid */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: 16,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        } as any}
      >
        {seatsInCoach.length === 0 ? (
          <Text style={[commonStyles.bodyText, { textAlign: 'center', flex: 1, paddingVertical: 24 }]}>
            No seats in this coach.
          </Text>
        ) : (
          seatsInCoach.map((seat) => (
            <Pressable
              key={seat.seatId}
              disabled={!seat.available}
              style={({ pressed }) => ({
                width: '22%',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                borderWidth: 1,
                backgroundColor: !seat.available
                  ? colors.surface
                  : pressed
                    ? colors.accentDark
                    : colors.accent + '15',
                borderColor: !seat.available
                  ? colors.divider
                  : colors.accent,
                opacity: !seat.available ? 0.4 : 1,
              })}
              onPress={() => handleSelectSeat(seat)}
            >
              <Text
                style={{
                  color: !seat.available ? colors.textHint : colors.accent,
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {seat.seatNumber}
              </Text>
              <Text
                style={{
                  color: colors.textHint,
                  fontSize: 10,
                  marginTop: 2,
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}
              >
                {seat.seatType === 'BED' ? 'Bed' : 'Seat'}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}
