import { DataSource } from 'typeorm';
import { PermissionSeeder } from './permission.seeder';
import { MenuSeeder } from './menu.seeder';
import { MenuHasPermissionSeeder } from './menu-has-permission.seeder';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './user.seeder';
import { RoleHasPermissionSeeder } from './role-has-permission.seeder';
import { UserRoleSeeder } from './user-role.seeder';

export class ProductionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🚀 Starting Production Module seeding process...\n');

    try {
      // 1. Seed Permissions (no dependencies)
      console.log('🔐 Seeding Permissions...');
      const permissionSeeder = new PermissionSeeder(this.dataSource);
      await permissionSeeder.run();
      console.log('✅ Permissions seeding completed\n');

      // 2. Seed Menus (no dependencies)
      console.log('📋 Seeding Menus...');
      const menuSeeder = new MenuSeeder(this.dataSource);
      await menuSeeder.run();
      console.log('✅ Menus seeding completed\n');

      // 3. Seed Menu-Permission relationships (depends on Menus and Permissions)
      console.log('🔗 Seeding Menu-Permission relationships...');
      const menuHasPermissionSeeder = new MenuHasPermissionSeeder(this.dataSource);
      await menuHasPermissionSeeder.run();
      console.log('✅ Menu-Permission relationships seeding completed\n');

      // 4. Seed Roles (no dependencies)
      console.log('👥 Seeding Roles...');
      const roleSeeder = new RoleSeeder(this.dataSource);
      await roleSeeder.run();
      console.log('✅ Roles seeding completed\n');

      // 5. Seed Users (no dependencies)
      console.log('👤 Seeding Users...');
      const userSeeder = new UserSeeder(this.dataSource);
      await userSeeder.run();
      console.log('✅ Users seeding completed\n');

      // 6. Seed Role-Permission relationships (depends on Roles and Permissions)
      console.log('🔗 Seeding Role-Permission relationships...');
      const roleHasPermissionSeeder = new RoleHasPermissionSeeder(this.dataSource);
      await roleHasPermissionSeeder.run();
      console.log('✅ Role-Permission relationships seeding completed\n');

      // 7. Seed User-Role relationships (depends on Users and Roles)
      console.log('🔗 Seeding User-Role relationships...');
      const userRoleSeeder = new UserRoleSeeder(this.dataSource);
      await userRoleSeeder.run();
      console.log('✅ User-Role relationships seeding completed\n');

      console.log('🎉 Production Module seeding completed successfully!');
      console.log('\n📋 Summary of seeded data:');
      console.log('   • 6 Permissions (CREATE, READ, UPDATE, DELETE, EXPORT, IMPORT)');
      console.log('   • 50+ Menu Items with proper hierarchy');
      console.log('   • Menu-Permission relationships for Production Module');
      console.log('   • 1 Role (Super Admin)');
      console.log('   • 1 User (superadmin)');
      console.log('   • Role-Permission relationships (Super Admin gets all permissions)');
      console.log('   • User-Role relationships (superadmin -> Super Admin)');

      console.log('\n🔑 Super Admin Credentials:');
      console.log('   • Username: superadmin');
      console.log('   • Password: Qwer1234!');
      console.log('   • Role: Super Admin (full access to all menus and features)');

    } catch (error) {
      console.error('❌ Error during Production Module seeding:', error);
      throw error;
    }
  }
}
