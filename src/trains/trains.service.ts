import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TrainsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.train.findMany({
      include: { coaches: { include: { seats: true } } },
    });
  }

  async findOne(id: string) {
    const train = await this.prisma.train.findUnique({
      where: { id },
      include: { coaches: { include: { seats: true } } },
    });
    if (!train) throw new NotFoundException('Train not found');
    return train;
  }

  async create(data: { code: string; name: string }) {
    return this.prisma.train.create({ data });
  }

  async update(id: string, data: { name?: string }) {
    return this.prisma.train.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.train.delete({ where: { id } });
  }

  // Coaches
  async addCoach(trainId: string, data: { code: string; index: number; name: string; type: string; description?: string }) {
    return this.prisma.coach.create({
      data: { ...data, trainId },
    });
  }

  async removeCoach(coachId: string) {
    return this.prisma.coach.delete({ where: { id: coachId } });
  }

  // Seats
  async addSeat(coachId: string, data: { number: string; type: 'SEAT' | 'BED'; description?: string }) {
    return this.prisma.seat.create({
      data: { ...data, coachId },
    });
  }

  async removeSeat(seatId: string) {
    return this.prisma.seat.delete({ where: { id: seatId } });
  }
}
