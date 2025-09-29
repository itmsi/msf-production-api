import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BargingListController } from './barging-list.controller';
import { BargingListService } from './barging-list.service';
import { BargingList } from './entities/barging-list.entity';
import { Population } from '../population/entities/population.entity';
import { Barge } from '../barge/entities/barge.entity';
import { S3Module } from 'src/integrations/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([BargingList, Population, Barge]), S3Module],
  controllers: [BargingListController],
  providers: [BargingListService],
  exports: [BargingListService],
})
export class BargingListModule {}
