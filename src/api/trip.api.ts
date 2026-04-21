import { api } from './client';
import { AvailableSeatsResponse, Trip } from '../types/api';

export const getTrips = async (params: {
  from?: string;
  to?: string;
  date?: string;
}) => {
  const { data } = await api.get<Trip[]>('/trips', { params });
  return data;
};

export const getTrip = async (tripId: string) => {
  const { data } = await api.get<Trip>(`/trips/${tripId}`);
  return data;
};

export const getAvailableSeats = async (params: {
  tripId: string;
  from: string;
  to: string;
}) => {
  const { data } = await api.get<AvailableSeatsResponse>('/seats/available', {
    params,
  });
  return data;
};
