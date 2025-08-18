import { DataSource } from 'typeorm';

export class RoleSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    // Get first site for roles
    const sites = await this.dataSource.query('SELECT id FROM m_sites LIMIT 1');
    if (sites.length === 0) {
      console.log('❌ No sites found. Please run sites seeder first.');
      return;
    }
    const defaultSiteId = sites[0].id;

    const rolesData = [
      {
        roleCode: 'SUPER_ADMIN',
        positionName: 'Super Administrator',
        roleParent: '',
        sitesId: defaultSiteId
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
          'INSERT INTO m_role (role_code, position_name, role_parent, sites_id, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [roleData.roleCode, roleData.positionName, roleData.roleParent, roleData.sitesId]
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
