import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuHasPermissionService } from './menu-has-permission.service';
import { MenuHasPermissionController } from './menu-has-permission.controller';
import { MenuHasPermission } from './entities/menu-has-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { Menu } from '../menu/entities/menu.entity';
import { RoleHasPermission } from '../role-has-permission/entities/role-has-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuHasPermission,
      Permission,
      Menu,
      RoleHasPermission,
    ]),
  ],
  controllers: [MenuHasPermissionController],
  providers: [MenuHasPermissionService],
  exports: [MenuHasPermissionService],
})
export class MenuHasPermissionModule {}
