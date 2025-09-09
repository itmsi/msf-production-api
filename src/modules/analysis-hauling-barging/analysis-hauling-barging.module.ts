import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisHaulingBargingController } from './analysis-hauling-barging.controller';
import { AnalysisHaulingBargingService } from './analysis-hauling-barging.service';
import { AnalysisHaulingBarging } from './entities/analysis-hauling-barging.entity';
import { BaseDataPro } from '../base-data-production/entities/base-data-pro.entity';
import { ParentBaseDataPro } from '../base-data-production/entities/parent-base-data-pro.entity';
import { Population } from '../population/entities/population.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalysisHaulingBarging,
      BaseDataPro,
      ParentBaseDataPro,
      Population,
    ]),
  ],
  controllers: [AnalysisHaulingBargingController],
  providers: [AnalysisHaulingBargingService],
  exports: [AnalysisHaulingBargingService],
})
export class AnalysisHaulingBargingModule {}
