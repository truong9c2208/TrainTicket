import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SearchStationsDto } from './dto/search-stations.dto';

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchStationsDto) {
    const q = query.q?.trim();

    return this.prisma.station.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ name: 'asc' }],
      take: 20,
    });
  }

  async create(data: { code: string; name: string; phone?: string; address?: string; description?: string }) {
    return this.prisma.station.create({ data });
  }

  async update(id: number, data: { name?: string; phone?: string; address?: string; description?: string }) {
    return this.prisma.station.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.station.delete({ where: { id } });
  }
}
