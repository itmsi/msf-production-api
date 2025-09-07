import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySummaryProductionController } from './daily-summary-production.controller';
import { DailySummaryProductionService } from './daily-summary-production.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [DailySummaryProductionController],
  providers: [DailySummaryProductionService],
  exports: [DailySummaryProductionService],
})
export class DailySummaryProductionModule {}
