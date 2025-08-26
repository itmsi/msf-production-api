import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BargeFormService } from './barge-form.service';
import { BargeFormController } from './barge-form.controller';
import { BargeForm } from './entities/barge-form.entity';
import { Barge } from '../barge/entities/barge.entity';
import { Sites } from '../sites/entities/sites.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BargeForm, Barge, Sites])],
  controllers: [BargeFormController],
  providers: [BargeFormService],
  exports: [BargeFormService],
})
export class BargeFormModule {}
