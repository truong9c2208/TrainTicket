import { api } from './client';
import { AvailableSeatsResponse, Trip } from '../types/api';

export const getTrips = async (params: {
  from?: number;
  to?: number;
  date?: string;
}) => {
  const data = await api.get<Trip[]>('/trips', { params });

  return data.map((trip) => {
    const first = trip.stations?.[0]?.station?.name;
    const last = trip.stations?.[trip.stations.length - 1]?.station?.name;
    return {
      ...trip,
      fromStationName: first,
      toStationName: last,
    };
  });
};

export const getTrip = async (tripId: number) => {
  return api.get<Trip>(`/trips/${tripId}`);
};

export const getAvailableSeats = async (params: {
  tripId: number;
  from: number;
  to: number;
}) => {
  return api.get<AvailableSeatsResponse>('/seats/available', { params });
};
