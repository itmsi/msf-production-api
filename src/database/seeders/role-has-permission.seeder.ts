import { DataSource } from 'typeorm';

export class RoleHasPermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🔗 Seeding Role-Permission relationships for Super Admin...');

    try {
      // Get Super Admin role ID
      const superAdminRole = await this.dataSource.query(
        'SELECT id FROM m_role WHERE role_code = $1',
        ['SUPER_ADMIN'],
      );

      if (superAdminRole.length === 0) {
        console.log(
          '❌ Super Admin role not found. Please run role seeder first.',
        );
        return;
      }

      const roleId = superAdminRole[0].id;

      // Get all menu-permission relationships
      const allMenuPermissions = await this.dataSource.query(
        'SELECT id, permission_id FROM r_menu_has_permission',
      );

      if (allMenuPermissions.length === 0) {
        console.log(
          '❌ No menu-permission relationships found. Please run menu-has-permission seeder first.',
        );
        return;
      }

      let createdCount = 0;
      let skippedCount = 0;

      // Give all menu-permission combinations to Super Admin role
      for (const menuPermission of allMenuPermissions) {
        const mhpId = menuPermission.id;
        const permissionId = menuPermission.permission_id;

        // Check if relationship already exists
        const existingRelation = await this.dataSource.query(
          'SELECT * FROM r_role_has_permission WHERE role_id = $1 AND mhp_id = $2 AND permission_id = $3',
          [roleId, mhpId, permissionId],
        );

        if (existingRelation.length === 0) {
          // Create new role-permission relationship
          await this.dataSource.query(
            'INSERT INTO r_role_has_permission (role_id, mhp_id, permission_id, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
            [roleId, mhpId, permissionId],
          );
          createdCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(`✅ Role-Permission relationships seeding completed`);
      console.log(`\n📊 Role-Permission Seeding Summary:`);
      console.log(`   • Created: ${createdCount} relationships`);
      console.log(`   • Skipped: ${skippedCount} existing relationships`);
      console.log(
        `   • Total menu-permission combinations assigned to Super Admin: ${allMenuPermissions.length}`,
      );
    } catch (error) {
      console.error('❌ Error during Role-Permission seeding:', error);
      throw error;
    }
  }
}
