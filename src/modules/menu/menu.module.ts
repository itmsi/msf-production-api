import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu } from './entities/menu.entity';
import { MenuHasPermission } from '../menu-has-permission/entities/menu-has-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuHasPermission])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
