import type { Ticket } from './types';
import { webApi } from './client';

export function getMyTickets() {
  return webApi.get<Ticket[]>('/tickets/mine');
}

export function bookTicket(payload: {
  tripId: number;
  seatId: number;
  fromStationId: number;
  toStationId: number;
}) {
  return webApi.post<Ticket>('/tickets/book', payload);
}

export function cancelTicket(payload: { ticketId: number }) {
  return webApi.post<Ticket>('/tickets/cancel', payload);
}
