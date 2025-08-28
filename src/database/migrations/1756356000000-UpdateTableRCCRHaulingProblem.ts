import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class UpdateTableRCCRHaulingProblem1756356000000 implements MigrationInterface {
  name = 'UpdateTableRCCRHaulingProblem1756356000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambah kolom site_id
    await queryRunner.query(`ALTER TABLE r_ccr_hauling_problem ADD COLUMN site_id INT NULL`);
    
    // Hapus foreign key constraint lama untuk activities_id
    const table = await queryRunner.getTable('r_ccr_hauling_problem');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('activities_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('r_ccr_hauling_problem', foreignKey);
      }
    }
    
    // Tambah foreign key constraint baru untuk activities_id ke tabel m_activities
    await queryRunner.createForeignKey(
      'r_ccr_hauling_problem',
      new TableForeignKey({
        columnNames: ['activities_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_activities',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    
    // Tambah foreign key constraint untuk site_id ke tabel m_sites
    await queryRunner.createForeignKey(
      'r_ccr_hauling_problem',
      new TableForeignKey({
        columnNames: ['site_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_sites',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints
    const table = await queryRunner.getTable('r_ccr_hauling_problem');
    
    if (table) {
      // Hapus foreign key untuk site_id
      const siteForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('site_id') !== -1);
      if (siteForeignKey) {
        await queryRunner.dropForeignKey('r_ccr_hauling_problem', siteForeignKey);
      }
      
      // Hapus foreign key untuk activities_id
      const activitiesForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('activities_id') !== -1);
      if (activitiesForeignKey) {
        await queryRunner.dropForeignKey('r_ccr_hauling_problem', activitiesForeignKey);
      }
    }
    
    // Hapus kolom site_id
    await queryRunner.query(`ALTER TABLE r_ccr_hauling_problem DROP COLUMN site_id`);
    
    // Tambah kembali foreign key constraint lama untuk activities_id ke tabel r_ccr_hauling
    await queryRunner.createForeignKey(
      'r_ccr_hauling_problem',
      new TableForeignKey({
        columnNames: ['activities_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'r_ccr_hauling',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
