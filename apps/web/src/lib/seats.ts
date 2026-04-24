import type { AvailableSeatsResponse } from './types';
import { webApi } from './client';

export function getAvailableSeats(params: { tripId: number; from: number; to: number }) {
  return webApi.get<AvailableSeatsResponse>('/seats/available', { params });
}
