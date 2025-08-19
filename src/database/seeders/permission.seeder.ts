import { DataSource } from 'typeorm';

export class PermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const permissionsData = [
      {
        permissionName: 'Create',
        permissionCode: 'CREATE',
        description: 'Can create new records',
      },
      {
        permissionName: 'Read',
        permissionCode: 'READ',
        description: 'Can view records and details',
      },
      {
        permissionName: 'Update',
        permissionCode: 'UPDATE',
        description: 'Can edit existing records',
      },
      {
        permissionName: 'Delete',
        permissionCode: 'DELETE',
        description: 'Can delete records',
      },
      {
        permissionName: 'Export',
        permissionCode: 'EXPORT',
        description: 'Can export data to various formats',
      },
      {
        permissionName: 'Import',
        permissionCode: 'IMPORT',
        description: 'Can import data from various formats',
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const permissionData of permissionsData) {
      // Check if permission already exists
      const existingPermission = await this.dataSource.query(
        'SELECT * FROM m_permission WHERE permission_code = $1',
        [permissionData.permissionCode],
      );

      if (existingPermission.length === 0) {
        // Create new permission
        await this.dataSource.query(
          'INSERT INTO m_permission (permission_name, permission_code, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
          [
            permissionData.permissionName,
            permissionData.permissionCode,
            permissionData.description,
          ],
        );
        createdCount++;
        console.log(`✅ Permission created: ${permissionData.permissionCode}`);
      } else {
        skippedCount++;
        console.log(
          `⏭️  Permission already exists: ${permissionData.permissionCode}`,
        );
      }
    }

    console.log(`\n📊 Permission Seeding Summary:`);
    console.log(`   • Created: ${createdCount} permissions`);
    console.log(`   • Skipped: ${skippedCount} existing permissions`);
  }
}
