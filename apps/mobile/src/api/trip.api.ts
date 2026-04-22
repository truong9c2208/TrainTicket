import { api } from './client';
import { AvailableSeatsResponse, Trip } from '../types/api';

export const getTrips = async (params: {
  from?: string;
  to?: string;
  date?: string;
}) => {
  const { data } = await api.get<Trip[]>('/trips', { params });

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
