import { useQuery } from '@tanstack/react-query';
import { getTrip, getTrips } from '../api/trip.api';

export function useTrips(params: { from?: string; to?: string; date?: string }) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => getTrips(params),
  });
}

export function useTripDetail(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId),
    enabled: !!tripId,
  });
}
