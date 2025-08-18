import { DataSource } from 'typeorm';
import { PermissionSeeder } from './permission.seeder';
import { MenuSeeder } from './menu.seeder';
import { MenuHasPermissionSeeder } from './menu-has-permission.seeder';

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

      console.log('🎉 Production Module seeding completed successfully!');
      console.log('\n📋 Summary of seeded data:');
      console.log('   • 6 Permissions (CREATE, READ, UPDATE, DELETE, EXPORT, IMPORT)');
      console.log('   • 50+ Menu Items with proper hierarchy');
      console.log('   • Menu-Permission relationships for Production Module');

    } catch (error) {
      console.error('❌ Error during Production Module seeding:', error);
      throw error;
    }
  }
}
