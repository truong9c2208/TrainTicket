import { api } from './client';
import { Ticket } from '../types/api';

export const bookTicket = async (payload: {
  tripId: string;
  seatId: string;
  fromStationId: string;
  toStationId: string;
}) => {
  const { data } = await api.post<Ticket>('/tickets/book', payload);
  return data;
};

export const cancelTicket = async (payload: { ticketId: string }) => {
  const { data } = await api.post<Ticket>('/tickets/cancel', payload);
  return data;
};

export const getMyTickets = async () => {
  const { data } = await api.get<Ticket[]>('/tickets/mine');
  return data;
};
