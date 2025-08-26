import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelConsumptionService } from './fuel-consumption.service';
import { FuelConsumptionController } from './fuel-consumption.controller';
import { FuelConsumption } from './entities/fuel-consumption.entity';
import { Population } from '../population/entities/population.entity';
import { Users } from '../users/entities/users.entity';
import { Sites } from '../sites/entities/sites.entity';
import { UnitType } from '../unit-type/entities/unit-type.entity';
import { Employee } from '../employee/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FuelConsumption, Population, Users, Sites, UnitType, Employee])],
  controllers: [FuelConsumptionController],
  providers: [FuelConsumptionService],
  exports: [FuelConsumptionService],
})
export class FuelConsumptionModule {}
