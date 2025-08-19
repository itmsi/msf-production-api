import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Sites } from './entities/sites.entity';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sites, OperationPoints])],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
