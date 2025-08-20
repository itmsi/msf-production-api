import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barge } from './entities/barge.entity';
import { BargeController } from './barge.controller';
import { BargeService } from './barge.service';

@Module({
  imports: [TypeOrmModule.forFeature([Barge])],
  controllers: [BargeController],
  providers: [BargeService],
  exports: [TypeOrmModule, BargeService],
})
export class BargeModule {}
