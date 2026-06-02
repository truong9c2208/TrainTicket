import React from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBookTicket } from '../hooks/useTickets';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ route, navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
  const {
    tripId,
    seatId,
    fromStationId,
    toStationId,
    coachCode,
    seatNumber,
    seatType,
    fromName,
    toName,
    priceCents,
  } = route.params;

  const bookMutation = useBookTicket();

  const confirm = async () => {
    try {
      await bookMutation.mutateAsync({ tripId, seatId, fromStationId, toStationId });
      Alert.alert('Booking confirmed', 'Your ticket has been booked successfully.', [
        { text: 'View my tickets', onPress: () => navigation.navigate('MyTickets') },
      ]);
    } catch {
      Alert.alert('Booking failed', 'This seat may have been taken. Please go back and select another.');
    }
  };

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString('vi-VN') + 'đ';

  return (
    <View style={[commonStyles.container, { padding: 24 }]}>
      <Text style={[commonStyles.heading, { marginBottom: 24 }]}>Review booking</Text>

      {/* Booking summary card */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          overflow: 'hidden',
          marginBottom: 24,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 16,
            },
            android: { elevation: 3 },
            default: {},
          }),
        }}
      >
        {/* Route bar */}
        <View
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 16,
            paddingHorizontal: 20,
          }}
        >
          <View style={[commonStyles.row, { justifyContent: 'center' }]}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>
              {fromName ?? `Station ${fromStationId}`}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, marginHorizontal: 12, fontWeight: '700' }}>
              →
            </Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>
              {toName ?? `Station ${toStationId}`}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={{ padding: 20 }}>
          {coachCode && seatNumber && (
            <Row
              label="Seat"
              value={`Coach ${coachCode} · Seat ${seatNumber}${seatType ? ` (${seatType === 'BED' ? 'Sleeper' : 'Seat'})` : ''}`}
              colors={colors}
            />
          )}
          {priceCents !== undefined && priceCents > 0 && (
            <Row
              label="Price"
              value={formatPrice(priceCents)}
              valueStyle={{ color: colors.accent, fontWeight: '800', fontSize: 18 }}
              colors={colors}
              last
            />
          )}
        </View>
      </View>

      {/* Terms note */}
      <Text style={[commonStyles.caption, { textAlign: 'center', marginBottom: 24 }]}>
        By confirming, you agree to the cancellation and refund policy.
      </Text>

      {/* Actions */}
      <Pressable
        style={({ pressed }) => [commonStyles.button, { opacity: pressed || bookMutation.isPending ? 0.8 : 1, marginBottom: 12 }]}
        onPress={confirm}
        disabled={bookMutation.isPending}
      >
        <Text style={commonStyles.buttonText}>
          {bookMutation.isPending ? 'Processing...' : 'Confirm booking'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [commonStyles.buttonSecondary, { opacity: pressed ? 0.7 : 1 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={commonStyles.buttonTextSecondary}>Go back</Text>
      </Pressable>
    </View>
  );
}

function Row({
  label,
  value,
  valueStyle,
  last,
  colors,
}: {
  label: string;
  value: string;
  valueStyle?: object;
  last?: boolean;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{label}</Text>
      <Text style={[{ color: colors.textPrimary, fontWeight: '700', fontSize: 15 }, valueStyle]}>
        {value}
      </Text>
    </View>
  );
}
