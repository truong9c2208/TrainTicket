import type { Station, Trip } from './types';
import { webApi } from './client';

export async function searchStations(q: string) {
  const normalized = q.trim().toLowerCase();

  try {
    return await webApi.get<Station[]>('/stations', { params: { q } });
  } catch {
    const trips = await webApi.get<Trip[]>('/trips');
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
}
