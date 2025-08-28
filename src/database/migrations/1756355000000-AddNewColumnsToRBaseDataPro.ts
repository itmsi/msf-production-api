import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class AddNewColumnsToRBaseDataPro1756355000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM type untuk activity
    await queryRunner.query(`
      CREATE TYPE enum_activity AS ENUM ('hauling', 'barging', 'direct')
    `);

    // Tambahkan kolom dumping_point_op_id
    await queryRunner.addColumn(
      'r_base_data_pro',
      new TableColumn({
        name: 'dumping_point_op_id',
        type: 'int',
        isNullable: true,
        comment: 'ID dumping point operation',
      }),
    );

    // Tambahkan kolom dumping_point_barge_id
    await queryRunner.addColumn(
      'r_base_data_pro',
      new TableColumn({
        name: 'dumping_point_barge_id',
        type: 'int',
        isNullable: true,
        comment: 'ID dumping point barge',
      }),
    );

    // Tambahkan kolom activity
    await queryRunner.addColumn(
      'r_base_data_pro',
      new TableColumn({
        name: 'activity',
        type: 'enum',
        enum: ['hauling', 'barging', 'direct'],
        isNullable: true,
        comment: 'Type of activity',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom activity
    await queryRunner.dropColumn('r_base_data_pro', 'activity');

    // Hapus kolom dumping_point_barge_id
    await queryRunner.dropColumn('r_base_data_pro', 'dumping_point_barge_id');

    // Hapus kolom dumping_point_op_id
    await queryRunner.dropColumn('r_base_data_pro', 'dumping_point_op_id');

    // Hapus ENUM type
    await queryRunner.query(`DROP TYPE IF EXISTS enum_activity`);
  }
}
