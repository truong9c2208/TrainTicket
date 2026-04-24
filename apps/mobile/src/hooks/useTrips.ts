import { useQuery } from '@tanstack/react-query';
import { getTrip, getTrips } from '../api/trip.api';

export function useTrips(params: { from?: number; to?: number; date?: string }) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => getTrips(params),
  });
}

export function useTripDetail(tripId: number) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId),
    enabled: !!tripId,
  });
}
