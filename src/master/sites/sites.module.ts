import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sites } from './entities/sites.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sites])],
  exports: [TypeOrmModule],
})
export class SitesModule {}
