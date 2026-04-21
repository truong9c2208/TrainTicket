import { useQuery } from '@tanstack/react-query';
import { searchStations } from '../api/station.api';

export function useStations(query: string) {
  const normalized = query.trim();

  return useQuery({
    queryKey: ['stations', normalized],
    queryFn: () => searchStations(normalized),
  });
}
