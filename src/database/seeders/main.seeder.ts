import { DataSource } from 'typeorm';
import { SitesSeeder } from './sites.seeder';
import { RolesSeeder } from './roles.seeder';
import { EmployeeSeeder } from './employee.seeder';
import { UsersSeeder } from './users.seeder';
import { BrandSeeder } from './brand.seeder';
import { UnitTypeSeeder } from './unit-type.seeder';
import { UnitVariantSeeder } from './unit-variant.seeder';
import { ActivitiesSeeder } from './activities.seeder';
import { OperationPointsSeeder } from './operation-points.seeder';
import { BargeSeeder } from './barge.seeder';
import { PopulationSeeder } from './population.seeder';
import { PermissionSeeder } from './permission.seeder';
import { MenuSeeder } from './menu.seeder';
import { MenuHasPermissionSeeder } from './menu-has-permission.seeder';
import { RoleHasPermissionSeeder } from './role-has-permission.seeder';
import { UserRoleSeeder } from './user-role.seeder';

export class MainSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🚀 Starting database seeding process...\n');

    try {
      // 1. Seed Sites (no dependencies)
      console.log('📍 Seeding Sites...');
      const sitesSeeder = new SitesSeeder(this.dataSource);
      await sitesSeeder.run();
      console.log('✅ Sites seeding completed\n');

      // 2. Seed Roles (no dependencies)
      console.log('👥 Seeding Roles...');
      const rolesSeeder = new RolesSeeder(this.dataSource);
      await rolesSeeder.run();
      console.log('✅ Roles seeding completed\n');

      // 3. Seed Employees (no dependencies)
      console.log('👷 Seeding Employees...');
      const employeeSeeder = new EmployeeSeeder(this.dataSource);
      await employeeSeeder.run();
      console.log('✅ Employees seeding completed\n');

      // 4. Seed Users (depends on Sites, Roles, Employees)
      console.log('👤 Seeding Users...');
      const usersSeeder = new UsersSeeder(this.dataSource);
      await usersSeeder.run();
      console.log('✅ Users seeding completed\n');

      // 5. Seed Brand (no dependencies)
      console.log('🏷️ Seeding Brand...');
      const brandSeeder = new BrandSeeder(this.dataSource);
      await brandSeeder.run();
      console.log('✅ Brand seeding completed\n');

      // 6. Seed Unit Types (depends on Brand)
      console.log('🚛 Seeding Unit Types...');
      const unitTypeSeeder = new UnitTypeSeeder(this.dataSource);
      await unitTypeSeeder.run();
      console.log('✅ Unit Types seeding completed\n');

      // 7. Seed Activities (no dependencies)
      console.log('📋 Seeding Activities...');
      const activitiesSeeder = new ActivitiesSeeder(this.dataSource);
      await activitiesSeeder.run();
      console.log('✅ Activities seeding completed\n');

      // 8. Seed Operation Points (depends on Sites)
      console.log('📍 Seeding Operation Points...');
      const operationPointsSeeder = new OperationPointsSeeder(this.dataSource);
      await operationPointsSeeder.run();
      console.log('✅ Operation Points seeding completed\n');

      // 9. Seed Barge (depends on Sites)
      console.log('🚢 Seeding Barge...');
      const bargeSeeder = new BargeSeeder(this.dataSource);
      await bargeSeeder.run();
      console.log('✅ Barge seeding completed\n');

      // 10. Seed Population (depends on Unit Types, Activities, Sites)
      console.log('👥 Seeding Population...');
      const populationSeeder = new PopulationSeeder(this.dataSource);
      await populationSeeder.run();
      console.log('✅ Population seeding completed\n');

      // 11. Seed Permissions (no dependencies)
      console.log('🔐 Seeding Permissions...');
      const permissionSeeder = new PermissionSeeder(this.dataSource);
      await permissionSeeder.run();
      console.log('✅ Permissions seeding completed\n');

      // 12. Seed Menus (no dependencies)
      console.log('📋 Seeding Menus...');
      const menuSeeder = new MenuSeeder(this.dataSource);
      await menuSeeder.run();
      console.log('✅ Menus seeding completed\n');

      // 13. Seed Menu-Permission relationships (depends on Menus and Permissions)
      console.log('🔗 Seeding Menu-Permission relationships...');
      const menuHasPermissionSeeder = new MenuHasPermissionSeeder(
        this.dataSource,
      );
      await menuHasPermissionSeeder.run();
      console.log('✅ Menu-Permission relationships seeding completed\n');

      // 14. Seed Role-Permission relationships (depends on Roles, Menu-Permissions, and Permissions)
      console.log('🔗 Seeding Role-Permission relationships...');
      const roleHasPermissionSeeder = new RoleHasPermissionSeeder(
        this.dataSource,
      );
      await roleHasPermissionSeeder.run();
      console.log('✅ Role-Permission relationships seeding completed\n');

      // 15. Seed User-Role relationships (depends on Users and Roles)
      console.log('🔗 Seeding User-Role relationships...');
      const userRoleSeeder = new UserRoleSeeder(this.dataSource);
      await userRoleSeeder.run();
      console.log('✅ User-Role relationships seeding completed\n');

      console.log('🎉 All database seeding completed successfully!');
      console.log('\n📋 Summary of seeded data:');
      console.log('   • 5 Sites');
      console.log('   • 7 Roles');
      console.log('   • 8 Employees');
      console.log('   • 7 Users (with passwords)');
      console.log('   • 5 Brands');
      console.log('   • 10 Unit Types');
      console.log('   • 8 Activities');
      console.log('   • 10 Operation Points');
      console.log('   • 5 Barge');
      console.log('   • 15 Population Units');
      console.log('   • 30+ Permissions');
      console.log('   • 40+ Menu Items');
      console.log('   • Menu-Permission relationships');
      console.log('   • Role-Permission relationships');
      console.log('   • User-Role relationships');

      console.log('\n🔑 Default User Credentials:');
      console.log('   • superadmin / superadmin123');
      console.log('   • admin / admin123');
      console.log('   • manager / manager123');
      console.log('   • staff1 / staff123');
      console.log('   • staff2 / staff123');
      console.log('   • operator1 / operator123');
      console.log('   • viewer1 / viewer123');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }
}
