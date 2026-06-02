import React from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useCancelTicket, useMyTickets } from '../hooks/useTickets';
import { useAppTheme } from '../theme';

function formatDateTime(value: string) {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${time} · ${date}`;
}

export function MyTicketsScreen() {
  const { commonStyles, colors } = useAppTheme();
  const ticketsQuery = useMyTickets();
  const cancelMutation = useCancelTicket();

  const cancel = (ticketId: number) => {
    Alert.alert('Cancel ticket', 'Are you sure you want to cancel this ticket?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel ticket',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation.mutateAsync({ ticketId });
            Alert.alert('Canceled', 'Your ticket has been canceled and a refund is being processed.');
          } catch {
            Alert.alert('Error', 'Unable to cancel ticket. Please try again.');
          }
        },
      },
    ]);
  };

  if (ticketsQuery.isLoading) {
    return (
      <View style={[commonStyles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[commonStyles.bodyText, { marginTop: 12 }]}>Loading tickets...</Text>
      </View>
    );
  }

  if (ticketsQuery.isError) {
    return (
      <View style={[commonStyles.container, { padding: 20 }]}>
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Failed to load your tickets.</Text>
      </View>
    );
  }

  const tickets = ticketsQuery.data ?? [];

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={commonStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[commonStyles.heading, { marginBottom: 20 }]}>My Tickets</Text>

      {tickets.length === 0 ? (
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
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🎫</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 }}>
            No tickets yet
          </Text>
          <Text style={[commonStyles.bodyText, { textAlign: 'center', maxWidth: 240 }]}>
            Book a trip to see your tickets here.
          </Text>
        </View>
      ) : (
        tickets.map((ticket) => {
          const isBooked = ticket.status === 'BOOKED';
          const statusColor = isBooked ? colors.success : colors.textHint;
          const statusBg = isBooked ? colors.successBg : colors.surface;

          return (
            <View
              key={ticket.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                overflow: 'hidden',
                ...Platform.select({
                  ios: {
                    shadowColor: colors.shadowColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                  },
                  android: { elevation: 2 },
                  default: {},
                }),
              }}
            >
              {/* Status strip + route */}
              <View
                style={{
                  backgroundColor: isBooked ? colors.accent + '12' : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
                    {ticket.fromStation.name}
                  </Text>
                  <Text style={{ color: colors.accent, fontSize: 16, marginHorizontal: 8, fontWeight: '700' }}>
                    →
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
                    {ticket.toStation.name}
                  </Text>
                </View>

                {/* Status badge */}
                <View
                  style={{
                    backgroundColor: statusBg,
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: statusColor + '40',
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {ticket.status}
                  </Text>
                </View>
              </View>

              {/* Ticket details */}
              <View style={{ padding: 16 }}>
                <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    Coach {ticket.seat.coach.code} · Seat {ticket.seat.number}
                    {ticket.seat.type ? ` · ${ticket.seat.type === 'BED' ? 'Sleeper' : 'Seat'}` : ''}
                  </Text>
                  <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 15 }}>
                    {(ticket.priceCents / 100).toLocaleString('vi-VN')}đ
                  </Text>
                </View>

                <Text style={[commonStyles.caption, { marginBottom: 4 }]}>
                  Departure: {formatDateTime(ticket.trip.departureDate)}
                </Text>
                <Text style={commonStyles.caption}>
                  Booked: {formatDateTime(ticket.bookedAt)}
                </Text>

                {ticket.refundCents != null && ticket.refundCents > 0 && (
                  <Text style={{ color: colors.success, fontSize: 12, marginTop: 6, fontWeight: '600' }}>
                    Refund: {(ticket.refundCents / 100).toLocaleString('vi-VN')}đ
                  </Text>
                )}

                {isBooked && (
                  <Pressable
                    style={({ pressed }) => [
                      commonStyles.buttonDanger,
                      { marginTop: 12, opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => cancel(ticket.id)}
                    disabled={cancelMutation.isPending}
                  >
                    <Text style={commonStyles.buttonTextDanger}>
                      {cancelMutation.isPending ? 'Canceling...' : 'Cancel ticket'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
