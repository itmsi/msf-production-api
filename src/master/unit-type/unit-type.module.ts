import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitType } from './entities/unit-type.entity';
import { Brand } from '../brand/entities/brand.entity';
import { UnitTypeController } from './unit-type.controller';
import { UnitTypeService } from './unit-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnitType, Brand])],
  controllers: [UnitTypeController],
  providers: [UnitTypeService],
  exports: [TypeOrmModule, UnitTypeService],
})
export class UnitTypeModule {}
