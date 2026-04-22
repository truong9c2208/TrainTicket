import type { AvailableSeatsResponse } from './types';
import { webApi } from './client';

export function getAvailableSeats(params: { tripId: string; from: string; to: string }) {
  return webApi.get<AvailableSeatsResponse>('/seats/available', { params });
}
