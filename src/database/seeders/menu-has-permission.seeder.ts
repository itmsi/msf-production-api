import { DataSource } from 'typeorm';

export class MenuHasPermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const menuPermissionData = [
      // Dashboard - no specific permissions needed
      
      // Master Data permissions
      { menuCode: 'SITES', permissions: ['SITE_VIEW', 'SITE_CREATE', 'SITE_EDIT', 'SITE_DELETE'] },
      { menuCode: 'EMPLOYEES', permissions: ['EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_EDIT', 'EMPLOYEE_DELETE'] },
      { menuCode: 'ROLES', permissions: ['ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT', 'ROLE_DELETE'] },
      { menuCode: 'USERS', permissions: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE'] },
      { menuCode: 'BRANDS', permissions: ['SITE_VIEW', 'SITE_CREATE', 'SITE_EDIT', 'SITE_DELETE'] },
      { menuCode: 'UNIT_TYPES', permissions: ['SITE_VIEW', 'SITE_CREATE', 'SITE_EDIT', 'SITE_DELETE'] },
      { menuCode: 'ACTIVITIES', permissions: ['ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT', 'ACTIVITIES_DELETE'] },
      { menuCode: 'OPERATION_POINTS', permissions: ['SITE_VIEW', 'SITE_CREATE', 'SITE_EDIT', 'SITE_DELETE'] },
      { menuCode: 'BARGES', permissions: ['BARGE_VIEW', 'BARGE_CREATE', 'BARGE_EDIT', 'BARGE_DELETE'] },
      
      // Operations permissions
      { menuCode: 'POPULATION', permissions: ['POPULATION_VIEW', 'POPULATION_CREATE', 'POPULATION_EDIT', 'POPULATION_DELETE'] },
      { menuCode: 'INPUT_BARGE', permissions: ['BARGE_VIEW', 'BARGE_CREATE', 'BARGE_EDIT'] },
      { menuCode: 'BASE_DATA_PRODUCTION', permissions: ['REPORTS_VIEW'] },
      { menuCode: 'LOSS_TIME', permissions: ['REPORTS_VIEW'] },
      { menuCode: 'FUEL', permissions: ['REPORTS_VIEW'] },
      { menuCode: 'PLAN_PRODUCTION', permissions: ['REPORTS_VIEW'] },
      { menuCode: 'PLAN_WORKING_HOUR', permissions: ['REPORTS_VIEW'] },
      
      // CCR permissions
      { menuCode: 'CCR_HAULING', permissions: ['REPORTS_VIEW'] },
      { menuCode: 'CCR_HAULING_PROBLEM', permissions: ['REPORTS_VIEW'] },
      { menuCode: 'CCR_BARGING', permissions: ['REPORTS_VIEW'] },
      { menuCode: 'CCR_BARGING_PROBLEM', permissions: ['REPORTS_VIEW'] },
      
      // Reports permissions
      { menuCode: 'PRODUCTION_REPORT', permissions: ['REPORTS_VIEW', 'REPORTS_EXPORT'] },
      { menuCode: 'FUEL_REPORT', permissions: ['REPORTS_VIEW', 'REPORTS_EXPORT'] },
      { menuCode: 'LOSS_TIME_REPORT', permissions: ['REPORTS_VIEW', 'REPORTS_EXPORT'] },
      { menuCode: 'CCR_REPORT', permissions: ['REPORTS_VIEW', 'REPORTS_EXPORT'] },
      
      // Settings permissions
      { menuCode: 'SYSTEM_SETTINGS', permissions: ['SETTINGS_VIEW', 'SETTINGS_EDIT'] },
      { menuCode: 'USER_PREFERENCES', permissions: ['SETTINGS_VIEW'] },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const menuPermission of menuPermissionData) {
      // Get menu ID
      const menu = await this.dataSource.query(
        'SELECT id FROM m_menu WHERE menu_code = $1',
        [menuPermission.menuCode]
      );

      if (menu.length === 0) {
        console.log(`❌ Menu not found: ${menuPermission.menuCode}`);
        continue;
      }

      const menuId = menu[0].id;

      for (const permissionCode of menuPermission.permissions) {
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

        // Check if relationship already exists
        const existingRelation = await this.dataSource.query(
          'SELECT * FROM r_menu_has_permission WHERE menu_id = $1 AND permission_id = $2',
          [menuId, permissionId]
        );

        if (existingRelation.length === 0) {
          // Create new menu-permission relationship
          await this.dataSource.query(
            'INSERT INTO r_menu_has_permission (menu_id, permission_id, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
            [menuId, permissionId]
          );
          createdCount++;
          console.log(`✅ Menu-permission relationship created: ${menuPermission.menuCode} -> ${permissionCode}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Menu-permission relationship already exists: ${menuPermission.menuCode} -> ${permissionCode}`);
        }
      }
    }

    console.log(`\n📊 Menu-Permission Seeding Summary:`);
    console.log(`   • Created: ${createdCount} relationships`);
    console.log(`   • Skipped: ${skippedCount} existing relationships`);
  }
}
