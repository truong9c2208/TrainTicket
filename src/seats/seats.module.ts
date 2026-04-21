import { Module } from '@nestjs/common';
import { TripsModule } from '../trips/trips.module';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';

@Module({
  imports: [TripsModule],
  controllers: [SeatsController],
  providers: [SeatsService],
})
export class SeatsModule {}
