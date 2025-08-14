import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleHasPermissionService } from './role-has-permission.service';
import { RoleHasPermissionController } from './role-has-permission.controller';
import { RoleHasPermission } from './entities/role-has-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleHasPermission])],
  controllers: [RoleHasPermissionController],
  providers: [RoleHasPermissionService],
  exports: [RoleHasPermissionService],
})
export class RoleHasPermissionModule {}
