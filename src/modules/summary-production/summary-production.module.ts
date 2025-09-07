import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryProductionController } from './summary-production.controller';
import { SummaryProductionService } from './summary-production.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SummaryProductionController],
  providers: [SummaryProductionService],
  exports: [SummaryProductionService],
})
export class SummaryProductionModule {}
