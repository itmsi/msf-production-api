import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDataProductionService } from './base-data-production.service';
import { BaseDataProductionController } from './base-data-production.controller';
import { ParentBaseDataPro, BaseDataPro } from './entities';


@Module({
  imports: [
    TypeOrmModule.forFeature([ParentBaseDataPro, BaseDataPro]),
  ],
  controllers: [BaseDataProductionController],
  providers: [BaseDataProductionService],
  exports: [BaseDataProductionService],
})
export class BaseDataProductionModule {}
