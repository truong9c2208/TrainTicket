import { api } from './client';
import { Station, Trip } from '../types/api';

export const searchStations = async (q: string) => {
  const normalized = q.trim().toLowerCase();

  try {
    return api.get<Station[]>('/stations', { params: { q } });
  } catch {
    // Fallback for older deployments that do not expose /stations yet.
    const trips = await api.get<Trip[]>('/trips');

    const uniqueStations = new Map<number, Station>();

    for (const trip of trips) {
      for (const stop of trip.stations ?? []) {
        if (stop.station?.id) {
          uniqueStations.set(stop.station.id, stop.station);
        }
      }
    }

    return Array.from(uniqueStations.values())
      .filter((station) => {
        if (!normalized) {
          return true;
        }

        return (
          station.name.toLowerCase().includes(normalized) ||
          station.code.toLowerCase().includes(normalized)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 20);
  }
};
