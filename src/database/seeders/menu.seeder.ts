import { DataSource } from 'typeorm';

export class MenuSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const menusData = [
      // Dashboard
      { menuName: 'Dashboard', menuCode: 'DASHBOARD', icon: 'dashboard', url: '/dashboard', isParent: false, sortOrder: 1 },
      
      // Master Data
      { menuName: 'Master Data', menuCode: 'MASTER_DATA', icon: 'database', url: null, isParent: true, sortOrder: 2 },
      { menuName: 'Sites', menuCode: 'SITES', icon: 'location', url: '/master/sites', isParent: false, sortOrder: 1, parentCode: 'MASTER_DATA' },
      { menuName: 'Employees', menuCode: 'EMPLOYEES', icon: 'people', url: '/master/employees', isParent: false, sortOrder: 2, parentCode: 'MASTER_DATA' },
      { menuName: 'Roles', menuCode: 'ROLES', icon: 'security', url: '/master/roles', isParent: false, sortOrder: 3, parentCode: 'MASTER_DATA' },
      { menuName: 'Users', menuCode: 'USERS', icon: 'person', url: '/master/users', isParent: false, sortOrder: 4, parentCode: 'MASTER_DATA' },
      { menuName: 'Brands', menuCode: 'BRANDS', icon: 'label', url: '/master/brands', isParent: false, sortOrder: 5, parentCode: 'MASTER_DATA' },
      { menuName: 'Unit Types', menuCode: 'UNIT_TYPES', icon: 'category', url: '/master/unit-types', isParent: false, sortOrder: 6, parentCode: 'MASTER_DATA' },
      { menuName: 'Activities', menuCode: 'ACTIVITIES', icon: 'assignment', url: '/master/activities', isParent: false, sortOrder: 7, parentCode: 'MASTER_DATA' },
      { menuName: 'Operation Points', menuCode: 'OPERATION_POINTS', icon: 'place', url: '/master/operation-points', isParent: false, sortOrder: 8, parentCode: 'MASTER_DATA' },
      { menuName: 'Barges', menuCode: 'BARGES', icon: 'local_shipping', url: '/master/barges', isParent: false, sortOrder: 9, parentCode: 'MASTER_DATA' },
      
      // Operations
      { menuName: 'Operations', menuCode: 'OPERATIONS', icon: 'settings', url: null, isParent: true, sortOrder: 3 },
      { menuName: 'Population', menuCode: 'POPULATION', icon: 'group_work', url: '/operations/population', isParent: false, sortOrder: 1, parentCode: 'OPERATIONS' },
      { menuName: 'Input Barge', menuCode: 'INPUT_BARGE', icon: 'input', url: '/operations/input-barge', isParent: false, sortOrder: 2, parentCode: 'OPERATIONS' },
      { menuName: 'Base Data Production', menuCode: 'BASE_DATA_PRODUCTION', icon: 'data_usage', url: '/operations/base-data-production', isParent: false, sortOrder: 3, parentCode: 'OPERATIONS' },
      { menuName: 'Loss Time', menuCode: 'LOSS_TIME', icon: 'schedule', url: '/operations/loss-time', isParent: false, sortOrder: 4, parentCode: 'OPERATIONS' },
      { menuName: 'Fuel', menuCode: 'FUEL', icon: 'local_gas_station', url: '/operations/fuel', isParent: false, sortOrder: 5, parentCode: 'OPERATIONS' },
      { menuName: 'Plan Production', menuCode: 'PLAN_PRODUCTION', icon: 'production_quantity_limits', url: '/operations/plan-production', isParent: false, sortOrder: 6, parentCode: 'OPERATIONS' },
      { menuName: 'Plan Working Hour', menuCode: 'PLAN_WORKING_HOUR', icon: 'schedule', url: '/operations/plan-working-hour', isParent: false, sortOrder: 7, parentCode: 'OPERATIONS' },
      
      // CCR (Central Control Room)
      { menuName: 'CCR', menuCode: 'CCR', icon: 'control_camera', url: null, isParent: true, sortOrder: 4 },
      { menuName: 'CCR Hauling', menuCode: 'CCR_HAULING', icon: 'local_shipping', url: '/ccr/hauling', isParent: false, sortOrder: 1, parentCode: 'CCR' },
      { menuName: 'CCR Hauling Problem', menuCode: 'CCR_HAULING_PROBLEM', icon: 'error', url: '/ccr/hauling-problem', isParent: false, sortOrder: 2, parentCode: 'CCR' },
      { menuName: 'CCR Barging', menuCode: 'CCR_BARGING', icon: 'local_shipping', url: '/ccr/barging', isParent: false, sortOrder: 3, parentCode: 'CCR' },
      { menuName: 'CCR Barging Problem', menuCode: 'CCR_BARGING_PROBLEM', icon: 'error', url: '/ccr/barging-problem', isParent: false, sortOrder: 4, parentCode: 'CCR' },
      
      // Reports
      { menuName: 'Reports', menuCode: 'REPORTS', icon: 'assessment', url: null, isParent: true, sortOrder: 5 },
      { menuName: 'Production Report', menuCode: 'PRODUCTION_REPORT', icon: 'bar_chart', url: '/reports/production', isParent: false, sortOrder: 1, parentCode: 'REPORTS' },
      { menuName: 'Fuel Report', menuCode: 'FUEL_REPORT', icon: 'pie_chart', url: '/reports/fuel', isParent: false, sortOrder: 2, parentCode: 'REPORTS' },
      { menuName: 'Loss Time Report', menuCode: 'LOSS_TIME_REPORT', icon: 'timeline', url: '/reports/loss-time', isParent: false, sortOrder: 3, parentCode: 'REPORTS' },
      { menuName: 'CCR Report', menuCode: 'CCR_REPORT', icon: 'analytics', url: '/reports/ccr', isParent: false, sortOrder: 4, parentCode: 'REPORTS' },
      
      // Settings
      { menuName: 'Settings', menuCode: 'SETTINGS', icon: 'settings', url: null, isParent: true, sortOrder: 6 },
      { menuName: 'System Settings', menuCode: 'SYSTEM_SETTINGS', icon: 'tune', url: '/settings/system', isParent: false, sortOrder: 1, parentCode: 'SETTINGS' },
      { menuName: 'User Preferences', menuCode: 'USER_PREFERENCES', icon: 'person_pin', url: '/settings/preferences', isParent: false, sortOrder: 2, parentCode: 'SETTINGS' },
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
            'INSERT INTO m_menu (menu_name, menu_code, icon, url, is_parent, sort_order, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
            [menuData.menuName, menuData.menuCode, menuData.icon, menuData.url, menuData.isParent, menuData.sortOrder, 'active']
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
              'INSERT INTO m_menu (parent_id, menu_name, menu_code, icon, url, is_parent, sort_order, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
              [parentMenu[0].id, menuData.menuName, menuData.menuCode, menuData.icon, menuData.url, menuData.isParent, menuData.sortOrder, 'active']
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
