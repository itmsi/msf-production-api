import { DataSource } from 'typeorm';

export class PermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const permissionsData = [
      // User Management
      { permissionName: 'View Users', permissionCode: 'USER_VIEW', description: 'Can view user list and details' },
      { permissionName: 'Create Users', permissionCode: 'USER_CREATE', description: 'Can create new users' },
      { permissionName: 'Edit Users', permissionCode: 'USER_EDIT', description: 'Can edit existing users' },
      { permissionName: 'Delete Users', permissionCode: 'USER_DELETE', description: 'Can delete users' },
      
      // Role Management
      { permissionName: 'View Roles', permissionCode: 'ROLE_VIEW', description: 'Can view role list and details' },
      { permissionName: 'Create Roles', permissionCode: 'ROLE_CREATE', description: 'Can create new roles' },
      { permissionName: 'Edit Roles', permissionCode: 'ROLE_EDIT', description: 'Can edit existing roles' },
      { permissionName: 'Delete Roles', permissionCode: 'ROLE_DELETE', description: 'Can delete roles' },
      
      // Site Management
      { permissionName: 'View Sites', permissionCode: 'SITE_VIEW', description: 'Can view site list and details' },
      { permissionName: 'Create Sites', permissionCode: 'SITE_CREATE', description: 'Can create new sites' },
      { permissionName: 'Edit Sites', permissionCode: 'SITE_EDIT', description: 'Can edit existing sites' },
      { permissionName: 'Delete Sites', permissionCode: 'SITE_DELETE', description: 'Can delete sites' },
      
      // Employee Management
      { permissionName: 'View Employees', permissionCode: 'EMPLOYEE_VIEW', description: 'Can view employee list and details' },
      { permissionName: 'Create Employees', permissionCode: 'EMPLOYEE_CREATE', description: 'Can create new employees' },
      { permissionName: 'Edit Employees', permissionCode: 'EMPLOYEE_EDIT', description: 'Can edit existing employees' },
      { permissionName: 'Delete Employees', permissionCode: 'EMPLOYEE_DELETE', description: 'Can delete employees' },
      
      // Population Management
      { permissionName: 'View Population', permissionCode: 'POPULATION_VIEW', description: 'Can view population list and details' },
      { permissionName: 'Create Population', permissionCode: 'POPULATION_CREATE', description: 'Can create new population records' },
      { permissionName: 'Edit Population', permissionCode: 'POPULATION_EDIT', description: 'Can edit existing population records' },
      { permissionName: 'Delete Population', permissionCode: 'POPULATION_DELETE', description: 'Can delete population records' },
      
      // Barge Management
      { permissionName: 'View Barge', permissionCode: 'BARGE_VIEW', description: 'Can view barge list and details' },
      { permissionName: 'Create Barge', permissionCode: 'BARGE_CREATE', description: 'Can create new barge records' },
      { permissionName: 'Edit Barge', permissionCode: 'BARGE_EDIT', description: 'Can edit existing barge records' },
      { permissionName: 'Delete Barge', permissionCode: 'BARGE_DELETE', description: 'Can delete barge records' },
      
      // Activities Management
      { permissionName: 'View Activities', permissionCode: 'ACTIVITIES_VIEW', description: 'Can view activities list and details' },
      { permissionName: 'Create Activities', permissionCode: 'ACTIVITIES_CREATE', description: 'Can create new activities' },
      { permissionName: 'Edit Activities', permissionCode: 'ACTIVITIES_EDIT', description: 'Can edit existing activities' },
      { permissionName: 'Delete Activities', permissionCode: 'ACTIVITIES_DELETE', description: 'Can delete activities' },
      
      // Reports
      { permissionName: 'View Reports', permissionCode: 'REPORTS_VIEW', description: 'Can view various reports' },
      { permissionName: 'Export Reports', permissionCode: 'REPORTS_EXPORT', description: 'Can export reports to various formats' },
      
      // System Settings
      { permissionName: 'View Settings', permissionCode: 'SETTINGS_VIEW', description: 'Can view system settings' },
      { permissionName: 'Edit Settings', permissionCode: 'SETTINGS_EDIT', description: 'Can edit system settings' },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const permissionData of permissionsData) {
      // Check if permission already exists
      const existingPermission = await this.dataSource.query(
        'SELECT * FROM m_permission WHERE permission_code = $1',
        [permissionData.permissionCode]
      );

      if (existingPermission.length === 0) {
        // Create new permission
        await this.dataSource.query(
          'INSERT INTO m_permission (permission_name, permission_code, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
          [permissionData.permissionName, permissionData.permissionCode, permissionData.description]
        );
        createdCount++;
        console.log(`✅ Permission created: ${permissionData.permissionCode}`);
      } else {
        skippedCount++;
        console.log(`⏭️  Permission already exists: ${permissionData.permissionCode}`);
      }
    }

    console.log(`\n📊 Permission Seeding Summary:`);
    console.log(`   • Created: ${createdCount} permissions`);
    console.log(`   • Skipped: ${skippedCount} existing permissions`);
  }
}
