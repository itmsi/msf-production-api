import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [TypeOrmModule, BrandService],
})
export class BrandModule {}
