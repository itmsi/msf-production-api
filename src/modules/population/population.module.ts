import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopulationController } from './population.controller';
import { PopulationService } from './population.service';
import { Population } from './entities/population.entity';
import { UnitType } from '../unit-type/entities/unit-type.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Population, UnitType, Activities, Sites]),
  ],
  controllers: [PopulationController],
  providers: [PopulationService],
  exports: [PopulationService],
})
export class PopulationModule {}
