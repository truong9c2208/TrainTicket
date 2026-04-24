import { api } from './client';
import { Ticket } from '../types/api';

export const bookTicket = async (payload: {
  tripId: number;
  seatId: number;
  fromStationId: number;
  toStationId: number;
}) => {
  return api.post<Ticket>('/tickets/book', payload);
};

export const cancelTicket = async (payload: { ticketId: number }) => {
  return api.post<Ticket>('/tickets/cancel', payload);
};

export const getMyTickets = async () => {
  return api.get<Ticket[]>('/tickets/mine');
};
