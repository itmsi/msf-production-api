import { DataSource } from 'typeorm';

export class MenuHasPermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const menuPermissionData = [
      // Dashboard - Read saja
      { menuCode: 'DASHBOARD', permissions: ['READ'] },

      // Overall Performance - Read saja
      { menuCode: 'OVERALL_PERFORMANCE', permissions: ['READ'] },

      // Monthly Production Performance - Read, Export
      {
        menuCode: 'MONTHLY_PRODUCTION_PERFORMANCE',
        permissions: ['READ', 'EXPORT'],
      },

      // CCR Hourly - Read saja
      { menuCode: 'CCR_HOURLY', permissions: ['READ'] },

      // Hauling Performance - Read, Update, Delete, Export
      {
        menuCode: 'HAULING_PERFORMANCE',
        permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // Barging Performance - Read, Update, Delete, Export
      {
        menuCode: 'BARGING_PERFORMANCE',
        permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // View Data Page - Read saja
      { menuCode: 'VIEW_DATA_PAGE', permissions: ['READ'] },

      // Control Page - Read saja
      { menuCode: 'CONTROL_PAGE', permissions: ['READ'] },

      // Control Day Production - Read, Export
      { menuCode: 'CONTROL_DAY_PRODUCTION', permissions: ['READ', 'EXPORT'] },

      // Control Day Work Hour - Read, Export
      { menuCode: 'CONTROL_DAY_WORK_HOUR', permissions: ['READ', 'EXPORT'] },

      // Control Shift Production - Read, Export
      { menuCode: 'CONTROL_SHIFT_PRODUCTION', permissions: ['READ', 'EXPORT'] },

      // Control Shift Work Hour - Read, Export
      { menuCode: 'CONTROL_SHIFT_WORK_HOUR', permissions: ['READ', 'EXPORT'] },

      // Summary Production - Read, Export
      { menuCode: 'SUMMARY_PRODUCTION', permissions: ['READ', 'EXPORT'] },

      // Analysis Barge & Hauling - Read, Export
      { menuCode: 'ANALYSIS_BARGE_HAULING', permissions: ['READ', 'EXPORT'] },

      // Entry Data Page - Read saja
      { menuCode: 'ENTRY_DATA_PAGE', permissions: ['READ'] },

      // Work Plan - Read saja
      { menuCode: 'WORK_PLAN', permissions: ['READ'] },

      // Daily Working Hour Plan List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'DAILY_WORKING_HOUR_PLAN_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // Settings Daily Working Hour Plan - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'SETTINGS_DAILY_WORKING_HOUR_PLAN',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // Daily Production Plan List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'DAILY_PRODUCTION_PLAN_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // Settings Daily Production Plan - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'SETTINGS_DAILY_PRODUCTION_PLAN',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // MTD Production - Read saja
      { menuCode: 'MTD_PRODUCTION', permissions: ['READ'] },

      // Production List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'PRODUCTION_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // Loss Time List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'LOSS_TIME_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // Barge List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'BARGE_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // Fuel Consumption List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'FUEL_CONSUMPTION_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // CCR Hourly Entry - Read saja
      { menuCode: 'CCR_HOURLY_ENTRY', permissions: ['READ'] },

      // CCR Hauling List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'CCR_HAULING_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // CCR Barging List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'CCR_BARGING_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // CCR Problem Hauling List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'CCR_PROBLEM_HAULING_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // CCR Problem Barging List - Create, Read, Update, Delete, Export, Import
      {
        menuCode: 'CCR_PROBLEM_BARGING_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
      },

      // Master Data Page - Read saja
      { menuCode: 'MASTER_DATA_PAGE', permissions: ['READ'] },

      // Unit Type - Create, Read, Update, Delete, Export
      {
        menuCode: 'UNIT_TYPE',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // COA Population List - Create, Read, Update, Delete, Export
      {
        menuCode: 'COA_POPULATION_LIST',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // Sites - Create, Read, Update, Delete
      {
        menuCode: 'SITES',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      },

      // Activities - Create, Read, Update, Delete, Export
      {
        menuCode: 'ACTIVITIES',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // User - Create, Read, Update, Delete, Export
      {
        menuCode: 'USER',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // Employee - Create, Read, Update, Delete, Export
      {
        menuCode: 'EMPLOYEE',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // Barge - Create, Read, Update, Delete, Export
      {
        menuCode: 'BARGE',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
      },

      // Brand - Create, Read, Update, Delete
      {
        menuCode: 'BRAND',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      },

      // Profile - Read saja
      { menuCode: 'PROFILE', permissions: ['READ'] },

      // My Profile - Create, Read, Update, Delete
      {
        menuCode: 'MY_PROFILE',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const menuPermission of menuPermissionData) {
      // Get menu ID
      const menu = await this.dataSource.query(
        'SELECT id FROM m_menu WHERE menu_code = $1',
        [menuPermission.menuCode],
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
          [permissionCode],
        );

        if (permission.length === 0) {
          console.log(`❌ Permission not found: ${permissionCode}`);
          continue;
        }

        const permissionId = permission[0].id;

        // Check if relationship already exists
        const existingRelation = await this.dataSource.query(
          'SELECT * FROM r_menu_has_permission WHERE menu_id = $1 AND permission_id = $2',
          [menuId, permissionId],
        );

        if (existingRelation.length === 0) {
          // Create new menu-permission relationship
          await this.dataSource.query(
            'INSERT INTO r_menu_has_permission (menu_id, permission_id, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
            [menuId, permissionId],
          );
          createdCount++;
          console.log(
            `✅ Menu-permission relationship created: ${menuPermission.menuCode} -> ${permissionCode}`,
          );
        } else {
          skippedCount++;
          console.log(
            `⏭️  Menu-permission relationship already exists: ${menuPermission.menuCode} -> ${permissionCode}`,
          );
        }
      }
    }

    console.log(`\n📊 Menu-Permission Seeding Summary:`);
    console.log(`   • Created: ${createdCount} relationships`);
    console.log(`   • Skipped: ${skippedCount} existing relationships`);
  }
}
