import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SearchTripsDto } from './dto/search-trips.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SearchTripsDto) {
    const whereDate = query.date
      ? {
          departureDate: {
            gte: new Date(`${query.date}T00:00:00.000Z`),
            lt: new Date(`${query.date}T23:59:59.999Z`),
          },
        }
      : {};

    const trips = await this.prisma.trip.findMany({
      where: {
        ...whereDate,
      },
      include: {
        train: true,
        stations: {
          include: { station: true },
          orderBy: { stationOrder: 'asc' },
        },
      },
      orderBy: { departureDate: 'asc' },
    });

    if (!query.from || !query.to) {
      return trips;
    }

    return trips.filter((trip) => {
      const fromIndex = trip.stations.find((s) => s.stationId === query.from)?.stationOrder;
      const toIndex = trip.stations.find((s) => s.stationId === query.to)?.stationOrder;
      return fromIndex !== undefined && toIndex !== undefined && fromIndex < toIndex;
    });
  }

  async findOne(id: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        train: {
          include: {
            coaches: {
              include: {
                seats: true,
              },
              orderBy: { index: 'asc' },
            },
          },
        },
        stations: {
          include: { station: true },
          orderBy: { stationOrder: 'asc' },
        },
        segmentPrices: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async getSegmentOrders(tripId: number, fromStationId: number, toStationId: number) {
    const stations = await this.prisma.tripStation.findMany({
      where: {
        tripId,
        stationId: { in: [fromStationId, toStationId] },
      },
      select: { stationId: true, stationOrder: true, departureTime: true },
    });

    if (stations.length !== 2) {
      throw new BadRequestException('Station pair does not belong to this trip');
    }

    const from = stations.find((s) => s.stationId === fromStationId);
    const to = stations.find((s) => s.stationId === toStationId);

    if (!from || !to || from.stationOrder >= to.stationOrder) {
      throw new BadRequestException('Invalid trip segment');
    }

    return {
      fromOrder: from.stationOrder,
      toOrder: to.stationOrder,
      departureTime: from.departureTime,
    };
  }

  // Admin / Manager Methods

  async create(data: any) {
    return this.prisma.trip.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.trip.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.trip.delete({ where: { id } });
  }

  async setSchedule(tripId: number, stations: { stationId: number; stationOrder: number; arrivalTime?: string; departureTime?: string }[]) {
    // We can replace the old schedule with the new one
    await this.prisma.tripStation.deleteMany({ where: { tripId } });
    const createData = stations.map(s => ({
      tripId,
      stationId: s.stationId,
      stationOrder: s.stationOrder,
      arrivalTime: s.arrivalTime ? new Date(s.arrivalTime) : null,
      departureTime: s.departureTime ? new Date(s.departureTime) : null,
    }));
    await this.prisma.tripStation.createMany({ data: createData });
    return this.prisma.tripStation.findMany({ where: { tripId }, orderBy: { stationOrder: 'asc' } });
  }

  async setSegmentPrices(tripId: number, prices: { fromStationId: number; toStationId: number; priceCents: number }[]) {
    await this.prisma.segmentPrice.deleteMany({ where: { tripId } });
    const createData = prices.map(p => ({
      tripId,
      ...p,
    }));
    await this.prisma.segmentPrice.createMany({ data: createData });
    return this.prisma.segmentPrice.findMany({ where: { tripId } });
  }
}
