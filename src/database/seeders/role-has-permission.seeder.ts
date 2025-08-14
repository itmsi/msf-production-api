import { DataSource } from 'typeorm';

export class RoleHasPermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const rolePermissionData = [
      // Super Admin - gets all permissions
      {
        roleCode: 'SUPER_ADMIN',
        permissions: [
          'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE',
          'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT', 'ROLE_DELETE',
          'SITE_VIEW', 'SITE_CREATE', 'SITE_EDIT', 'SITE_DELETE',
          'EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_EDIT', 'EMPLOYEE_DELETE',
          'POPULATION_VIEW', 'POPULATION_CREATE', 'POPULATION_EDIT', 'POPULATION_DELETE',
          'BARGE_VIEW', 'BARGE_CREATE', 'BARGE_EDIT', 'BARGE_DELETE',
          'ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT', 'ACTIVITIES_DELETE',
          'REPORTS_VIEW', 'REPORTS_EXPORT',
          'SETTINGS_VIEW', 'SETTINGS_EDIT'
        ]
      },
      
      // Admin - gets admin and below permissions
      {
        roleCode: 'ADMIN',
        permissions: [
          'USER_VIEW', 'USER_CREATE', 'USER_EDIT',
          'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT',
          'SITE_VIEW', 'SITE_CREATE', 'SITE_EDIT',
          'EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_EDIT',
          'POPULATION_VIEW', 'POPULATION_CREATE', 'POPULATION_EDIT',
          'BARGE_VIEW', 'BARGE_CREATE', 'BARGE_EDIT',
          'ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT',
          'REPORTS_VIEW', 'REPORTS_EXPORT',
          'SETTINGS_VIEW'
        ]
      },
      
      // Manager - gets manager and below permissions
      {
        roleCode: 'MANAGER',
        permissions: [
          'USER_VIEW',
          'ROLE_VIEW',
          'SITE_VIEW',
          'EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_EDIT',
          'POPULATION_VIEW', 'POPULATION_CREATE', 'POPULATION_EDIT',
          'BARGE_VIEW', 'BARGE_CREATE', 'BARGE_EDIT',
          'ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT',
          'REPORTS_VIEW', 'REPORTS_EXPORT'
        ]
      },
      
      // Staff - gets limited permissions
      {
        roleCode: 'STAFF',
        permissions: [
          'SITE_VIEW',
          'EMPLOYEE_VIEW',
          'POPULATION_VIEW', 'POPULATION_CREATE', 'POPULATION_EDIT',
          'BARGE_VIEW', 'BARGE_CREATE',
          'ACTIVITIES_VIEW',
          'REPORTS_VIEW'
        ]
      },
      
      // Operator - gets operational permissions
      {
        roleCode: 'OPERATOR',
        permissions: [
          'SITE_VIEW',
          'POPULATION_VIEW', 'POPULATION_CREATE',
          'BARGE_VIEW', 'BARGE_CREATE',
          'ACTIVITIES_VIEW',
          'REPORTS_VIEW'
        ]
      },
      
      // Viewer - gets view-only permissions
      {
        roleCode: 'VIEWER',
        permissions: [
          'SITE_VIEW',
          'EMPLOYEE_VIEW',
          'POPULATION_VIEW',
          'BARGE_VIEW',
          'ACTIVITIES_VIEW',
          'REPORTS_VIEW'
        ]
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const rolePermission of rolePermissionData) {
      // Get role ID
      const role = await this.dataSource.query(
        'SELECT id FROM m_role WHERE role_code = $1',
        [rolePermission.roleCode]
      );

      if (role.length === 0) {
        console.log(`❌ Role not found: ${rolePermission.roleCode}`);
        continue;
      }

      const roleId = role[0].id;

      for (const permissionCode of rolePermission.permissions) {
        // Get permission ID
        const permission = await this.dataSource.query(
          'SELECT id FROM m_permission WHERE permission_code = $1',
          [permissionCode]
        );

        if (permission.length === 0) {
          console.log(`❌ Permission not found: ${permissionCode}`);
          continue;
        }

        const permissionId = permission[0].id;

        // Get menu-permission relationship ID
        const menuPermission = await this.dataSource.query(
          'SELECT mhp.id FROM r_menu_has_permission mhp JOIN m_permission p ON mhp.permission_id = p.id WHERE p.permission_code = $1 LIMIT 1',
          [permissionCode]
        );

        if (menuPermission.length === 0) {
          console.log(`❌ Menu-permission relationship not found for: ${permissionCode}`);
          continue;
        }

        const mhpId = menuPermission[0].id;

        // Check if relationship already exists
        const existingRelation = await this.dataSource.query(
          'SELECT * FROM r_role_has_permission WHERE role_id = $1 AND mhp_id = $2 AND permission_id = $3',
          [roleId, mhpId, permissionId]
        );

        if (existingRelation.length === 0) {
          // Create new role-permission relationship
          await this.dataSource.query(
            'INSERT INTO r_role_has_permission (role_id, mhp_id, permission_id, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
            [roleId, mhpId, permissionId]
          );
          createdCount++;
          console.log(`✅ Role-permission relationship created: ${rolePermission.roleCode} -> ${permissionCode}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Role-permission relationship already exists: ${rolePermission.roleCode} -> ${permissionCode}`);
        }
      }
    }

    console.log(`\n📊 Role-Permission Seeding Summary:`);
    console.log(`   • Created: ${createdCount} relationships`);
    console.log(`   • Skipped: ${skippedCount} existing relationships`);
  }
}
