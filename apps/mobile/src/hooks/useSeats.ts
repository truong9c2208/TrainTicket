import { useQuery } from '@tanstack/react-query';
import { getAvailableSeats } from '../api/trip.api';

export function useAvailableSeats(params: {
  tripId?: number;
  from?: number;
  to?: number;
}) {
  return useQuery({
    queryKey: ['seats', params],
    queryFn: () =>
      getAvailableSeats({
        tripId: params.tripId!,
        from: params.from!,
        to: params.to!,
      }),
    enabled: !!params.tripId && !!params.from && !!params.to,
  });
}
