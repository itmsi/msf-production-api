import { DataSource } from 'typeorm';

export class RoleSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const rolesData = [
      {
        roleName: 'Super Admin',
        roleCode: 'SUPER_ADMIN',
        description: 'Super Administrator dengan akses penuh ke semua menu dan fitur',
        status: 'active'
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const roleData of rolesData) {
      // Check if role already exists
      const existingRole = await this.dataSource.query(
        'SELECT * FROM m_role WHERE role_code = $1',
        [roleData.roleCode]
      );

      if (existingRole.length === 0) {
        // Create new role
        await this.dataSource.query(
          'INSERT INTO m_role (role_name, role_code, description, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [roleData.roleName, roleData.roleCode, roleData.description, roleData.status]
        );
        createdCount++;
        console.log(`✅ Role created: ${roleData.roleCode}`);
      } else {
        skippedCount++;
        console.log(`⏭️  Role already exists: ${roleData.roleCode}`);
      }
    }

    console.log(`\n📊 Role Seeding Summary:`);
    console.log(`   • Created: ${createdCount} roles`);
    console.log(`   • Skipped: ${skippedCount} existing roles`);
  }
}
