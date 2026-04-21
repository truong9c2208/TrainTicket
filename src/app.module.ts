import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { SeatsModule } from './seats/seats.module';
import { StationsModule } from './stations/stations.module';
import { TicketsModule } from './tickets/tickets.module';
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    StationsModule,
    TripsModule,
    SeatsModule,
    TicketsModule,
  ],
})
export class AppModule {}
