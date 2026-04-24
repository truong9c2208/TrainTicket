import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useCancelTicket, useMyTickets } from '../hooks/useTickets';
import { useAppTheme } from '../theme';

export function MyTicketsScreen() {
  const { commonStyles, colors } = useAppTheme();
  const ticketsQuery = useMyTickets();
  const cancelMutation = useCancelTicket();

  const cancel = async (ticketId: number) => {
    try {
      await cancelMutation.mutateAsync({ ticketId });
      Alert.alert('Canceled', 'Ticket canceled and refund processed.');
    } catch {
      Alert.alert('Cancel failed', 'Unable to cancel ticket.');
    }
  };

  if (ticketsQuery.isLoading) {
    return (
      <View style={commonStyles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (ticketsQuery.isError) {
    return (
      <View style={commonStyles.container}>
        <Text>Failed to load your tickets.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.heading}>Upcoming Tickets</Text>
      <Text style={[commonStyles.bodyText, { marginBottom: 12 }]}>Sorted from nearest departure time.</Text>

      {ticketsQuery.data?.map((ticket) => (
        <View key={ticket.id} style={commonStyles.card}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
            Trip {ticket.trip.code} | Coach {ticket.seat.coach.code} Seat {ticket.seat.number}
          </Text>
          <Text style={commonStyles.bodyText}>
            {ticket.fromStation.name} -&gt; {ticket.toStation.name}
          </Text>
          <Text style={commonStyles.bodyText}>Departure: {new Date(ticket.trip.departureDate).toLocaleString()}</Text>
          <Text style={commonStyles.bodyText}>Status: {ticket.status}</Text>
          <Text style={commonStyles.bodyText}>Price: ${(ticket.priceCents / 100).toFixed(2)}</Text>
          {ticket.refundCents !== null && ticket.refundCents !== undefined ? (
            <Text style={commonStyles.bodyText}>Refund: ${(ticket.refundCents / 100).toFixed(2)}</Text>
          ) : null}

          {ticket.status === 'BOOKED' ? (
            <Pressable
              style={[commonStyles.buttonDanger, { marginTop: 10 }]}
              onPress={() => cancel(ticket.id)}
            >
              <Text style={commonStyles.buttonText}>Cancel Ticket</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}
