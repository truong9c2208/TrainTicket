import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useCancelTicket, useMyTickets } from '../hooks/useTickets';
import { commonStyles } from '../styles/common';

export function MyTicketsScreen() {
  const ticketsQuery = useMyTickets();
  const cancelMutation = useCancelTicket();

  const cancel = async (ticketId: string) => {
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
      <Text style={commonStyles.heading}>My Tickets</Text>

      {ticketsQuery.data?.map((ticket) => (
        <View key={ticket.id} style={commonStyles.card}>
          <Text style={{ fontWeight: '700' }}>
            Trip {ticket.trip.code} | Coach {ticket.seat.coach.code} Seat {ticket.seat.number}
          </Text>
          <Text>
            {ticket.fromStation.code} `{'->'}` {ticket.toStation.code}
          </Text>
          <Text>Status: {ticket.status}</Text>
          <Text>Price: ${(ticket.priceCents / 100).toFixed(2)}</Text>
          {ticket.refundCents !== null && ticket.refundCents !== undefined ? (
            <Text>Refund: ${(ticket.refundCents / 100).toFixed(2)}</Text>
          ) : null}

          {ticket.status === 'BOOKED' ? (
            <Pressable
              style={[commonStyles.buttonSecondary, { marginTop: 10 }]}
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
