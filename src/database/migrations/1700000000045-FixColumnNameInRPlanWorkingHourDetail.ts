import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixColumnNameInRPlanWorkingHourDetail1700000000045
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ubah nama kolom dari plant_working_hour_id menjadi plant_working_hour_id
    // (sebenarnya nama sudah benar, tapi untuk memastikan konsistensi)
    
    // Tambah kolom baru dengan nama yang benar jika belum ada
    const table = await queryRunner.getTable('r_plan_working_hour_detail');
    if (table) {
      const existingColumn = table.findColumnByName('plant_working_hour_id');
      if (!existingColumn) {
        await queryRunner.addColumn(
          'r_plan_working_hour_detail',
          new TableColumn({
            name: 'plant_working_hour_id',
            type: 'int',
            isNullable: false,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tidak ada yang perlu di-rollback karena hanya memastikan kolom ada
  }
}
