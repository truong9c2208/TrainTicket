import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already in use');
    
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        role: data.role || Role.CUSTOMER,
        phone: data.phone,
        address: data.address,
        passwordHash,
      },
      select: { id: true, email: true, role: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
        address: data.address,
      },
      select: { id: true, email: true, role: true },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
