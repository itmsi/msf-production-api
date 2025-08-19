import { DataSource } from 'typeorm';
import { SitesSeeder } from './sites.seeder';
import { RolesSeeder } from './roles.seeder';
import { EmployeeSeeder } from './employee.seeder';
import { BrandSeeder } from './brand.seeder';
import { UnitTypeSeeder } from './unit-type.seeder';
import { ActivitiesSeeder } from './activities.seeder';
import { OperationPointsSeeder } from './operation-points.seeder';
import { BargeSeeder } from './barge.seeder';
import { PopulationSeeder } from './population.seeder';
import { PermissionSeeder } from './permission.seeder';
import { MenuSeeder } from './menu.seeder';
import { MenuHasPermissionSeeder } from './menu-has-permission.seeder';
import { RoleHasPermissionSeeder } from './role-has-permission.seeder';
import { UserSeeder } from './user.seeder';
import { UserRoleSeeder } from './user-role.seeder';
import { CustomRolesUsersSeeder } from './custom-roles-users.seeder';
import PlanWorkingHourSeeder from './plan-working-hour.seeder';
import PlanWorkingHourDetailSeeder from './plan-working-hour-detail.seeder';

export class CompleteSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🚀 Starting Complete Database Seeding Process...\n');

    try {
      // Phase 1: Basic Data (No Dependencies)
      console.log('📍 Phase 1: Seeding Basic Data...\n');

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

      // 4. Seed Brand (no dependencies)
      console.log('🏷️ Seeding Brand...');
      const brandSeeder = new BrandSeeder(this.dataSource);
      await brandSeeder.run();
      console.log('✅ Brand seeding completed\n');

      // 5. Seed Activities (no dependencies)
      console.log('📋 Seeding Activities...');
      const activitiesSeeder = new ActivitiesSeeder(this.dataSource);
      await activitiesSeeder.run();
      console.log('✅ Activities seeding completed\n');

      // Phase 2: Dependent Data
      console.log('📍 Phase 2: Seeding Dependent Data...\n');

      // 6. Seed Unit Types (depends on Brand)
      console.log('🚛 Seeding Unit Types...');
      const unitTypeSeeder = new UnitTypeSeeder(this.dataSource);
      await unitTypeSeeder.run();
      console.log('✅ Unit Types seeding completed\n');

      // 7. Seed Operation Points (depends on Sites)
      console.log('📍 Seeding Operation Points...');
      const operationPointsSeeder = new OperationPointsSeeder(this.dataSource);
      await operationPointsSeeder.run();
      console.log('✅ Operation Points seeding completed\n');

      // 8. Seed Barge (depends on Sites)
      console.log('🚢 Seeding Barge...');
      const bargeSeeder = new BargeSeeder(this.dataSource);
      await bargeSeeder.run();
      console.log('✅ Barge seeding completed\n');

      // 9. Seed Population (depends on Unit Types, Activities, Sites)
      console.log('👥 Seeding Population...');
      const populationSeeder = new PopulationSeeder(this.dataSource);
      await populationSeeder.run();
      console.log('✅ Population seeding completed\n');

      // 10. Seed Plan Working Hour (depends on Activities)
      console.log('⏰ Seeding Plan Working Hour...');
      const planWorkingHourSeeder = new PlanWorkingHourSeeder();
      await planWorkingHourSeeder.run(this.dataSource);
      console.log('✅ Plan Working Hour seeding completed\n');

      // 10.1. Seed Plan Working Hour Detail (depends on Plan Working Hour and Activities)
      console.log('⏰ Seeding Plan Working Hour Detail...');
      const planWorkingHourDetailSeeder = new PlanWorkingHourDetailSeeder();
      await planWorkingHourDetailSeeder.run(this.dataSource);
      console.log('✅ Plan Working Hour Detail seeding completed\n');

      // Phase 3: Permission & Menu System
      console.log('📍 Phase 3: Seeding Permission & Menu System...\n');

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

      // Phase 4: User & Access Control
      console.log('📍 Phase 4: Seeding User & Access Control...\n');

      // 14. Seed Users (depends on Sites, Roles, Employees)
      console.log('👤 Seeding Users...');
      const userSeeder = new UserSeeder(this.dataSource);
      await userSeeder.run();
      console.log('✅ Users seeding completed\n');

      // 15. Seed Role-Permission relationships (depends on Roles, Menu-Permissions, and Permissions)
      console.log('🔗 Seeding Role-Permission relationships...');
      const roleHasPermissionSeeder = new RoleHasPermissionSeeder(
        this.dataSource,
      );
      await roleHasPermissionSeeder.run();
      console.log('✅ Role-Permission relationships seeding completed\n');

      // 16. Seed User-Role relationships (depends on Users and Roles)
      console.log('🔗 Seeding User-Role relationships...');
      const userRoleSeeder = new UserRoleSeeder(this.dataSource);
      await userRoleSeeder.run();
      console.log('✅ User-Role relationships seeding completed\n');

      // Phase 5: Custom Roles & Users
      console.log('📍 Phase 5: Seeding Custom Roles & Users...\n');

      // 17. Seed Custom Roles, Users, and Access Mappings
      console.log('🔐 Seeding Custom Roles, Users, and Access Mappings...');
      const customRolesUsersSeeder = new CustomRolesUsersSeeder(
        this.dataSource,
      );
      await customRolesUsersSeeder.run();
      console.log(
        '✅ Custom Roles, Users, and Access Mappings seeding completed\n',
      );

      console.log(
        '🎉 Complete Database Seeding Process Finished Successfully!',
      );
      console.log('\n📋 Summary of All Seeded Data:');
      console.log('   • Sites (5 sites)');
      console.log('   • Roles (7 roles)');
      console.log('   • Employees (8 employees)');
      console.log('   • Brands (5 brands)');
      console.log('   • Unit Types (10 unit types)');
      console.log('   • Activities (8 activities)');
      console.log('   • Operation Points (10 operation points)');
      console.log('   • Barge (5 barge)');
      console.log('   • Population (15 population units)');
      console.log('   • Plan Working Hour (4 records)');
      console.log('   • Plan Working Hour Detail (8 records)');
      console.log('   • Permissions (6 permissions)');
      console.log('   • Menus (41 menu items)');
      console.log('   • Menu-Permission relationships (147 relationships)');
      console.log('   • Role-Permission relationships');
      console.log('   • Users (4 users)');
      console.log('   • User-Role relationships');

      console.log('\n🔑 User Credentials:');
      console.log('   • superadmin / Qwer1234! (Super Admin)');
      console.log(
        '   • productionadmin / Qwer1234! (Production Administrator)',
      );
      console.log('   • management / Qwer1234! (Management)');
      console.log('   • ccr / Qwer1234! (CCR)');
    } catch (error) {
      console.error('❌ Error during Complete Seeding Process:', error);
      throw error;
    }
  }
}
