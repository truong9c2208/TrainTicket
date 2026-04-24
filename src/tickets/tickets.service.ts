import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { AuthUser } from '../auth/types';
import { PrismaService } from '../common/prisma/prisma.service';
import { LockService } from '../common/redis/lock.service';
import { assertSegmentOrders } from '../shared/segment.util';
import { TripsService } from '../trips/trips.service';
import { BookTicketDto } from './dto/book-ticket.dto';
import { CancelTicketDto } from './dto/cancel-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tripsService: TripsService,
    private readonly lockService: LockService,
  ) {}

  async listMyTickets(userId: number) {
    return this.prisma.ticket.findMany({
      where: {
        userId,
        trip: {
          departureDate: {
            gte: new Date(),
          },
        },
      },
      include: {
        trip: true,
        seat: {
          include: {
            coach: true,
          },
        },
        fromStation: true,
        toStation: true,
      },
      orderBy: [{ trip: { departureDate: 'asc' } }, { bookedAt: 'desc' }],
    });
  }

  async book(user: AuthUser, dto: BookTicketDto) {
    const lockKey = `lock:booking:${dto.tripId}:${dto.seatId}`;

    return this.lockService.withLock(lockKey, 8000, async () => {
      return this.prisma.$transaction(async (tx) => {
        const [seat, segment, price, routeFromStation] = await Promise.all([
          tx.seat.findUnique({
            where: { id: dto.seatId },
            include: { coach: true },
          }),
          this.tripsService.getSegmentOrders(
            dto.tripId,
            dto.fromStationId,
            dto.toStationId,
          ),
          tx.segmentPrice.findUnique({
            where: {
              tripId_fromStationId_toStationId: {
                tripId: dto.tripId,
                fromStationId: dto.fromStationId,
                toStationId: dto.toStationId,
              },
            },
          }),
          tx.tripStation.findUnique({
            where: {
              tripId_stationId: {
                tripId: dto.tripId,
                stationId: dto.fromStationId,
              },
            },
            select: { departureTime: true },
          }),
        ]);

        if (!seat) {
          throw new NotFoundException('Seat not found');
        }

        const seatBelongsToTripTrain = await tx.trip.findFirst({
          where: {
            id: dto.tripId,
            train: {
              coaches: {
                some: {
                  id: seat.coachId,
                },
              },
            },
          },
          select: { id: true },
        });

        if (!seatBelongsToTripTrain) {
          throw new BadRequestException('Seat does not belong to trip train');
        }

        assertSegmentOrders(segment.fromOrder, segment.toOrder);

        const conflict = await tx.ticket.findFirst({
          where: {
            tripId: dto.tripId,
            seatId: dto.seatId,
            status: TicketStatus.BOOKED,
            fromOrder: { lt: segment.toOrder },
            toOrder: { gt: segment.fromOrder },
          },
          select: { id: true },
        });

        if (conflict) {
          throw new ConflictException('Seat already booked for overlapping segment');
        }

        let resolvedPrice = price?.priceCents ?? 0;
        if (routeFromStation?.departureTime) {
          resolvedPrice = this.getDynamicPrice(resolvedPrice, routeFromStation.departureTime, new Date());
        }

        return tx.ticket.create({
          data: {
            userId: user.userId,
            tripId: dto.tripId,
            seatId: dto.seatId,
            fromStationId: dto.fromStationId,
            toStationId: dto.toStationId,
            fromOrder: segment.fromOrder,
            toOrder: segment.toOrder,
            priceCents: resolvedPrice,
            status: TicketStatus.BOOKED,
          },
          include: {
            trip: true,
            seat: { include: { coach: true } },
            fromStation: true,
            toStation: true,
          },
        });
      }, this.serializableTx());
    });
  }

  async cancel(user: AuthUser, dto: CancelTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: dto.ticketId },
      include: {
        trip: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== user.userId) {
      throw new ForbiddenException('You can only cancel your own tickets');
    }

    if (ticket.status !== TicketStatus.BOOKED) {
      throw new BadRequestException('Ticket is not active');
    }

    const routeFromStation = await this.prisma.tripStation.findUnique({
      where: {
        tripId_stationId: {
          tripId: ticket.tripId,
          stationId: ticket.fromStationId,
        },
      },
      select: { departureTime: true },
    });

    if (!routeFromStation?.departureTime) {
      throw new BadRequestException('Trip departure for ticket segment is missing');
    }

    const feeRate = this.getRefundFeeRate(routeFromStation.departureTime, new Date());
    const refundCents = Math.floor(ticket.priceCents * (1 - feeRate));

    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: TicketStatus.CANCELED,
        canceledAt: new Date(),
        refundCents,
      },
    });
  }

  private getRefundFeeRate(departure: Date, now: Date) {
    const diffHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours > 48) {
      return 0.1;
    }

    if (diffHours > 24) {
      return 0.2;
    }

    if (diffHours > 0) {
      return 0.5;
    }

    return 1;
  }

  private getDynamicPrice(basePrice: number, departure: Date, now: Date) {
    const diffHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours > 24 * 7) {
      return Math.floor(basePrice * 0.9);
    }
    if (diffHours < 24) {
      return Math.floor(basePrice * 1.5);
    }
    if (diffHours < 24 * 3) {
      return Math.floor(basePrice * 1.2);
    }
    return basePrice;
  }

  private serializableTx() {
    return {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    };
  }
}
