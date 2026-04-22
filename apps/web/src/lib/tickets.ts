import type { Ticket } from './types';
import { webApi } from './client';

export function getMyTickets() {
  return webApi.get<Ticket[]>('/tickets/mine');
}

export function bookTicket(payload: {
  tripId: string;
  seatId: string;
  fromStationId: string;
  toStationId: string;
}) {
  return webApi.post<Ticket>('/tickets/book', payload);
}

export function cancelTicket(payload: { ticketId: string }) {
  return webApi.post<Ticket>('/tickets/cancel', payload);
}
