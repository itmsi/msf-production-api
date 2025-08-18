import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddSparePartMenus1700000000027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan menu untuk modul spare-part
    await queryRunner.query(`
      INSERT INTO m_menu (menu_name, menu_code, icon, url, is_parent, sort_order, status, module, "createdAt", "updatedAt") 
      VALUES 
        ('Spare Part Dashboard', 'SPARE_PART_DASHBOARD', 'dashboard', '/spare-part/dashboard', false, 1, 'active', 'spare-part', NOW(), NOW()),
        ('Spare Part Master', 'SPARE_PART_MASTER', 'database', NULL, true, 2, 'active', 'spare-part', NOW(), NOW()),
        ('Spare Part Items', 'SPARE_PART_ITEMS', 'inventory', '/spare-part/items', false, 1, 'active', 'spare-part', NOW(), NOW()),
        ('Spare Part Categories', 'SPARE_PART_CATEGORIES', 'category', '/spare-part/categories', false, 2, 'active', 'spare-part', NOW(), NOW()),
        ('Spare Part Suppliers', 'SPARE_PART_SUPPLIERS', 'business', '/spare-part/suppliers', false, 3, 'active', 'spare-part', NOW(), NOW()),
        ('Spare Part Operations', 'SPARE_PART_OPERATIONS', 'settings', NULL, true, 3, 'active', 'spare-part', NOW(), NOW()),
        ('Purchase Orders', 'SPARE_PART_PURCHASE_ORDERS', 'shopping_cart', '/spare-part/purchase-orders', false, 1, 'active', 'spare-part', NOW(), NOW()),
        ('Stock Management', 'SPARE_PART_STOCK_MANAGEMENT', 'inventory_2', '/spare-part/stock', false, 2, 'active', 'spare-part', NOW(), NOW()),
        ('Maintenance Schedule', 'SPARE_PART_MAINTENANCE', 'schedule', '/spare-part/maintenance', false, 3, 'active', 'spare-part', NOW(), NOW()),
        ('Spare Part Reports', 'SPARE_PART_REPORTS', 'assessment', NULL, true, 4, 'active', 'spare-part', NOW(), NOW()),
        ('Inventory Report', 'SPARE_PART_INVENTORY_REPORT', 'bar_chart', '/spare-part/reports/inventory', false, 1, 'active', 'spare-part', NOW(), NOW()),
        ('Usage Report', 'SPARE_PART_USAGE_REPORT', 'pie_chart', '/spare-part/reports/usage', false, 2, 'active', 'spare-part', NOW(), NOW()),
        ('Cost Report', 'SPARE_PART_COST_REPORT', 'attach_money', '/spare-part/reports/cost', false, 3, 'active', 'spare-part', NOW(), NOW())
      ON CONFLICT (menu_code) DO NOTHING
    `);

    // Update parent_id untuk menu child
    await queryRunner.query(`
      UPDATE m_menu 
      SET parent_id = (SELECT id FROM m_menu WHERE menu_code = 'SPARE_PART_MASTER' AND module = 'spare-part')
      WHERE menu_code IN ('SPARE_PART_ITEMS', 'SPARE_PART_CATEGORIES', 'SPARE_PART_SUPPLIERS')
      AND module = 'spare-part'
    `);

    await queryRunner.query(`
      UPDATE m_menu 
      SET parent_id = (SELECT id FROM m_menu WHERE menu_code = 'SPARE_PART_OPERATIONS' AND module = 'spare-part')
      WHERE menu_code IN ('SPARE_PART_PURCHASE_ORDERS', 'SPARE_PART_STOCK_MANAGEMENT', 'SPARE_PART_MAINTENANCE')
      AND module = 'spare-part'
    `);

    await queryRunner.query(`
      UPDATE m_menu 
      SET parent_id = (SELECT id FROM m_menu WHERE menu_code = 'SPARE_PART_REPORTS' AND module = 'spare-part')
      WHERE menu_code IN ('SPARE_PART_INVENTORY_REPORT', 'SPARE_PART_USAGE_REPORT', 'SPARE_PART_COST_REPORT')
      AND module = 'spare-part'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus menu spare-part
    await queryRunner.query(`
      DELETE FROM m_menu 
      WHERE module = 'spare-part'
    `);
  }
}
