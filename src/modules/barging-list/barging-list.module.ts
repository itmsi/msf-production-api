import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BargingListController } from './barging-list.controller';
import { BargingListService } from './barging-list.service';
import { BargingList } from './entities/barging-list.entity';
import { Population } from '../population/entities/population.entity';
import { Barge } from '../barge/entities/barge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BargingList, Population, Barge]),
  ],
  controllers: [BargingListController],
  providers: [BargingListService],
  exports: [BargingListService],
})
export class BargingListModule {}
