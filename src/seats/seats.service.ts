import { Injectable } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { TripsService } from '../trips/trips.service';
import { AvailableSeatsDto } from './dto/available-seats.dto';

@Injectable()
export class SeatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tripsService: TripsService,
  ) {}

  async getAvailableSeats(dto: AvailableSeatsDto) {
    const segment = await this.tripsService.getSegmentOrders(dto.tripId, dto.from, dto.to);

    const trip = await this.prisma.trip.findUniqueOrThrow({
      where: { id: dto.tripId },
      select: {
        id: true,
        train: {
          select: {
            coaches: {
              orderBy: { index: 'asc' },
              select: {
                id: true,
                code: true,
                index: true,
                seats: {
                  orderBy: { number: 'asc' },
                  select: {
                    id: true,
                    number: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const occupiedTickets = await this.prisma.ticket.findMany({
      where: {
        tripId: dto.tripId,
        status: TicketStatus.BOOKED,
        fromOrder: { lt: segment.toOrder },
        toOrder: { gt: segment.fromOrder },
      },
      select: { seatId: true },
    });

    const occupiedSeatIds = new Set(occupiedTickets.map((t) => t.seatId));

    const seats = trip.train.coaches.flatMap((coach) =>
      coach.seats.map((seat) => ({
        seatId: seat.id,
        coachId: coach.id,
        coachCode: coach.code,
        coachIndex: coach.index,
        seatNumber: seat.number,
        seatType: seat.type,
        available: !occupiedSeatIds.has(seat.id),
      })),
    );

    return {
      tripId: dto.tripId,
      from: dto.from,
      to: dto.to,
      segment,
      seats,
      availableSeats: seats.filter((s) => s.available),
    };
  }
}
