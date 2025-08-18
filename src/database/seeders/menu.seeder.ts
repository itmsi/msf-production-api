import { DataSource } from 'typeorm';

export class MenuSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const menusData = [
      // Dashboard (parent menu)
      { menuName: 'Dashboard', menuCode: 'DASHBOARD', icon: 'dashboard', url: null, isParent: true, sortOrder: 1, module: 'production' },
      
      // Overall Performance (sub menu dari dashboard)
      { menuName: 'Overall Performance', menuCode: 'OVERALL_PERFORMANCE', icon: 'analytics', url: '/dashboard/overall-performance', isParent: false, sortOrder: 1, parentCode: 'DASHBOARD', module: 'production' },
      
      // Monthly Production Performance (sub menu dari Overall Performance)
      { menuName: 'Monthly Production Performance', menuCode: 'MONTHLY_PRODUCTION_PERFORMANCE', icon: 'bar_chart', url: '/dashboard/overall-performance/monthly', isParent: false, sortOrder: 1, parentCode: 'OVERALL_PERFORMANCE', module: 'production' },
      
      // CCR Hourly (sub menu dari dashboard)
      { menuName: 'CCR Hourly', menuCode: 'CCR_HOURLY', icon: 'schedule', url: '/dashboard/ccr-hourly', isParent: false, sortOrder: 2, parentCode: 'DASHBOARD', module: 'production' },
      
      // Hauling Performance (sub menu dari CCR Hourly)
      { menuName: 'Hauling Performance', menuCode: 'HAULING_PERFORMANCE', icon: 'local_shipping', url: '/dashboard/ccr-hourly/hauling', isParent: false, sortOrder: 1, parentCode: 'CCR_HOURLY', module: 'production' },
      
      // Barging Performance (sub menu dari CCR Hourly)
      { menuName: 'Barging Performance', menuCode: 'BARGING_PERFORMANCE', icon: 'local_shipping', url: '/dashboard/ccr-hourly/barging', isParent: false, sortOrder: 2, parentCode: 'CCR_HOURLY', module: 'production' },

      // View Data Page (parent menu)
      { menuName: 'View Data Page', menuCode: 'VIEW_DATA_PAGE', icon: 'visibility', url: null, isParent: true, sortOrder: 2, module: 'production' },
      
      // Control Page (sub menu dari View Data Page)
      { menuName: 'Control Page', menuCode: 'CONTROL_PAGE', icon: 'control_camera', url: '/view-data/control', isParent: false, sortOrder: 1, parentCode: 'VIEW_DATA_PAGE', module: 'production' },
      
      // Control Day Production (sub menu dari Control Page)
      { menuName: 'Control Day Production', menuCode: 'CONTROL_DAY_PRODUCTION', icon: 'production_quantity_limits', url: '/view-data/control/day-production', isParent: false, sortOrder: 1, parentCode: 'CONTROL_PAGE', module: 'production' },
      
      // Control Day Work Hour (sub menu dari Control Page)
      { menuName: 'Control Day Work Hour', menuCode: 'CONTROL_DAY_WORK_HOUR', icon: 'schedule', url: '/view-data/control/day-work-hour', isParent: false, sortOrder: 2, parentCode: 'CONTROL_PAGE', module: 'production' },
      
      // Control Shift Production (sub menu dari Control Page)
      { menuName: 'Control Shift Production', menuCode: 'CONTROL_SHIFT_PRODUCTION', icon: 'production_quantity_limits', url: '/view-data/control/shift-production', isParent: false, sortOrder: 3, parentCode: 'CONTROL_PAGE', module: 'production' },
      
      // Control Shift Work Hour (sub menu dari Control Page)
      { menuName: 'Control Shift Work Hour', menuCode: 'CONTROL_SHIFT_WORK_HOUR', icon: 'schedule', url: '/view-data/control/shift-work-hour', isParent: false, sortOrder: 4, parentCode: 'CONTROL_PAGE', module: 'production' },
      
      // Summary Production (sub menu dari View Data Page)
      { menuName: 'Summary Production', menuCode: 'SUMMARY_PRODUCTION', icon: 'summarize', url: '/view-data/summary-production', isParent: false, sortOrder: 2, parentCode: 'VIEW_DATA_PAGE', module: 'production' },
      
      // Analysis Barge & Hauling (sub menu dari View Data Page)
      { menuName: 'Analysis Barge & Hauling', menuCode: 'ANALYSIS_BARGE_HAULING', icon: 'analytics', url: '/view-data/analysis-barge-hauling', isParent: false, sortOrder: 3, parentCode: 'VIEW_DATA_PAGE', module: 'production' },

      // Entry Data Page (parent menu)
      { menuName: 'Entry Data Page', menuCode: 'ENTRY_DATA_PAGE', icon: 'edit', url: null, isParent: true, sortOrder: 3, module: 'production' },
      
      // Work Plan (sub menu dari Entry Data Page)
      { menuName: 'Work Plan', menuCode: 'WORK_PLAN', icon: 'work', url: '/entry-data/work-plan', isParent: false, sortOrder: 1, parentCode: 'ENTRY_DATA_PAGE', module: 'production' },
      
      // Daily Working Hour Plan List (sub menu dari Work Plan)
      { menuName: 'Daily Working Hour Plan List', menuCode: 'DAILY_WORKING_HOUR_PLAN_LIST', icon: 'schedule', url: '/entry-data/work-plan/daily-working-hour', isParent: false, sortOrder: 1, parentCode: 'WORK_PLAN', module: 'production' },
      
      // Settings Daily Working Hour Plan (sub menu dari Work Plan)
      { menuName: 'Settings Daily Working Hour Plan', menuCode: 'SETTINGS_DAILY_WORKING_HOUR_PLAN', icon: 'settings', url: '/entry-data/work-plan/settings-daily-working-hour', isParent: false, sortOrder: 2, parentCode: 'WORK_PLAN', module: 'production' },
      
      // Daily Production Plan List (sub menu dari Work Plan)
      { menuName: 'Daily Production Plan List', menuCode: 'DAILY_PRODUCTION_PLAN_LIST', icon: 'production_quantity_limits', url: '/entry-data/work-plan/daily-production', isParent: false, sortOrder: 3, parentCode: 'WORK_PLAN', module: 'production' },
      
      // Settings Daily Production Plan (sub menu dari Work Plan)
      { menuName: 'Settings Daily Production Plan', menuCode: 'SETTINGS_DAILY_PRODUCTION_PLAN', icon: 'settings', url: '/entry-data/work-plan/settings-daily-production', isParent: false, sortOrder: 4, parentCode: 'WORK_PLAN', module: 'production' },

      // MTD Production (sub menu dari Entry Data Page)
      { menuName: 'MTD Production', menuCode: 'MTD_PRODUCTION', icon: 'trending_up', url: '/entry-data/mtd-production', isParent: false, sortOrder: 2, parentCode: 'ENTRY_DATA_PAGE', module: 'production' },
      
      // Production List (sub menu dari MTD Production)
      { menuName: 'Production List', menuCode: 'PRODUCTION_LIST', icon: 'list', url: '/entry-data/mtd-production/production-list', isParent: false, sortOrder: 1, parentCode: 'MTD_PRODUCTION', module: 'production' },
      
      // Loss Time List (sub menu dari MTD Production)
      { menuName: 'Loss Time List', menuCode: 'LOSS_TIME_LIST', icon: 'schedule', url: '/entry-data/mtd-production/loss-time-list', isParent: false, sortOrder: 2, parentCode: 'MTD_PRODUCTION', module: 'production' },
      
      // Barge List (sub menu dari MTD Production)
      { menuName: 'Barge List', menuCode: 'BARGE_LIST', icon: 'local_shipping', url: '/entry-data/mtd-production/barge-list', isParent: false, sortOrder: 3, parentCode: 'MTD_PRODUCTION', module: 'production' },
      
      // Fuel Consumption List (sub menu dari MTD Production)
      { menuName: 'Fuel Consumption List', menuCode: 'FUEL_CONSUMPTION_LIST', icon: 'local_gas_station', url: '/entry-data/mtd-production/fuel-consumption-list', isParent: false, sortOrder: 4, parentCode: 'MTD_PRODUCTION', module: 'production' },

      // CCR Hourly (sub menu dari Entry Data Page)
      { menuName: 'CCR Hourly', menuCode: 'CCR_HOURLY_ENTRY', icon: 'schedule', url: '/entry-data/ccr-hourly', isParent: false, sortOrder: 3, parentCode: 'ENTRY_DATA_PAGE', module: 'production' },
      
      // CCR Hauling List (sub menu dari CCR Hourly)
      { menuName: 'CCR Hauling List', menuCode: 'CCR_HAULING_LIST', icon: 'local_shipping', url: '/entry-data/ccr-hourly/hauling-list', isParent: false, sortOrder: 1, parentCode: 'CCR_HOURLY_ENTRY', module: 'production' },
      
      // CCR Barging List (sub menu dari CCR Hourly)
      { menuName: 'CCR Barging List', menuCode: 'CCR_BARGING_LIST', icon: 'local_shipping', url: '/entry-data/ccr-hourly/barging-list', isParent: false, sortOrder: 2, parentCode: 'CCR_HOURLY_ENTRY', module: 'production' },
      
      // CCR Problem Hauling List (sub menu dari CCR Hourly)
      { menuName: 'CCR Problem Hauling List', menuCode: 'CCR_PROBLEM_HAULING_LIST', icon: 'error', url: '/entry-data/ccr-hourly/problem-hauling-list', isParent: false, sortOrder: 3, parentCode: 'CCR_HOURLY_ENTRY', module: 'production' },
      
      // CCR Problem Barging List (sub menu dari CCR Hourly)
      { menuName: 'CCR Problem Barging List', menuCode: 'CCR_PROBLEM_BARGING_LIST', icon: 'error', url: '/entry-data/ccr-hourly/problem-barging-list', isParent: false, sortOrder: 4, parentCode: 'CCR_HOURLY_ENTRY', module: 'production' },

      // Master Data Page (parent menu)
      { menuName: 'Master Data Page', menuCode: 'MASTER_DATA_PAGE', icon: 'database', url: null, isParent: true, sortOrder: 4, module: 'production' },
      
      // Unit Type (sub menu dari Master Data Page)
      { menuName: 'Unit Type', menuCode: 'UNIT_TYPE', icon: 'category', url: '/master-data/unit-type', isParent: false, sortOrder: 1, parentCode: 'MASTER_DATA_PAGE', module: 'production' },
      
      // COA Population List (sub menu dari Master Data Page)
      { menuName: 'COA Population List', menuCode: 'COA_POPULATION_LIST', icon: 'group_work', url: '/master-data/coa-population-list', isParent: false, sortOrder: 2, parentCode: 'MASTER_DATA_PAGE', module: 'production' },
      
      // Sites (sub menu dari Master Data Page)
      { menuName: 'Sites', menuCode: 'SITES', icon: 'location', url: '/master-data/sites', isParent: false, sortOrder: 3, parentCode: 'MASTER_DATA_PAGE', module: 'production' },
      
      // Activities (sub menu dari Master Data Page)
      { menuName: 'Activities', menuCode: 'ACTIVITIES', icon: 'assignment', url: '/master-data/activities', isParent: false, sortOrder: 4, parentCode: 'MASTER_DATA_PAGE', module: 'production' },
      
      // User (sub menu dari Master Data Page)
      { menuName: 'User', menuCode: 'USER', icon: 'person', url: '/master-data/user', isParent: false, sortOrder: 5, parentCode: 'MASTER_DATA_PAGE', module: 'production' },
      
      // Employee (sub menu dari Master Data Page)
      { menuName: 'Employee', menuCode: 'EMPLOYEE', icon: 'people', url: '/master-data/employee', isParent: false, sortOrder: 6, parentCode: 'MASTER_DATA_PAGE', module: 'production' },
      
      // Barge (sub menu dari Master Data Page)
      { menuName: 'Barge', menuCode: 'BARGE', icon: 'local_shipping', url: '/master-data/barge', isParent: false, sortOrder: 7, parentCode: 'MASTER_DATA_PAGE', module: 'production' },
      
      // Brand (sub menu dari Master Data Page)
      { menuName: 'Brand', menuCode: 'BRAND', icon: 'label', url: '/master-data/brand', isParent: false, sortOrder: 8, parentCode: 'MASTER_DATA_PAGE', module: 'production' },

      // Profile (parent menu)
      { menuName: 'Profile', menuCode: 'PROFILE', icon: 'account_circle', url: null, isParent: true, sortOrder: 5, module: 'production' },
      
      // My Profile (sub menu dari Profile)
      { menuName: 'My Profile', menuCode: 'MY_PROFILE', icon: 'person', url: '/profile/my-profile', isParent: false, sortOrder: 1, parentCode: 'PROFILE', module: 'production' },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    // First, create parent menus
    for (const menuData of menusData) {
      if (menuData.isParent) {
        const existingMenu = await this.dataSource.query(
          'SELECT * FROM m_menu WHERE menu_code = $1',
          [menuData.menuCode]
        );

        if (existingMenu.length === 0) {
          await this.dataSource.query(
            'INSERT INTO m_menu (menu_name, menu_code, icon, url, is_parent, sort_order, status, module, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
            [menuData.menuName, menuData.menuCode, menuData.icon, menuData.url, menuData.isParent, menuData.sortOrder, 'active', menuData.module]
          );
          createdCount++;
          console.log(`✅ Parent menu created: ${menuData.menuCode}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Parent menu already exists: ${menuData.menuCode}`);
        }
      }
    }

    // Then, create child menus with parent references
    for (const menuData of menusData) {
      if (!menuData.isParent && menuData.parentCode) {
        const existingMenu = await this.dataSource.query(
          'SELECT * FROM m_menu WHERE menu_code = $1',
          [menuData.menuCode]
        );

        if (existingMenu.length === 0) {
          // Get parent menu ID
          const parentMenu = await this.dataSource.query(
            'SELECT id FROM m_menu WHERE menu_code = $1',
            [menuData.parentCode]
          );

          if (parentMenu.length > 0) {
            await this.dataSource.query(
              'INSERT INTO m_menu (parent_id, menu_name, menu_code, icon, url, is_parent, sort_order, status, module, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())',
              [parentMenu[0].id, menuData.menuName, menuData.menuCode, menuData.icon, menuData.url, menuData.isParent, menuData.sortOrder, 'active', menuData.module]
            );
            createdCount++;
            console.log(`✅ Child menu created: ${menuData.menuCode} (parent: ${menuData.parentCode})`);
          } else {
            console.log(`❌ Parent menu not found: ${menuData.parentCode}`);
          }
        } else {
          skippedCount++;
          console.log(`⏭️  Child menu already exists: ${menuData.menuCode}`);
        }
      }
    }

    console.log(`\n📊 Menu Seeding Summary:`);
    console.log(`   • Created: ${createdCount} menus`);
    console.log(`   • Skipped: ${skippedCount} existing menus`);
  }
}
