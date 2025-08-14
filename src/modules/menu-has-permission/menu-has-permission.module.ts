import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuHasPermissionService } from './menu-has-permission.service';
import { MenuHasPermissionController } from './menu-has-permission.controller';
import { MenuHasPermission } from './entities/menu-has-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuHasPermission])],
  controllers: [MenuHasPermissionController],
  providers: [MenuHasPermissionService],
  exports: [MenuHasPermissionService],
})
export class MenuHasPermissionModule {}
