import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrainRevenue(startDate: string, endDate: string) {
    // "Thống kê các chuyến tàu theo doanh thu"
    // Fetch all trips in the date range
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const trips = await this.prisma.trip.findMany({
      where: {
        departureDate: { gte: start, lte: end },
      },
      include: {
        train: { include: { coaches: { include: { seats: true } } } },
        tickets: { where: { status: 'BOOKED' } },
      },
    });

    const report = trips.map(trip => {
      const totalSeats = trip.train.coaches.reduce((sum, c) => sum + c.seats.length, 0);
      const bookedSeats = trip.tickets.length;
      const revenue = trip.tickets.reduce((sum, t) => sum + t.priceCents, 0);
      
      return {
        tripCode: trip.code,
        trainName: trip.train.name,
        departureDate: trip.departureDate,
        totalSeats,
        bookedSeats,
        occupancyRate: totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0,
        revenueCents: revenue,
      };
    });

    return report.sort((a, b) => b.revenueCents - a.revenueCents);
  }

  async getRouteRevenue(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: 'BOOKED',
        trip: { departureDate: { gte: start, lte: end } },
      },
      include: {
        fromStation: true,
        toStation: true,
      },
    });

    const routeMap = new Map<string, { from: string; to: string; tickets: number; revenue: number }>();

    tickets.forEach(t => {
      const key = `${t.fromStation.code}-${t.toStation.code}`;
      const route = routeMap.get(key) || { from: t.fromStation.name, to: t.toStation.name, tickets: 0, revenue: 0 };
      route.tickets += 1;
      route.revenue += t.priceCents;
      routeMap.set(key, route);
    });

    return Array.from(routeMap.values()).sort((a, b) => b.revenue - a.revenue);
  }
}
