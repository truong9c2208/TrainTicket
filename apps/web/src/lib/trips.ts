import type { Trip } from './types';
import { webApi } from './client';

export async function getTrips(params: {
  from?: string;
  to?: string;
  date?: string;
}) {
  const trips = await webApi.get<Trip[]>('/trips', { params });

  return trips.map((trip) => {
    const first = trip.stations?.[0]?.station?.name;
    const last = trip.stations?.[trip.stations.length - 1]?.station?.name;

    return {
      ...trip,
      fromStationName: first,
      toStationName: last,
    };
  });
}
