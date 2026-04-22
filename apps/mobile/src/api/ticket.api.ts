import { api } from './client';
import { Ticket } from '../types/api';

export const bookTicket = async (payload: {
  tripId: string;
  seatId: string;
  fromStationId: string;
  toStationId: string;
}) => {
  return api.post<Ticket>('/tickets/book', payload);
};

export const cancelTicket = async (payload: { ticketId: string }) => {
  return api.post<Ticket>('/tickets/cancel', payload);
};

export const getMyTickets = async () => {
  return api.get<Ticket[]>('/tickets/mine');
};
