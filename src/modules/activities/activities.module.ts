import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activities } from './entities/activities.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activities])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [TypeOrmModule, ActivitiesService],
})
export class ActivitiesModule {}
