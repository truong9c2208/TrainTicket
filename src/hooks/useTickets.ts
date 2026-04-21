import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookTicket, cancelTicket, getMyTickets } from '../api/ticket.api';

export function useMyTickets() {
  return useQuery({
    queryKey: ['myTickets'],
    queryFn: getMyTickets,
  });
}

export function useBookTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: bookTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myTickets'] });
      qc.invalidateQueries({ queryKey: ['seats'] });
    },
  });
}

export function useCancelTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: cancelTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myTickets'] });
      qc.invalidateQueries({ queryKey: ['seats'] });
    },
  });
}
