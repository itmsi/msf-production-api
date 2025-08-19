import { DataSource } from 'typeorm';

export class UserRoleSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🔗 Seeding User-Role relationships...');

    try {
      // Get Super Admin user ID
      const superAdminUser = await this.dataSource.query(
        'SELECT id FROM m_user WHERE username = $1',
        ['superadmin'],
      );

      if (superAdminUser.length === 0) {
        console.log(
          '❌ Super Admin user not found. Please run user seeder first.',
        );
        return;
      }

      const userId = superAdminUser[0].id;

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

      // Check if relationship already exists
      const existingRelation = await this.dataSource.query(
        'SELECT * FROM r_user_role WHERE user_id = $1 AND role_id = $2',
        [userId, roleId],
      );

      if (existingRelation.length === 0) {
        // Create new user-role relationship
        await this.dataSource.query(
          'INSERT INTO r_user_role (user_id, role_id, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          [userId, roleId],
        );
        console.log(
          `✅ User-Role relationship created: superadmin -> SUPER_ADMIN`,
        );
      } else {
        console.log(
          `⏭️  User-Role relationship already exists: superadmin -> SUPER_ADMIN`,
        );
      }

      console.log(`✅ User-Role relationships seeding completed`);
    } catch (error) {
      console.error('❌ Error during User-Role seeding:', error);
      throw error;
    }
  }
}
